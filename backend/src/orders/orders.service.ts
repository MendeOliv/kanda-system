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
      where: { id: { in: productIds }, status: 'active' },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are invalid or inactive');
    }

    const productMap = new Map(products.map(p => [p.id, p]));
    let subtotal = 0;

    const orderItemsData = createOrderDto.items.map(item => {
      const product = productMap.get(item.productId)!;
      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        productNameSnapshot: product.name,
        unitPriceSnapshot: product.price,
      };
    });

    const deliveryFee = createOrderDto.deliveryZone === 'KK5000' ? 700 : 500;
    const totalAmount = subtotal + deliveryFee;

    const orderNumber = `KND-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return this.prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        zone: createOrderDto.deliveryZone,
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
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, phone: true, firstName: true } },
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
      },
    });
  }

  async remove(id: string) {
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
