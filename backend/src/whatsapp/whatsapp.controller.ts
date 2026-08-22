import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { IncomingMessageDto } from './dto/incoming-message.dto';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AIService } from '../ai/ai.service';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly aiService: AIService,
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

    const { from, body } = incomingMessageDto;
    this.logger.log(`Iniciando processamento IA para mensagem de ${from}: ${body.substring(0, 50)}...`);

    let responseText = '';
    try {
      responseText = await this.aiService.generateResponse(body);
    } catch (error) {
      this.logger.error(`Erro ao gerar resposta com IA: ${error.message}`);
      responseText = 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
    }

    this.logger.log(`Resposta gerada pela IA: ${responseText.substring(0, 50)}...`);
    await this.whatsappService.sendMessage(from, responseText);
    this.logger.log(`Resposta enviada para ${from}`);

    return { status: 'Message received' };
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