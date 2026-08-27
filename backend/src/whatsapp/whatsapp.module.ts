import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { AIService } from '../ai/ai.service';
import { ConversationModule } from '../conversation/conversation.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [HttpModule, ConversationModule, ProductsModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, AIService],
})
export class WhatsAppModule {}