import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  /** Resolve delivery fee from the database-baked DeliveryZone. */
  private async resolveDeliveryFee(zoneName: string): Promise<{
    fee: number;
    zoneId: string | null;
    minOrderValue: number;
  }> {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { name: zoneName, active: true },
    });

    if (!zone) {
      // Fallback for legacy / unrecognised zones
      throw new BadRequestException(`Delivery zone "${zoneName}" not found or inactive.`);
    }

    return {
      fee: Number(zone.fee),
      zoneId: zone.id,
      minOrderValue: Number(zone.minOrderValue),
    };
  }

  async create(createOrderDto: CreateOrderDto, userId?: string) {
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const user = await this.prisma.user.findFirst({
      where: { firebaseUid: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found. Please complete registration.');
    }

    const productIds = createOrderDto.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are invalid or inactive');
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    const orderItemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];
    let subtotal = 0;

    for (const item of createOrderDto.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        );
      }

      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        productNameSnapshot: product.name,
        unitPriceSnapshot: product.price,
      });
    }

    const { fee: deliveryFee, zoneId, minOrderValue } =
      await this.resolveDeliveryFee(createOrderDto.deliveryZone);

    if (subtotal < minOrderValue) {
      throw new BadRequestException(
        `Minimum order value for this zone is ${minOrderValue} Kz. Your subtotal is ${subtotal} Kz.`,
      );
    }

    const totalAmount = subtotal + deliveryFee;

    const orderNumber = `KND-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    this.logger.log(`Creating order ${orderNumber} — zone=${createOrderDto.deliveryZone} fee=${deliveryFee} subtotal=${subtotal} total=${totalAmount}`);

    return this.prisma.$transaction(async (tx) => {
      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          deliveryZoneId: zoneId,
          deliveryReference: createOrderDto.deliveryReference,
          addressId: createOrderDto.addressId,
          paymentMethod: createOrderDto.paymentMethod,
          deliveryFee,
          subtotal,
          totalAmount,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          notes: createOrderDto.notes,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, phone: true, firstName: true } },
        },
      });

      this.logger.log(`Order ${order.orderNumber} created successfully.`);

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, phone: true, firstName: true } },
        deliveryZone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, phone: true, firstName: true, lastName: true } },
        payment: true,
        deliveryZone: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, phone: true, firstName: true } },
        deliveryZone: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { firebaseUid: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: true } },
        deliveryZone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as Prisma.OrderUpdateInput,
      include: {
        items: true,
        user: { select: { id: true, phone: true } },
        deliveryZone: true,
      },
    });
  }

  async remove(id: string) {
    return this.cancel(id);
  }

  async cancel(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}