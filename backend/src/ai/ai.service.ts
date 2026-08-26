import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(private configService: ConfigService, private prisma: PrismaService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.6-flash';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
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

    // System prompt as per requirements
    const systemPrompt = `Você é um assistente da Kanda. Responda em português de forma objetiva e útil.
Nesta fase, não invente catálogo, preços, stock ou pedidos.
Quando perguntarem por produtos/preços, informe que a integração do catálogo ainda está em implementação.`;

    // Build the conversation history string
    let historyText = '';
    if (conversationHistory && conversationHistory.length > 0) {
      // We want to show the history in chronological order (oldest first)
      const sortedHistory = [...conversationHistory].reverse();
      historyText = sortedHistory
        .map(
          (msg) =>
            `${msg.role === 'USER' ? 'Usuário' : msg.role === 'ASSISTANT' ? 'Assistente' : 'Sistema'}: ${msg.content}`,
        )
        .join('\n');
      historyText = `\nHistórico da conversa:\n${historyText}\n`;
    }

    const prompt = `${systemPrompt}${historyText}\nUsuário: ${message}\nAssistente:`;

    try {
      this.logger.log(
        `Iniciando processamento IA para mensagem: ${message.substring(0, 50)}...`,
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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