import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private productsService: ProductsService
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.6-flash';
      const systemPrompt = `Você é um assistente da Kanda. Responda em português de forma objetiva e útil.
Você tem acesso a uma ferramenta de busca no catálogo de produtos. Quando o usuário perguntar sobre produtos, preços, estoque ou disponibilidade, você deve usar a ferramenta search_catalog para obter informações reais do banco de dados. Não invente informações.
Se o usuário perguntar sobre algo que não seja produto, você pode responder diretamente, mas se for sobre produtos, use a ferramenta.
Após obter os resultados da busca, você deve basear sua resposta exclusivamente nesses resultados, mencionando os produtos encontrados, seus preços e disponibilidade. Se nenhum produto for encontrado, informe que não encontrou o produto.`;
      this.model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });
      this.logger.log(`AI Service initialized with model: ${modelName}`);
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI Service will not function.');
    }
  }

  get isConfigured(): boolean {
    return !!this.model;
  }

  async generateResponse(message: string): Promise<string> {
    return this.generateResponseWithHistory(message, []);
  }

  async generateResponseWithHistory(
    message: string,
    conversationHistory: any[],
  ): Promise<string> {
    if (!this.isConfigured) {
      return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
    }

    const errorFallbacks = [
      'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.',
      'Neste momento estou com muitas solicitações. Tente novamente em alguns instantes.',
      'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.',
      'Desculpe, ocorreu um erro ao processar sua mensagem.',
      'Desculpe, não consegui gerar uma resposta no momento.',
    ];

    const contents: any[] = [];
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Filter out error fallback messages
      const filteredHistory = conversationHistory.filter(msg => {
        if (!msg.content) return true;
        return !errorFallbacks.some(fallback => msg.content.includes(fallback));
      });
      
      let sortedHistory = [...filteredHistory];
      if (sortedHistory[0]?.timestamp && sortedHistory[sortedHistory.length - 1]?.timestamp) {
        sortedHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
    const isDuplicated = lastHistoryMsg && 
                         lastHistoryMsg.role === 'user' && 
                         lastHistoryMsg.parts.some((p: any) => p.text === message);

    if (!isDuplicated) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const searchCatalogFunction = {
      name: 'search_catalog',
      description: 'Search for products in the catalog by query string. Returns product information including id, name, price, stock, and category.',
      parameters: {
        type: 'object' as const,
        properties: {
          q: { type: 'string' as const, description: 'The search query (product name, SKU, description, or category)' },
        },
        required: ['q'] as const,
      },
    };

    try {
      const initialContents = JSON.parse(JSON.stringify(contents));
      this.logger.log(`Contents sent to model (initial): ${JSON.stringify(initialContents)}`);
      
      const result = await this.model.generateContent({
        contents: initialContents,
        tools: [{ functionDeclarations: [searchCatalogFunction] }],
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
      });

      const response = await result.response;
      this.logger.log(`Raw response from Gemini: ${JSON.stringify(response)}`);

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const functionCalls = parts.filter((p: any) => p.functionCall);

      if (functionCalls.length > 0) {
        this.logger.log(`Found ${functionCalls.length} function calls`);
        
        const modelContent = { role: 'model', ...candidate.content };
        contents.push(modelContent);

        for (const part of functionCalls) {
          const call = part.functionCall;
          if (call.name === 'search_catalog') {
            const query = call.args.q;
            this.logger.log(`Executing search_catalog: ${query}`);
            const searchResults = await this.productsService.search(query);
            
            const formattedResults = searchResults.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              category: p.category, // Pass through exactly as in ProductsService (to match test expectation)
              price: p.price,
              discountPrice: p.discountPrice,
              stock: p.stock,
              sku: p.sku
            }));

            contents.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: 'search_catalog',
                  response: { results: formattedResults },
                },
              }],
            });
            break; 
          }
        }

        this.logger.log(`Contents for final generation: ${JSON.stringify(contents)}`);
        
        const finalResult = await this.model.generateContent({
          contents,
          tools: [{ functionDeclarations: [searchCatalogFunction] }],
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