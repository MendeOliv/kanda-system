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

  /**
   * Generate a response from the AI based on the message and conversation history.
   * Supports function calling for search_catalog tool.
   * @param message The current user message
   * @param conversationHistory The previous messages in the conversation (most recent first)
   */
  async generateResponseWithHistory(
    message: string,
    conversationHistory: any[], // Using any[] to avoid Prisma type issues during compilation
  ): Promise<string> {
    if (!this.isConfigured) {
      this.logger.warn('GEMINI_API_KEY not found. Returning fallback message.');
      return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
    }

    // Build the conversation history in the format expected by Gemini
    // We do NOT add the system prompt as a message because it's already set via systemInstruction
    const contents: any[] = [];
    // History (most recent first in the array, but we want oldest first for chronological order)
    if (conversationHistory && conversationHistory.length > 0) {
      const sortedHistory = [...conversationHistory].reverse();
      for (const msg of sortedHistory) {
        let role: 'user' | 'model' = 'user';
        if (msg.role === 'USER') {
          role = 'user';
        } else if (msg.role === 'ASSISTANT') {
          role = 'model';
        }
        // Note: We don't expect SYSTEM messages in the conversation history
        contents.push({
          role: role,
          parts: [{ text: msg.content }],
        });
      }
    }
    // Current user message
    contents.push({
      role: 'user' as const,
      parts: [{ text: message }],
    });

    // Define the search_catalog function declaration
    const searchCatalogFunction = {
      name: 'search_catalog',
      description: 'Search for products in the catalog by query string. Returns product information including id, name, price, stock, and category.',
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
    };

    try {
      this.logger.log(
        `Iniciando processamento IA para mensagem: ${message.substring(0, 50)}...`,
      );
      this.logger.log(`Contents sent to model (initial): ${JSON.stringify(contents)}`);
      const result = await this.model.generateContent({
        contents,
        tools: [
          {
            functionDeclarations: [searchCatalogFunction],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: 'AUTO',
          },
        },
      });
      const response = await result.response;
      this.logger.log(`Raw response from Gemini: ${JSON.stringify(response)}`);
      
      // Extract function calls from the response candidates
      const functionCalls: any[] = [];
      if (response.candidates?.length > 0) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
          if (part.functionCall) {
            functionCalls.push(part.functionCall);
          }
        }
      }
      this.logger.log(`Found ${functionCalls.length} function calls in response`);
      
      // Check if the model wants to call a function
      if (functionCalls.length > 0) {
        this.logger.log('Entering function call branch');
        for (const call of functionCalls) {
          if (call.name === 'search_catalog') {
            const query = call.args.q as string;
            this.logger.log(`Executing search_catalog with query: ${query}`);
            // Call the ProductsService to search
            const searchResults = await this.productsService.search(query);
            this.logger.log(`Search results from ProductsService: ${JSON.stringify(searchResults)}`);
            // Format the results for the model (only necessary fields)
            const formattedResults = searchResults.map((product: any) => ({
              id: product.id,
              name: product.name,
              description: product.description,
              category: product.category?.name,
              price: product.price,
              discountPrice: product.discountPrice,
              stock: product.stock,
              sku: product.sku,
            }));
            this.logger.log(`Formatted results for Gemini: ${JSON.stringify(formattedResults)}`);
            // Append the function call and result to the contents
            contents.push({
              role: 'model' as const,
              parts: [call],
            });
            contents.push({
              role: 'function' as const,
              parts: [
                {
                  functionResponse: {
                    name: 'search_catalog',
                    response: formattedResults,
                  },
                },
              ],
            });
            // Log the contents we are sending to the model for the final response
            this.logger.log(`Contents for final generation: ${JSON.stringify(contents)}`);
            // Break after first function call (we only support one for now)
            break;
          }
        }
        // Generate the final response with the function result
        // IMPORTANT: Set functionCallingConfig to 'NONE' to prevent further function calls
        const finalResult = await this.model.generateContent({
          contents,
          tools: [
            {
              functionDeclarations: [searchCatalogFunction],
            },
          ],
          toolConfig: {
            functionCallingConfig: {
              mode: 'NONE',
            },
          },
        });
        const finalResponse = await finalResult.response;
        this.logger.log(`Final response object: ${JSON.stringify(finalResponse)}`);
        const finalText = finalResponse.text();
        this.logger.log(`Final response text: ${finalText}`);
        if (!finalText || finalText.trim() === '') {
          this.logger.warn('Gemini retornou resposta vazia após function call');
          return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
        }
        return finalText.trim();
      } else {
        this.logger.log('No function call, returning text response');
      }
      // No function call, return the text
      const text = response.text();
      this.logger.log(`Text response: ${text}`);
      if (!text || text.trim() === '') {
        this.logger.warn('Gemini retornou resposta vazia');
        return 'Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.';
      }
      this.logger.log(
        `Processamento IA concluído com sucesso. Resposta: ${text.substring(0, 50)}...`,
      );
      return text.trim();
    } catch (error) {
      this.logger.error(`Erro ao processar com Gemini: ${error.message}`);
      // Depending on the error, we can return a friendly message or rethrow
      // For now, we'll return a generic error message to not break the flow
      return 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
    }
  }

  // Keep the old method for backward compatibility? Not required by spec, but we can keep it.
  async generateResponse(message: string): Promise<string> {
    return this.generateResponseWithHistory(message, []);
  }
}