const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      };
    }),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { ConfirmationService } from '../confirmation/confirmation.service';

const prismaMock: any = {
  user: { findUnique: jest.fn(), create: jest.fn() },
};

const waUser = {
  id: 'user-1',
  firebaseUid: '25838925955116@lid',
  phone: 'lid:25838925955116',
  firstName: 'Cliente WhatsApp',
  role: 'USER',
  status: 'active',
};

const confirmationServiceMock = {
  requestConfirmation: jest.fn(),
  getPending: jest.fn(),
  invalidate: jest.fn(),
  clear: jest.fn(),
  verify: jest.fn(),
};

const cartServiceMock = {
  getCart: jest.fn(),
  getCartWithItems: jest.fn(),
  addItem: jest.fn(),
  updateItem: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
};

const ordersServiceMock = {
  create: jest.fn(),
};

describe('AIService', () => {
  let service: AIService;
  let configService: ConfigService;
  let productsService: ProductsService;
  let moduleRef: TestingModule;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              if (key === 'GEMINI_MODEL') return 'gemini-test';
              return null;
            }),
          },
        },
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductsService, useValue: { search: jest.fn() } },
        { provide: CartService, useValue: cartServiceMock },
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: ConfirmationService, useValue: confirmationServiceMock },
      ],
    }).compile();

    service = moduleRef.get<AIService>(AIService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    productsService = moduleRef.get<ProductsService>(ProductsService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with API key', () => {
    expect(service['isConfigured']).toBe(true);
  });

  it('should return error message when not configured', async () => {
    const noKeyModule: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return null;
              if (key === 'GEMINI_MODEL') return 'gemini-test';
              return null;
            }),
          },
        },
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductsService, useValue: { search: jest.fn().mockResolvedValue([]) } },
        { provide: CartService, useValue: cartServiceMock },
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: ConfirmationService, useValue: confirmationServiceMock },
      ],
    }).compile();

    const noKeyService = noKeyModule.get<AIService>(AIService);
    expect(noKeyService['isConfigured']).toBe(false);

    const result = await noKeyService.generateResponse('Hello');
    expect(result).toBe('Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.');

    await noKeyModule.close();
  });

  it('should generate a response when configured (no function call)', async () => {
    const mockResponseText = 'Olá! Como posso ajudar?';
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponseText,
        candidates: [{ content: { parts: [] } }],
      },
    });

    const result = await service.generateResponse('Olá');
    expect(result).toBe(mockResponseText);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg.contents).toHaveLength(1);
    expect(promptArg.contents[0]).toEqual({
      role: 'user',
      parts: [{ text: 'Olá' }],
    });
    expect(promptArg.tools).toBeDefined();
    expect(promptArg.toolConfig.functionCallingConfig.mode).toBe('AUTO');
  });

  describe('function calling', () => {
    const mockSearchResults = [
      {
        id: 1,
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante Coca-Cola lata 350ml',
        category: { name: 'Bebidas' },
        price: 5.99,
        discountPrice: null,
        stock: 100,
        sku: 'CC350ML',
      },
    ];

    it('should execute function call with results and return final response', async () => {
      // First call: returns functionCall
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Coca cola' },
                      id: 'call_123',
                    },
                    thoughtSignature: 'EpcCCpQCARFNMg/...',
                  },
                ],
              },
            },
          ],
        },
      });

      // Second call: returns final text response
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Encontrei Coca-Cola 350ml por R$ 5,99.',
          candidates: [{ content: { parts: [] } }],
        },
      });

      // Mock ProductsService.search
      (productsService.search as jest.Mock).mockResolvedValueOnce(mockSearchResults);

      const result = await service.generateResponseWithHistory('Coca cola', []);

      expect(result).toBe('Encontrei Coca-Cola 350ml por R$ 5,99.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(productsService.search).toHaveBeenCalledWith('Coca cola');

      // Validate first call contents
      const firstCall = mockGenerateContent.mock.calls[0][0];
      expect(firstCall.contents).toEqual([
        { role: 'user', parts: [{ text: 'Coca cola' }] },
      ]);
      expect(firstCall.tools).toBeDefined();
      expect(firstCall.toolConfig.functionCallingConfig.mode).toBe('AUTO');

      // Validate second call contents (the critical part)
      const secondCall = mockGenerateContent.mock.calls[1][0];
      // Should have: user message, model functionCall, user functionResponse
      expect(secondCall.contents).toHaveLength(3);
      expect(secondCall.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Coca cola' }],
      });
      // The functionCall should be nested correctly: parts[0].functionCall
      expect(secondCall.contents[1]).toEqual({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'search_catalog',
              args: { q: 'Coca cola' },
              id: 'call_123',
            },
            thoughtSignature: 'EpcCCpQCARFNMg/...',
          },
        ],
      });
      // The functionResponse should be nested correctly: parts[0].functionResponse
      expect(secondCall.contents[2]).toEqual({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'search_catalog',
              response: { results: mockSearchResults },
            },
          },
        ],
      });
      // Second call should have toolConfig with mode: 'NONE'
      expect(secondCall.toolConfig).toBeDefined();
      expect(secondCall.toolConfig.functionCallingConfig.mode).toBe('NONE');
    });

    it('should execute function call without results and return final response', async () => {
      // First call: returns functionCall
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Pepsi' },
                      id: 'call_456',
                    },
                    thoughtSignature: 'EpcCCpQCARFNMg/...',
                  },
                ],
              },
            },
          ],
        },
      });

      // Second call: returns final text response
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Não encontrei produtos para Pepsi.',
          candidates: [{ content: { parts: [] } }],
        },
      });

      // Mock ProductsService.search to return empty array
      (productsService.search as jest.Mock).mockResolvedValueOnce([]);

      const result = await service.generateResponseWithHistory('Pepsi', []);

      expect(result).toBe('Não encontrei produtos para Pepsi.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(productsService.search).toHaveBeenCalledWith('Pepsi');

      // Validate second call contents for empty results
      const secondCall = mockGenerateContent.mock.calls[1][0];
      expect(secondCall.contents).toHaveLength(3);
      expect(secondCall.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Pepsi' }],
      });
      expect(secondCall.contents[1]).toEqual({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'search_catalog',
              args: { q: 'Pepsi' },
              id: 'call_456',
            },
            thoughtSignature: 'EpcCCpQCARFNMg/...',
          },
        ],
      });
      expect(secondCall.contents[2]).toEqual({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'search_catalog',
              response: { results: [] },
            },
          },
        ],
      });
      expect(secondCall.toolConfig.functionCallingConfig.mode).toBe('NONE');
    });

    it('should validate payload structure - functionCall must be nested correctly', async () => {
      // This test ensures we don't have the bug where functionCall is flattened
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Test' },
                      id: 'call_789',
                    },
                    thoughtSignature: 'EpcCCpQCARFNMg/...',
                  },
                ],
              },
            },
          ],
        },
      });

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Resposta final',
          candidates: [{ content: { parts: [] } }],
        },
      });

      (productsService.search as jest.Mock).mockResolvedValueOnce([{ id: 1, name: 'Test Product' }]);

      await service.generateResponseWithHistory('Test', []);

      const secondCall = mockGenerateContent.mock.calls[1][0];
      // Extract the model's functionCall part
      const modelPart = secondCall.contents[1].parts[0];
      // Validate that it has functionCall property (not flattened)
      expect(modelPart).toHaveProperty('functionCall');
      expect(modelPart.functionCall).toEqual({
        name: 'search_catalog',
        args: { q: 'Test' },
        id: 'call_789',
      });
      // Ensure it does NOT have the flattened structure (name, args, id directly in parts[0])
      expect(modelPart).not.toHaveProperty('name');
      expect(modelPart).not.toHaveProperty('args');
      expect(modelPart).not.toHaveProperty('id');
      // Ensure thoughtSignature is preserved
      expect(modelPart).toHaveProperty('thoughtSignature');
      expect(modelPart.thoughtSignature).toBe('EpcCCpQCARFNMg/...');
    });

    it('should not duplicate user message in history', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Dupe test' },
                      id: 'call_dup',
                    },
                    thoughtSignature: 'EpcCCpQCARFNMg/...',
                  },
                ],
              },
            },
          ],
        },
      });

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Sem duplicação',
          candidates: [{ content: { parts: [] } }],
        },
      });

      (productsService.search as jest.Mock).mockResolvedValueOnce([]);

      // Provide history with one previous user message
      const history = [
        { role: 'USER', content: 'Olá' },
        { role: 'ASSISTANT', content: 'Oi!' },
      ];

      await service.generateResponseWithHistory('Dupe test', history);

      const secondCall = mockGenerateContent.mock.calls[1][0];
      // Contents should be:
      // 0: history[0] (USER: Olá) -> role user
      // 1: history[1] (ASSISTANT: Oi!) -> role model
      // 2: current user message (Dupe test) -> role user
      // 3: model functionCall
      // 4: user functionResponse
      expect(secondCall.contents).toHaveLength(5);
      expect(secondCall.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Olá' }],
      });
      expect(secondCall.contents[1]).toEqual({
        role: 'model',
        parts: [{ text: 'Oi!' }],
      });
      expect(secondCall.contents[2]).toEqual({
        role: 'user',
        parts: [{ text: 'Dupe test' }],
      });
      expect(secondCall.contents[3]).toEqual({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'search_catalog',
              args: { q: 'Dupe test' },
              id: 'call_dup',
            },
            thoughtSignature: 'EpcCCpQCARFNMg/...',
          },
        ],
      });
      expect(secondCall.contents[4]).toEqual({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'search_catalog',
              response: { results: [] },
            },
          },
        ],
      });
      // Ensure the current user message appears exactly once (at index 2)
      const userMessageCount = secondCall.contents.filter(
        c => c.role === 'user' && c.parts[0].text === 'Dupe test'
      ).length;
      expect(userMessageCount).toBe(1);
    });
  });

  it('should handle empty response from Gemini', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '',
        candidates: [{ content: { parts: [] } }],
      },
    });

    const result = await service.generateResponse('Hello');
    expect(result).toBe('Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.');
  });

  it('should handle error from Gemini API', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

    const result = await service.generateResponse('Hello');
    expect(result).toBe('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
  });

  // NEW TESTS FOR AI-02.3

  it('should handle Gemini 429 quota exceeded error', async () => {
    const mockError: any = new Error('Quota exceeded');
    mockError.status = 429;
    mockError.retryDelay = '46.375130808s';
    
    mockGenerateContent.mockRejectedValueOnce(mockError);

    const result = await service.generateResponseWithHistory('Tem coca cola?', []);

    expect(result).toBe('Neste momento estou com muitas solicitações. Tente novamente em alguns instantes.');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1); // Only one call, no retry
    
    // Verify that error was logged appropriately (we can't test logger directly easily,
    // but we can verify the service didn't crash and returned the expected message)
  });

  it('should not include AI error messages in conversation history', async () => {
    // First call: returns functionCall
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: 'search_catalog',
                    args: { q: 'Test' },
                    id: 'call_123',
                  },
                  thoughtSignature: 'EpcCCpQCARFNMg/...',
                },
              ],
            },
          },
        ],
      },
    });

    // Second call: returns final text response
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'Resposta final',
        candidates: [{ content: { parts: [] } }],
      },
    });

    (productsService.search as jest.Mock).mockResolvedValueOnce([{ id: 1, name: 'Test Product' }]);

    // Provide history containing known AI error messages
    const history = [
      { role: 'USER', content: 'Olá' },
      { role: 'ASSISTANT', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' },
      { role: 'ASSISTANT', content: 'Desculpe, não consegui gerar uma resposta no momento.' },
      { role: 'USER', content: 'Como vai?' },
      { role: 'ASSISTANT', content: 'Estou bem, e você?' }, // This should be included
    ];

    await service.generateResponseWithHistory('Tem coca cola?', history);

    // Verify that the second call contents ONLY includes:
    // - Valid history messages (Olá, Como vai?, Estou bem, e você?)
    // - Current user message (Tem coca cola?)
    // - Function call
    // - Function response
    // 
    // AND does NOT include the error messages
    const secondCall = mockGenerateContent.mock.calls[1][0];
    
    // Count total contents
    expect(secondCall.contents.length).toBeGreaterThanOrEqual(4);
    
    // Check that error messages are NOT present
    const errorMessage1 = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    const errorMessage2 = 'Desculpe, não consegui gerar uma resposta no momento.';
    
    const hasErrorMessage1 = secondCall.contents.some(
      content => content.role === 'model' && 
                content.parts[0]?.text === errorMessage1
    );
    
    const hasErrorMessage2 = secondCall.contents.some(
      content => content.role === 'model' && 
                content.parts[0]?.text === errorMessage2
    );
    
    expect(hasErrorMessage1).toBe(false);
    expect(hasErrorMessage2).toBe(false);
    
    // Check that valid messages ARE present
    const hasValidUserMessage = secondCall.contents.some(
      content => content.role === 'user' && 
                content.parts[0]?.text === 'Olá'
    );
    
    const hasValidAssistantMessage = secondCall.contents.some(
      content => content.role === 'model' && 
                content.parts[0]?.text === 'Estou bem, e você?'
    );
    
    expect(hasValidUserMessage).toBe(true);
    expect(hasValidAssistantMessage).toBe(true);
  });

  /* ================================================================ */
  /*  CART-02 / CONFIRMATION GATE / ORDER via the real tool chain       */
  /* ================================================================ */

  describe('conversation history and WhatsApp identity', () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(waUser);
    });

    it('sends the stored history in chronological order even when it is out of order', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'ok', candidates: [{ content: { parts: [] } }] },
      });

      const history = [
        { role: 'model', content: 'Terceira', timestamp: new Date('2026-09-19T10:02:00Z') },
        { role: 'user', content: 'Primeira', timestamp: new Date('2026-09-19T10:00:00Z') },
        { role: 'model', content: 'Segunda', timestamp: new Date('2026-09-19T10:01:00Z') },
      ];

      await service.generateResponseWithHistory('nova mensagem', history);

      const contents = mockGenerateContent.mock.calls[0][0].contents;
      expect(contents.map((c: any) => c.parts[0].text)).toEqual([
        'Primeira',
        'Segunda',
        'Terceira',
        'nova mensagem',
      ]);
    });

    it('preserves a LID identifier instead of trying to reverse it into a phone number', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 'user-9' });

      const user = await service.resolveOrCreateWhatsAppUser('25838925955116@lid');

      expect(user.id).toBe('user-9');
      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(1, {
        where: { firebaseUid: '25838925955116@lid' },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firebaseUid: '25838925955116@lid',
          phone: 'lid:25838925955116',
        }),
      });
    });

    it('derives the phone from a regular WhatsApp JID', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ id: 'user-10' });

      await service.resolveOrCreateWhatsAppUser('244900000000@s.whatsapp.net');

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ phone: '244900000000' }),
      });
    });

    it('reuses the existing user instead of creating a duplicate', async () => {
      const result = await service.resolveOrCreateWhatsAppUser('25838925955116@lid');

      expect(result).toBe(waUser);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('cart, confirmation and order tools', () => {
    const toolCallResponse = (...calls: Array<{ name: string; args: any }>) => ({
      response: {
        candidates: [
          {
            content: {
              parts: calls.map((c) => ({ functionCall: c, thoughtSignature: 'sig' })),
            },
          },
        ],
      },
    });

    const finalTextResponse = (text: string) => ({
      response: { text: () => text, candidates: [{ content: { parts: [] } }] },
    });

    const cartWith = (items: any[]) => ({
      items,
      subtotal: items.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
      deliveryFee: 500,
      total: items.reduce((s, i) => s + Number(i.price) * i.quantity, 0) + 500,
    });

    const banana = {
      productId: 'p1',
      quantity: 2,
      price: 100,
      product: { id: 'p1', name: 'Banana' },
    };

    /** Last functionResponse sent back to Gemini. */
    const lastFunctionResponse = (callIndex = 1) => {
      const call = mockGenerateContent.mock.calls[callIndex][0];
      return call.contents[call.contents.length - 1].parts[0].functionResponse;
    };

    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(waUser);
      confirmationServiceMock.invalidate.mockResolvedValue(0);
      confirmationServiceMock.clear.mockResolvedValue(0);
    });

    it('propagates the inbound externalMessageId to CartService through the tool chain', async () => {
      cartServiceMock.addItem.mockResolvedValue({ cart: cartWith([banana]), idempotent: false });
      mockGenerateContent.mockResolvedValueOnce(
        toolCallResponse({ name: 'add_to_cart', args: { productId: 'p1', quantity: 2 } }),
      );
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Adicionei 2 bananas.'));

      const result = await service.generateResponseWithHistory(
        'quero 2 bananas',
        [],
        '25838925955116@lid',
        'wa-msg-42',
      );

      expect(result).toBe('Adicionei 2 bananas.');
      // customerId resolved the user and the raw inbound id was preserved
      expect(cartServiceMock.addItem).toHaveBeenCalledWith('user-1', 'p1', 2, 'wa-msg-42');
    });

    it('scopes the idempotency token when one message triggers two cart mutations', async () => {
      cartServiceMock.addItem.mockResolvedValue({ cart: cartWith([banana]), idempotent: false });
      mockGenerateContent.mockResolvedValueOnce(
        toolCallResponse(
          { name: 'add_to_cart', args: { productId: 'p1', quantity: 1 } },
          { name: 'add_to_cart', args: { productId: 'p2', quantity: 1 } },
        ),
      );
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Adicionei os dois.'));

      await service.generateResponseWithHistory('adiciona banana e leite', [], '25838925955116@lid', 'wa-msg-7');

      // Both mutations run (no ProcessedMessage collision) and stay deterministic for retries
      expect(cartServiceMock.addItem).toHaveBeenNthCalledWith(1, 'user-1', 'p1', 1, 'wa-msg-7');
      expect(cartServiceMock.addItem).toHaveBeenNthCalledWith(2, 'user-1', 'p2', 1, 'wa-msg-7#1');
    });

    it('remove_from_cart delegates a TOTAL removal to CartService', async () => {
      cartServiceMock.removeItem.mockResolvedValue({ cart: cartWith([]) });
      mockGenerateContent.mockResolvedValueOnce(
        toolCallResponse({ name: 'remove_from_cart', args: { productId: 'p1' } }),
      );
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Removi a banana.'));

      await service.generateResponseWithHistory('remove as bananas', [], '25838925955116@lid', 'wa-msg-3');

      expect(cartServiceMock.removeItem).toHaveBeenCalledWith('user-1', 'p1', 'wa-msg-3');
      expect(cartServiceMock.updateItem).not.toHaveBeenCalled();
    });

    it('declares remove_from_cart as a complete removal of the product', () => {
      const declarations = (service as any).buildToolDeclarations();
      const removeTool = declarations.find((d: any) => d.name === 'remove_from_cart');
      expect(removeTool.description).toBe(
        "Remove the specified product completely from the customer's cart.",
      );
      expect(removeTool.parameters.required).toEqual(['productId']);
    });

    it('request_order_confirmation persists a pending confirmation bound to the cart', async () => {
      cartServiceMock.getCart.mockResolvedValue(cartWith([banana]));
      confirmationServiceMock.requestConfirmation.mockResolvedValue({ id: 'pc1' });
      mockGenerateContent.mockResolvedValueOnce(
        toolCallResponse({ name: 'request_order_confirmation', args: {} }),
      );
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Confirma este pedido?'));

      await service.generateResponseWithHistory('quero finalizar', [], '25838925955116@lid', 'wa-msg-10');

      expect(confirmationServiceMock.requestConfirmation).toHaveBeenCalledWith(
        'user-1',
        'p1:2:100',
        { externalMessageId: 'wa-msg-10' },
      );
      // The summary is shown, the order is NOT created
      expect(ordersServiceMock.create).not.toHaveBeenCalled();
    });

    it('request_order_confirmation refuses an empty cart and clears any pending state', async () => {
      cartServiceMock.getCart.mockResolvedValue(cartWith([]));
      mockGenerateContent.mockResolvedValueOnce(
        toolCallResponse({ name: 'request_order_confirmation', args: {} }),
      );
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Seu carrinho está vazio.'));

      await service.generateResponseWithHistory('finalizar', [], '25838925955116@lid', 'wa-msg-11');

      expect(confirmationServiceMock.requestConfirmation).not.toHaveBeenCalled();
      expect(confirmationServiceMock.invalidate).toHaveBeenCalledWith('user-1');
      expect(lastFunctionResponse().response.error).toContain('Carrinho vazio');
    });

    it('BLOCKS create_order when there is no valid pending confirmation', async () => {
      cartServiceMock.getCart.mockResolvedValue(cartWith([banana]));
      confirmationServiceMock.verify.mockResolvedValue({
        allowed: false,
        reason: 'Nenhuma confirmação pendente.',
      });
      mockGenerateContent.mockResolvedValueOnce(toolCallResponse({ name: 'create_order', args: {} }));
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Preciso da sua confirmação.'));

      await service.generateResponseWithHistory('sim', [], '25838925955116@lid', 'wa-msg-12');

      expect(confirmationServiceMock.verify).toHaveBeenCalledWith('user-1', 'p1:2:100', 'wa-msg-12');
      expect(ordersServiceMock.create).not.toHaveBeenCalled();
      expect(lastFunctionResponse().response.confirmationRequired).toBe(true);
    });

    it('ALLOWS create_order with a valid pending confirmation and clears it afterwards', async () => {
      cartServiceMock.getCart.mockResolvedValue(cartWith([banana]));
      confirmationServiceMock.verify.mockResolvedValue({ allowed: true });
      ordersServiceMock.create.mockResolvedValue({
        orderNumber: 'KL-4242',
        totalAmount: 700,
        order: { totalAmount: 700 },
      });
      mockGenerateContent.mockResolvedValueOnce(toolCallResponse({ name: 'create_order', args: {} }));
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Pedido KL-4242 criado!'));

      const result = await service.generateResponseWithHistory(
        'sim, confirmo',
        [],
        '25838925955116@lid',
        'wa-msg-13',
      );

      expect(result).toBe('Pedido KL-4242 criado!');
      expect(ordersServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ externalMessageId: 'wa-msg-13' }),
        'user-1',
      );
      expect(confirmationServiceMock.clear).toHaveBeenCalledWith('user-1');
      expect(lastFunctionResponse().response.orderNumber).toBe('KL-4242');
    });

    it('refuses create_order with an empty cart', async () => {
      cartServiceMock.getCart.mockResolvedValue(cartWith([]));
      mockGenerateContent.mockResolvedValueOnce(toolCallResponse({ name: 'create_order', args: {} }));
      mockGenerateContent.mockResolvedValueOnce(finalTextResponse('Carrinho vazio.'));

      await service.generateResponseWithHistory('confirmo', [], '25838925955116@lid', 'wa-msg-14');

      expect(confirmationServiceMock.verify).not.toHaveBeenCalled();
      expect(confirmationServiceMock.invalidate).toHaveBeenCalledWith('user-1');
      expect(ordersServiceMock.create).not.toHaveBeenCalled();
    });
  });

    describe('AI context contamination fixes', () => {
      const funcCallResp = (name: any, args: any) => ({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  { functionCall: { name, args, id: 'c1' }, thoughtSignature: 'sig' },
                ],
              },
            },
          ],
        },
      });
      const txtResp = (text: string) => ({
        response: { text: () => text, candidates: [{ content: { parts: [] } }] },
      });

      it('does not replay a previous turn functionCall from history into a new request', async () => {
        mockGenerateContent.mockResolvedValueOnce(funcCallResp('search_catalog', { q: 'Pão tem?' }));
        mockGenerateContent.mockResolvedValueOnce(txtResp('Encontrei pão.'));
        (productsService.search as jest.Mock).mockResolvedValueOnce([{ id: 'p2', name: 'Pão Kanda' }]);

        // Previous turn carries a stored functionCall/functionResponse in metadata —
        // it must NEVER be replayed as a live tool part.
        const history = [
          {
            role: 'user',
            content: 'Tem banana?',
            metadata: { parts: [{ functionCall: { name: 'search_catalog', args: { q: 'banana' }, id: 'old' } }] },
          },
          {
            role: 'model',
            content: '',
            metadata: { parts: [{ functionResponse: { name: 'search_catalog', response: { results: [] } } }] },
          },
        ];

        await service.generateResponseWithHistory('Pão tem?', history);

        const firstCall = mockGenerateContent.mock.calls[0][0];
        for (const c of firstCall.contents) {
          for (const p of c.parts) {
            expect(p).not.toHaveProperty('functionCall');
            expect(p).not.toHaveProperty('functionResponse');
          }
        }
        // Only the current message drives search; the old tool part is inert.
        expect(productsService.search).toHaveBeenCalledTimes(1);
        expect(productsService.search).toHaveBeenCalledWith('Pão tem?');
      });

      it('answers NO_RESULTS commercially instead of the generic fallback when Gemini returns empty text', async () => {
        mockGenerateContent.mockResolvedValueOnce(funcCallResp('search_catalog', { q: 'Maçã' }));
        // Second call (final, mode NONE) returns EMPTY text after a successful tool run.
        mockGenerateContent.mockResolvedValueOnce({ response: { text: () => '', candidates: [{ content: { parts: [] } }] } });
        // Retry call then yields a commercial "not found" answer.
        mockGenerateContent.mockResolvedValueOnce(txtResp('Não encontrei maçã no catálogo neste momento.'));
        (productsService.search as jest.Mock).mockResolvedValueOnce([]);

        const result = await service.generateResponseWithHistory('Tem maçã?', []);

        expect(result).toBe('Não encontrei maçã no catálogo neste momento.');
        expect(mockGenerateContent).toHaveBeenCalledTimes(3);
        const retryCall = mockGenerateContent.mock.calls[2][0];
        expect(retryCall.toolConfig.functionCallingConfig.mode).toBe('NONE');
        const lastPart = retryCall.contents[retryCall.contents.length - 1];
        expect(lastPart.role).toBe('user');
        expect(lastPart.parts[0].text).toContain('não foi encontrado');
      });

      it('still returns the generic fallback when the retry is also empty', async () => {
        mockGenerateContent.mockResolvedValueOnce(funcCallResp('search_catalog', { q: 'Maçã' }));
        mockGenerateContent.mockResolvedValueOnce({ response: { text: () => '', candidates: [{ content: { parts: [] } }] } });
        mockGenerateContent.mockResolvedValueOnce({ response: { text: () => '', candidates: [{ content: { parts: [] } }] } });
        (productsService.search as jest.Mock).mockResolvedValueOnce([]);

        const result = await service.generateResponseWithHistory('Tem maçã?', []);

        expect(result).toBe('Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.');
        expect(mockGenerateContent).toHaveBeenCalledTimes(3);
      });

      it('isolates tool state across sequential requests (no cross-request leakage)', async () => {
        // Request 1 -> banana
        mockGenerateContent.mockResolvedValueOnce(funcCallResp('search_catalog', { q: 'banana' }));
        mockGenerateContent.mockResolvedValueOnce(txtResp('Banana.'));
        (productsService.search as jest.Mock).mockResolvedValueOnce([{ id: 'b1', name: 'Banana Kanda' }]);
        await service.generateResponseWithHistory('Tem banana?', [], 'u1', 'msg-1');

        // Request 2 -> pão
        mockGenerateContent.mockResolvedValueOnce(funcCallResp('search_catalog', { q: 'pão' }));
        mockGenerateContent.mockResolvedValueOnce(txtResp('Pão.'));
        (productsService.search as jest.Mock).mockResolvedValueOnce([{ id: 'p1', name: 'Pão Kanda' }]);
        await service.generateResponseWithHistory('Pão tem?', [], 'u1', 'msg-2');

        expect(productsService.search).toHaveBeenCalledTimes(2);
        expect(productsService.search).toHaveBeenNthCalledWith(1, 'banana');
        expect(productsService.search).toHaveBeenNthCalledWith(2, 'pão');
        expect(mockGenerateContent).toHaveBeenCalledTimes(4);
      });
    });

  });