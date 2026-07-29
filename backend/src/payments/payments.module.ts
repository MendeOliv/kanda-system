import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AppyPayProvider } from './providers/appypay.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PrismaModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, AppyPayProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
