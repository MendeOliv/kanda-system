import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LlmItem {
  name: string;
  quantity: number;
  unit: string | null;
}

@Injectable()
export class GeminiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.logger.log('Gemini Provider initialized with gemini-2.0-flash');
    } else {
      this.logger.warn('GEMINI_API_KEY not found. Gemini Provider will run in fallback mode.');
    }
  }

  get isConfigured(): boolean {
    return !!this.model;
  }

  async parseShoppingList(rawText: string): Promise<LlmItem[]> {
    if (!this.isConfigured) {
      throw new Error('Gemini Provider not configured');
    }

    const prompt = `Extrai os produtos e quantidades desta lista de compras angolana. 
Responde APENAS com um array JSON válido. 
Cada item deve ter obrigatoriamente as chaves: "name" (string), "quantity" (número), "unit" (string ou null).
Exemplo de saída: [{"name": "Arroz Sol 25kg", "quantity": 2, "unit": "un"}, {"name": "Óleo Fula 5L", "quantity": 1, "unit": "un"}]

Lista: ${rawText}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean potential markdown code blocks
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as LlmItem[];
    } catch (error) {
      this.logger.error(`Error parsing shopping list with Gemini: ${error.message}`);
      throw error;
    }
  }
}
