import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppyPayProvider, PaymentRequest } from './providers/appypay.provider';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private appypay: AppyPayProvider,
  ) {}

  async createPaymentForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const paymentRequest: PaymentRequest = {
      orderId: order.id,
      amount: Number(order.totalAmount),
      customerName: order.user.firstName || 'Cliente Kanda',
      customerPhone: order.user.phone,
    };

    const payment = await this.appypay.createPayment(paymentRequest);

    // Save payment info to order (optional, assuming order has field or separate table)
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        // Assume metadata or status update
        status: 'PENDING',
      },
    });

    return payment;
  }

  async handleWebhook(payload: any) {
    const { external_id, status } = payload;
    
    this.logger.log(`Webhook received: Order ${external_id} Status ${status}`);

    if (status === 'PAID') {
      await this.prisma.order.update({
        where: { id: external_id },
        data: { status: 'CONFIRMED' },
      });
      // Here you could trigger a notification via n8n
    }

    return { success: true };
  }
}
