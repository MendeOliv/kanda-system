import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseModule } from './firebase/firebase.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { AutomationModule } from './automation/automation.module';
import { PaymentsModule } from './payments/payments.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AdminModule } from './admin/admin.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContactModule } from './contact/contact.module';
import { BrandModule } from './brand/brand.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      ThrottlerModule.forRoot([
        {
          ttl: 60_000, // 1 minuto
          limit: 100,   // 10 requests globais por IP
        },
      ]),
      FirebaseModule.forRoot(),
      PrismaModule,
      AuthModule,
      UsersModule,
      ProductsModule,
      OrdersModule,
      CategoriesModule,
      AutomationModule,
      PaymentsModule,
      CartModule,
      CheckoutModule,
      AdminModule,
      NewsletterModule,
      ContactModule,
      BrandModule,
      WhatsAppModule,
    ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
