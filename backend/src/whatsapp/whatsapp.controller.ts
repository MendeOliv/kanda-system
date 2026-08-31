import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { IncomingMessageDto } from './dto/incoming-message.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AIService } from '../ai/ai.service';
import { ConversationService } from '../conversation/conversation.service';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly aiService: AIService,
    private readonly conversationService: ConversationService
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    this.logger.log(`Received send message request: ${JSON.stringify(sendMessageDto)}`);
    await this.whatsappService.sendMessage(sendMessageDto.to, sendMessageDto.text);
    return { status: 'Message sent' };
  }

  @Post('message')
  @ApiOperation({ summary: 'Receive a WhatsApp message from adapter' })
  @ApiBody({ type: IncomingMessageDto })
  @ApiResponse({ status: 200, description: 'Message received successfully' })
  async receiveMessage(@Body() incomingMessageDto: IncomingMessageDto) {
    this.logger.log(`Received WhatsApp message: ${JSON.stringify(incomingMessageDto)}`);

    const { from, body, externalMessageId } = incomingMessageDto;
    
    // Ignore status@broadcast messages
    if (from === 'status@broadcast') {
      this.logger.log(`[WhatsAppController] Ignoring status@broadcast message`);
      return { status: 'Message received (status ignored)' };
    }

    this.logger.log(`Iniciando processamento IA para mensagem de ${from}: ${body.substring(0, 50)}...`);

    return this.conversationService.withConversationLock(from, async () => {
      // Check idempotency
      const messageExists = await this.conversationService.messageExists(externalMessageId);
      if (messageExists) {
        this.logger.log(`Duplicate externalMessageId ${externalMessageId} ignored`);
        return { status: 'Message received (duplicate ignored)' };
      }

      // Get or create conversation
      const conversation = await this.conversationService.getOrCreateConversation(from);
      this.logger.log(`Conversation ID: ${conversation.id}`);

      // Load recent history BEFORE saving current message to prevent duplication in AI logic
      const recentMessages = await this.conversationService.getRecentMessages(conversation.id, 10);
      this.logger.log(`Retrieved ${recentMessages.length} recent messages for context`);

      // Persist user message with role 'user'
      const userMessage = await this.conversationService.addMessage(conversation.id, {
        externalMessageId,
        role: 'user',
        content: body,
        timestamp: new Date(incomingMessageDto.timestamp),
        metadata: { type: incomingMessageDto.type },
      });
      this.logger.log(`User message saved with ID: ${userMessage.id}`);

      // Generate AI response
      let responseText = '';
      try {
        responseText = await this.aiService.generateResponseWithHistory(body, recentMessages);
      } catch (error) {
        this.logger.error(`Erro ao gerar resposta com IA: ${error.message}`, error.stack);
        responseText = 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
      }

      const isQuotaExceeded = responseText === 'Neste momento estou com muitas solicitações. Tente novamente em alguns instantes.';
      this.logger.log(`Resposta gerada pela IA: ${responseText.substring(0, 50)}...`);

      // Persist assistant message ONLY if not quota fallback
      if (!isQuotaExceeded) {
        const assistantMessage = await this.conversationService.addMessage(conversation.id, {
          role: 'model',
          content: responseText,
          timestamp: new Date(),
        });
        this.logger.log(`Assistant message saved with ID: ${assistantMessage.id}`);
      } else {
        this.logger.log(`Quota exceeded response not saved as assistant message: ${responseText}`);
      }

      // Send via WhatsApp
      await this.whatsappService.sendMessage(from, responseText);
      this.logger.log(`Resposta enviada para ${from}`);

      return { status: 'Message received' };
    });
  }

  @Get('status')
  async getStatus() {
    return { status: 'active', timestamp: new Date().toISOString() };
  }
}