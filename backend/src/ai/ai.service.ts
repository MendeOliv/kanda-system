import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { ConfirmationService, buildCartFingerprint } from '../confirmation/confirmation.service';

export const AI_ERROR_FALLBACKS = [
  'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.',
  'Neste momento estou com muitas solicitações. Tente novamente em alguns instantes.',
  'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.',
  'Desculpe, ocorreu um erro ao processar sua mensagem.',
  'Desculpe, não consegui gerar uma resposta no momento.',
];

const SYSTEM_PROMPT = `Você é o assistente de vendas da Kanda no WhatsApp. Responda sempre em português de forma curta, objetiva e útil.

FERRAMENTAS:
- search_catalog: use SEMPRE que o usuário perguntar sobre produtos, preços, estoque ou disponibilidade. Não invente produtos.
- add_to_cart: use quando o usuário quiser adicionar um produto ao carrinho (precisa do productId de uma busca prévia no search_catalog). Confirme o item adicionado mostrando nome, quantidade e subtotal.
- view_cart: use quando o usuário quiser ver o carrinho. Liste os itens, subtotal e total.
- remove_from_cart: use quando o usuário quiser remover um produto do carrinho. REMOÇÃO TOTAL: o produto é retirado por completo, nunca é um decremento de quantidade.
- clear_cart: use quando o usuário quiser esvaziar o carrinho.
- request_order_confirmation: use quando o usuário demonstrar intenção de finalizar a compra (ex: "fechar pedido", "finalizar", "confirmar"). Esta ferramenta devolve o resumo do carrinho e registra uma confirmação pendente; apresente o resumo e pergunte se o usuário CONFIRMA o pedido. NÃO crie o pedido ainda.
- create_order: use APENAS quando o usuário confirmar explicitamente o pedido numa mensagem POSTERIOR ao resumo (ex: "sim, confirmo", "pode fechar"). Se não existir uma confirmação pendente válida, o sistema recusa a criação: nesse caso apresente o resumo e peça a confirmação. Nunca chame sem confirmação explícita.

REGRAS:
- Baseie informações de produtos exclusivamente nos resultados das ferramentas.
- Nunca prometa pagamento ou entrega: se perguntarem, diga que o pagamento e a entrega serão combinados após a confirmação do pedido.
- Um productId só é válido se veio de um search_catalog na conversa.`;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private productsService: ProductsService,
    private cartService: CartService,
    private ordersService: OrdersService,
    private confirmationService: ConfirmationService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.6-flash';
      this.model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });
      this.logger.log(`AI Service initialized with model: ${modelName}`);
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI Service will not function.');
    }
  }

  get isConfigured(): boolean {
    return !!this.model;
  }

  /**
   * Resolve or lazily create the WhatsApp customer as a User so that the
   * existing CartService/OrdersService (keyed by user.id) work for WhatsApp
   * conversations without auth. The identifier is the conversation customerId
   * (WhatsApp JID, e.g. "258...@lid" or "...@s.whatsapp.net").
   */
  async resolveOrCreateWhatsAppUser(customerId: string) {
    let user = await this.prisma.user.findUnique({ where: { firebaseUid: customerId } });
    if (user) return user;

    let phone = customerId;
    if (customerId.includes('@')) {
      const [local, domain] = customerId.split('@');
      if (domain === 'lid') {
        // LID cannot be reversed to a phone number; use the LID as unique phone key.
        phone = `lid:${local}`;
      } else {
        phone = local;
      }
    }

    user = await this.prisma.user.findUnique({ where: { phone } });
    if (user) return user;

    return this.prisma.user.create({
      data: {
        firebaseUid: customerId,
        phone,
        firstName: 'Cliente WhatsApp',
        role: 'USER',
        status: 'active',
      },
    });
  }

  async generateResponse(message: string): Promise<string> {
    return this.generateResponseWithHistory(message, []);
  }

  private buildToolDeclarations() {
    return [
      {
        name: 'search_catalog',
        description:
          'Search for products in the catalog by query string. Returns product information including id, name, price, stock, and category.',
        parameters: {
          type: 'object' as const,
          properties: {
            q: {
              type: 'string' as const,
              description: 'The search query (product name, SKU, description, or category)',
            },
          },
          required: ['q'] as const,
        },
      },
      {
        name: 'add_to_cart',
        description: 'Add a product to the customer cart. Requires a productId obtained from search_catalog.',
        parameters: {
          type: 'object' as const,
          properties: {
            productId: { type: 'string' as const, description: 'Product id returned by search_catalog' },
            quantity: { type: 'number' as const, description: 'Quantity to add (default 1)' },
          },
          required: ['productId'] as const,
        },
      },
      {
        name: 'view_cart',
        description: 'Show the current contents of the customer cart (items, quantities, subtotal, total).',
        parameters: { type: 'object' as const, properties: {}, required: [] as const },
      },
      {
        name: 'remove_from_cart',
        description: "Remove the specified product completely from the customer's cart.",
        parameters: {
          type: 'object' as const,
          properties: {
            productId: { type: 'string' as const, description: 'Product id to remove from the cart' },
          },
          required: ['productId'] as const,
        },
      },
      {
        name: 'clear_cart',
        description: 'Remove ALL items from the customer cart.',
        parameters: { type: 'object' as const, properties: {}, required: [] as const },
      },
      {
        name: 'request_order_confirmation',
        description:
          'Build the order summary from the current cart, register a pending confirmation and ask the customer to confirm. Returns the summary; does NOT create the order.',
        parameters: { type: 'object' as const, properties: {}, required: [] as const },
      },
      {
        name: 'create_order',
        description:
          'Create the real order from the confirmed cart. ONLY call after the customer explicitly confirmed, in a PREVIOUS message, the summary returned by request_order_confirmation. The order is refused when no valid confirmation is pending.',
        parameters: {
          type: 'object' as const,
          properties: {
            deliveryZone: {
              type: 'string' as const,
              description: 'Delivery zone: KK5000 (default) or KILAMBA',
            },
            deliveryReference: { type: 'string' as const, description: 'Delivery reference/location of the customer' },
            paymentMethod: { type: 'string' as const, description: 'CASH (default) or APPYPAY' },
            notes: { type: 'string' as const, description: 'Optional order notes' },
          },
          required: [] as const,
        },
      },
    ];
  }

  private formatCartForAI(cart: any) {
    const items = (cart?.items ?? []).map((i: any) => ({
      productId: i.productId,
      name: i.product?.name,
      quantity: i.quantity,
      unitPrice: Number(i.price),
      lineTotal: Number(i.price) * i.quantity,
    }));
    const subtotal = Number(cart?.subtotal ?? 0);
    const deliveryFee = Number(cart?.deliveryFee ?? 0);
    const total = Number(cart?.total ?? 0);
    return { items, isEmpty: items.length === 0, subtotal, deliveryFee, total };
  }

  private buildOrderSummary(summary: any) {
    const lines = (summary.items ?? []).map(
      (i: any) => `${i.quantity}x ${i.product?.name ?? i.name} — ${Number(i.price) * i.quantity} Kz`,
    );
    return [
      'Resumo do pedido:',
      ...lines,
      `Subtotal: ${summary.subtotal} Kz`,
      `Taxa de entrega: ${summary.deliveryFee} Kz`,
      `Total: ${summary.total} Kz`,
      '',
      'Confirma este pedido? (sim/não)',
    ].join('\n');
  }

  /**
   * Execute one tool call. All cart/order operations are delegated to the
   * existing CartService/OrdersService to avoid duplicate business logic.
   * externalMessageId keeps the idempotency contract of CartService/OrdersService.
   */
  /**
   * One inbound WhatsApp message normally triggers a single cart mutation, and the
   * raw externalMessageId is used as the idempotency key. When a single message
   * triggers several mutations, the extra ones get a deterministic scoped token
   * ("<id>#<n>") so they do not collide on the ProcessedMessage unique key while a
   * retry of the same message replays the very same tokens (still idempotent).
   */
  private cartMutationToken(baseExternalMessageId: string, counter: { value: number }): string {
    if (!baseExternalMessageId) return '';
    const index = counter.value++;
    return index === 0 ? baseExternalMessageId : `${baseExternalMessageId}#${index}`;
  }

  private async executeToolCall(
    call: { name: string; args: any },
    customerId: string | undefined,
    externalMessageId: string,
    cartMutationCounter: { value: number },
  ): Promise<{ ok: boolean; result: any }> {
    const customerRequired = call.name !== 'search_catalog';
    if (customerRequired && !customerId) {
      return { ok: false, result: { error: 'Cliente não identificado nesta conversa.' } };
    }
    switch (call.name) {
      case 'search_catalog': {
        const results = await this.productsService.search(String(call.args?.q ?? ''));
        return {
          ok: true,
          result: {
            results: results.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              category: p.category,
              price: p.price,
              discountPrice: p.discountPrice,
              stock: p.stock,
              sku: p.sku,
            })),
          },
        };
      }
      case 'add_to_cart': {
        const user = await this.resolveOrCreateWhatsAppUser(customerId);
        const quantity = Math.max(1, Math.floor(Number(call.args?.quantity ?? 1)));
        const { cart, idempotent } = await this.cartService.addItem(
          user.id,
          String(call.args?.productId),
          quantity,
          this.cartMutationToken(externalMessageId, cartMutationCounter),
        );
        return { ok: true, result: { idempotent: !!idempotent, cart: this.formatCartForAI(cart) } };
      }
      case 'view_cart': {
        const user = await this.resolveOrCreateWhatsAppUser(customerId);
        const cart = await this.cartService.getCart(user.id);
        return { ok: true, result: { cart: this.formatCartForAI(cart) } };
      }
      case 'remove_from_cart': {
        // TOTAL REMOVAL: the whole cart line is deleted. Never a quantity decrement.
        const user = await this.resolveOrCreateWhatsAppUser(customerId);
        const { cart } = await this.cartService.removeItem(
          user.id,
          String(call.args?.productId),
          this.cartMutationToken(externalMessageId, cartMutationCounter),
        );
        return { ok: true, result: { cart: this.formatCartForAI(cart) } };
      }
      case 'clear_cart': {
        const user = await this.resolveOrCreateWhatsAppUser(customerId);
        const { cart } = await this.cartService.clearCart(
          user.id,
          this.cartMutationToken(externalMessageId, cartMutationCounter),
        );
        return { ok: true, result: { cart: this.formatCartForAI(cart) } };
      }
      case 'request_order_confirmation': {
        const user = await this.resolveOrCreateWhatsAppUser(customerId);
        const cart = await this.cartService.getCart(user.id);
        const formatted = this.formatCartForAI(cart);
        if (formatted.isEmpty) {
          await this.confirmationService.invalidate(user.id);
          return { ok: false, result: { error: 'Carrinho vazio. Adicione produtos antes de finalizar o pedido.' } };
        }
        // Persist CONFIRMATION_PENDING bound to exactly these cart contents.
        await this.confirmationService.requestConfirmation(
          user.id,
          buildCartFingerprint(cart.items ?? []),
          { externalMessageId },
        );
        return { ok: true, result: { summary: formatted, confirmationRequired: true } };
      }
      case 'create_order': {
        const user = await this.resolveOrCreateWhatsAppUser(customerId);
        const cart = await this.cartService.getCart(user.id);
        const formatted = this.formatCartForAI(cart);
        if (formatted.isEmpty) {
          await this.confirmationService.invalidate(user.id);
          return { ok: false, result: { error: 'Carrinho vazio ou não encontrado.' } };
        }

        // Deterministic gate: the Gemini instruction is not the protection.
        const gate = await this.confirmationService.verify(
          user.id,
          buildCartFingerprint(cart.items ?? []),
          externalMessageId,
        );
        if (!gate.allowed) {
          this.logger.warn(`create_order refused (${externalMessageId}): ${gate.reason}`);
          return { ok: false, result: { error: gate.reason, confirmationRequired: true } };
        }

        const created = await this.ordersService.create(
          {
            deliveryZone: call.args?.deliveryZone,
            deliveryReference: call.args?.deliveryReference,
            paymentMethod: call.args?.paymentMethod,
            notes: call.args?.notes,
            externalMessageId,
          },
          user.id,
        );
        const order: any = created.order ?? {};
        // Successful order clears the pending confirmation.
        await this.confirmationService.clear(user.id);
        return {
          ok: true,
          result: {
            success: true,
            orderNumber: created.orderNumber,
            totalAmount: Number(created.totalAmount ?? order.totalAmount ?? 0),
          },
        };
      }
      default:
        return { ok: false, result: { error: `Unknown tool: ${call.name}` } };
    }
  }

  async generateResponseWithHistory(
    message: string,
    conversationHistory: any[],
    customerId?: string,
    externalMessageId: string = '',
  ): Promise<string> {
    if (!this.isConfigured) {
      return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
    }

    const contents: any[] = [];

    if (conversationHistory && conversationHistory.length > 0) {
      const filteredHistory = conversationHistory.filter((msg) => {
        if (!msg.content) return true;
        return !AI_ERROR_FALLBACKS.some((fallback) => msg.content.includes(fallback));
      });

      let sortedHistory = [...filteredHistory];
      if (sortedHistory[0]?.timestamp && sortedHistory[sortedHistory.length - 1]?.timestamp) {
        sortedHistory.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      }

      for (const msg of sortedHistory) {
        const role = msg.role.toLowerCase() === 'user' ? 'user' : 'model';
        let parts = [{ text: msg.content }];
        if (msg.metadata?.parts) {
          parts = msg.metadata.parts;
        }
        contents.push({ role, parts });
      }
    }

    const lastHistoryMsg = contents[contents.length - 1];
    const isDuplicated =
      lastHistoryMsg &&
      lastHistoryMsg.role === 'user' &&
      lastHistoryMsg.parts.some((p: any) => p.text === message);

    if (!isDuplicated) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const tools = [{ functionDeclarations: this.buildToolDeclarations() }];

    try {
      const initialContents = JSON.parse(JSON.stringify(contents));
      const result = await this.model.generateContent({
        contents: initialContents,
        tools,
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
      });

      const response = await result.response;
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const functionCalls = parts.filter((p: any) => p.functionCall);

      if (functionCalls.length > 0) {
        this.logger.log(`Found ${functionCalls.length} function calls`);

        // Preserve the model's tool-request turn exactly (keeps thoughtSignature).
        contents.push({ role: 'model', ...JSON.parse(JSON.stringify(candidate.content)) });

        // Per-turn counter used to scope the idempotency token of multiple cart mutations.
        const cartMutationCounter = { value: 0 };

        for (const part of functionCalls) {
          const call = part.functionCall;
          this.logger.log(`Executing tool ${call.name} with args ${JSON.stringify(call.args ?? {})}`);
          let toolResult: { ok: boolean; result: any };
          try {
            toolResult = await this.executeToolCall(
              call,
              customerId,
              externalMessageId,
              cartMutationCounter,
            );
          } catch (toolError: any) {
            this.logger.error(`Tool ${call.name} failed: ${toolError.message}`, toolError.stack);
            toolResult = { ok: false, result: { error: toolError?.message ?? 'Tool execution failed' } };
          }
          contents.push({
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: call.name,
                  response: toolResult.result,
                },
              },
            ],
          });
        }

        const finalResult = await this.model.generateContent({
          contents,
          tools,
          toolConfig: { functionCallingConfig: { mode: 'NONE' } },
        });

        const finalResponse = await finalResult.response;
        const finalText = finalResponse.text();

        if (!finalText || finalText.trim() === '') {
          this.logger.warn('Gemini retornou resposta vazia após function call');
          return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
        }
        return finalText.trim();
      }

      const text = response.text();
      if (!text || text.trim() === '') {
        this.logger.warn('Gemini retornou resposta vazia');
        return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
      }
      return text.trim();
    } catch (error) {
      if (error?.status === 429) {
        this.logger.error('[AIService] Gemini quota exceeded (429)');
        if (error.retryDelay) {
          this.logger.error(`Retry delay: ${error.retryDelay}`);
        }
        return 'Neste momento estou com muitas solicitações. Tente novamente em alguns instantes.';
      }
      this.logger.error(`Error in AIService: ${error.message}`, error.stack);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
    }
  }
}
