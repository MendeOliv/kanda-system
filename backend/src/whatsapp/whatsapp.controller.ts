import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { IncomingMessageDto } from './dto/incoming-message.dto';
import { Logger } from '@nestjs/common';
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
    private readonly conversationService: ConversationService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    this.logger.log(`Received send message request: ${JSON.stringify(sendMessageDto)}`);
    await this.whatsappService.sendMessage(sendMessageDto.to, sendMessageDto.text);
    return { status: 'Message sent' };
  }

  @Post('message')
  @ApiOperation({ summary: 'Receive a WhatsApp message from adapter' })
  @ApiBody({ type: IncomingMessageDto })
  @ApiResponse({ status: 200, description: 'Message received successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async receiveMessage(@Body() incomingMessageDto: IncomingMessageDto) {
    this.logger.log(`Received WhatsApp message: ${JSON.stringify(incomingMessageDto)}`);

    const { from, body, externalMessageId } = incomingMessageDto;
    this.logger.log(`Iniciando processamento IA para mensagem de ${from}: ${body.substring(0, 50)}...`);

    // Use conversation lock to ensure sequential processing for the same conversation
    return this.conversationService.withConversationLock(from, async () => {
      // Check idempotency: if we've already processed this externalMessageId this externalMessageId, skip
      const messageExists = await this.conversationService.messageExists(externalMessageId);
      if (messageExists) {
        this.logger.log(`Duplicate externalMessageId ${externalMessageId} ignored`);
        return { status: 'Message received (duplicate ignored)' };
      }

      // Get or create conversation for this customer (WhatsApp JID/phone)
      const conversation = await this.conversationService.getOrCreateConversation(from);
      this.logger.log(`Conversation ID: ${conversation.id}`);

      // Load recent conversation history (last 10 messages, most recent first) BEFORE saving the current message
      const recentMessages = await this.conversationService.getRecentMessages(conversation.id, 10);
      this.logger.log(`Retrieved ${recentMessages.length} recent messages for context`);

      // Persist the user message
      const userMessage = await this.conversationService.addMessage(conversation.id, {
        externalMessageId,
        role: 'USER',
        content: body,
        timestamp: new Date(incomingMessageDto.timestamp),
        metadata: { type: incomingMessageDto.type }, // store original type if needed
      });
      this.logger.log(`User message saved with ID: ${userMessage.id}`);

      // Generate AI response using the history (without the current message) and the current body
      let responseText = '';
      try {
        responseText = await this.aiService.generateResponseWithHistory(body, recentMessages);
      } catch (error) {
        this.logger.error(`Erro ao gerar resposta com IA: ${error.message}`);
        responseText = 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
      }

      this.logger.log(`Resposta gerada pela IA: ${responseText.substring(0, 50)}...`);

      // Persist the assistant message
      const assistantMessage = await this.conversationService.addMessage(conversation.id, {
        role: 'ASSISTANT',
        content: responseText,
        timestamp: new Date(),
      });
      this.logger.log(`Assistant message saved with ID: ${assistantMessage.id}`);

      // Send the response back to the user via WhatsApp
      await this.whatsappService.sendMessage(from, responseText);
      this.logger.log(`Resposta enviada para ${from}`);

      return { status: 'Message received' };
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Get WhatsApp integration status' })
  @ApiResponse({ status: 200, description: 'Returns integration status' })
  async getStatus() {
    return { 
      status: 'active', 
      service: 'WhatsApp Integration',
      timestamp: new Date().toISOString()
    };
  }
}