import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { GeminiProvider } from './providers/gemini.provider';
import { GoogleVisionProvider } from './providers/google-vision.provider';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    PrismaModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AutomationController],
  providers: [AutomationService, GeminiProvider, GoogleVisionProvider],
  exports: [AutomationService],
})
export class AutomationModule {}
