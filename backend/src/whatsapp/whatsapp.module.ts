import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { AIService } from '../ai/ai.service';

@Module({
  imports: [HttpModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, AIService],
})
export class WhatsAppModule {}