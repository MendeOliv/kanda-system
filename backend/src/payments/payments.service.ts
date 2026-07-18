import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: createPaymentDto.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${createPaymentDto.orderId} not found`);
    }

    const existing = await this.prisma.payment.findUnique({
      where: { orderId: createPaymentDto.orderId },
    });

    if (existing) {
      throw new BadRequestException('Payment already exists for this order');
    }

    return this.prisma.payment.create({
      data: {
        orderId: createPaymentDto.orderId,
        method: createPaymentDto.method,
        amount: createPaymentDto.amount,
        status: 'PENDING',
      },
      include: { order: true },
    });
  }

  async findByOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }

    return payment;
  }

  async processWebhook(payload: any) {
    this.logger.log(`Webhook received: ${JSON.stringify(payload)}`);

    const transactionId = payload.transaction_id || payload.id;
    if (!transactionId) {
      throw new BadRequestException('Missing transaction ID in webhook payload');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { appypayTransactionId: transactionId },
    });

    if (!payment) {
      this.logger.warn(`Unknown transaction: ${transactionId}`);
      return { received: true, status: 'ignored' };
    }

    const newStatus = payload.status === 'completed' || payload.status === 'success'
      ? 'COMPLETED'
      : payload.status === 'failed'
        ? 'FAILED'
        : payment.status;

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        rawWebhookPayload: payload as Prisma.JsonObject,
        processedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
      },
      include: { order: true },
    });

    if (newStatus === 'COMPLETED') {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'COMPLETED' },
      });
    }

    return updated;
  }

  async refund(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: 'REFUNDED' },
      include: { order: true },
    });

    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    return updated;
  }
}
