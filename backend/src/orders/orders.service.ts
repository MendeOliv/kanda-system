import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Zone, PaymentMethod, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  private async resolveUser(identifier: string) {
    // Aceita quer o id interno, quer o firebaseUid
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: identifier },
    });
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { id: identifier } });
    }
    return user;
  }

  private async generateOrderNumber(): Promise<string> {
    let orderNumber = '';
    let exists = true;
    while (exists) {
      orderNumber = `KL-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = await this.prisma.order.findUnique({ where: { orderNumber } });
      exists = !!existing;
    }
    return orderNumber;
  }

  private normalizeZone(zone: string): Zone {
      const normalized = String(zone || '').trim().toUpperCase();
      return normalized === 'KILAMBA' ? Zone.KILAMBA : Zone.KK5000;
    }

    private normalizePaymentMethod(method: string): PaymentMethod {
      const m = String(method || 'CASH').toUpperCase();
      return m === 'APPYPAY' ? PaymentMethod.APPYPAY : PaymentMethod.CASH;
    }

  private async addTracking(orderId: string, status: string, description: string) {
    return this.prisma.trackingHistory.create({
      data: { orderId, status, description },
    });
  }

  async create(createOrderDto: any, identifier?: string) {
    if (!identifier) {
      throw new BadRequestException('Autenticação de utilizador necessária');
    }

    const user = await this.resolveUser(identifier);
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }

    const productIds = createOrderDto.items.map((i: any) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Um ou mais produtos são inválidos ou inativos');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
        const itemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];
        let subtotal = 0;

        for (const item of createOrderDto.items) {
          const product = productMap.get(item.productId)!;
          const price = product.discountPrice || product.price;
          subtotal += Number(price) * item.quantity;
          itemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            price,
          });
        }

    const zone = this.normalizeZone(createOrderDto.deliveryZone);
    const deliveryFee = subtotal >= 10000 ? 0 : 500;
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = await this.generateOrderNumber();
    const paymentMethod = this.normalizePaymentMethod(createOrderDto.paymentMethod);

    this.logger.log(
      `Criando pedido ${orderNumber} — zone=${zone} fee=${deliveryFee} subtotal=${subtotal} total=${totalAmount}`,
    );

    const order = await this.prisma.$transaction(async (tx) => {
      // Decrementar stock
      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          addressId: createOrderDto.addressId,
          zone,
          deliveryReference: createOrderDto.deliveryReference || 'N/A',
          paymentMethod,
          deliveryFee,
          subtotal,
          totalAmount,
          status: OrderStatus.PENDING,
                    paymentStatus: PaymentStatus.PENDING,
                    notes: createOrderDto.notes,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } } },
      });

      return created;
    });

    await this.addTracking(order.id, 'PENDING', 'Pedido criado com sucesso');

    return {
      success: true,
      order,
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount,
    };
  }

  async findUserOrders(userId: string) {
    const user = await this.resolveUser(userId);
    if (!user) throw new NotFoundException('Utilizador não encontrado');

    const orders = await this.prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true, trackingHistory: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return { orders };
  }

  async findOne(identifier: string, id: string) {
    const user = await this.resolveUser(identifier);
    if (!user) throw new NotFoundException('Utilizador não encontrado');

    const order = await this.prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true, trackingHistory: { orderBy: { date: 'desc' } } },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return { order };
  }

  async cancel(identifier: string, id: string) {
    const user = await this.resolveUser(identifier);
    if (!user) throw new NotFoundException('Utilizador não encontrado');

    const order = await this.prisma.order.findFirst({ where: { id, userId: user.id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.status === 'CANCELLED') throw new BadRequestException('Pedido já cancelado');

    await this.prisma.$transaction(async (tx) => {
      // Repor stock
      for (const item of await tx.orderItem.findMany({ where: { orderId: id } })) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
    });

    await this.addTracking(id, 'CANCELLED', 'Pedido cancelado pelo utilizador');
    return { success: true };
  }

  async tracking(identifier: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { trackingHistory: { orderBy: { date: 'desc' } } },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    return {
      status: order.status,
      orderNumber: order.orderNumber,
      history: order.trackingHistory,
    };
  }
}