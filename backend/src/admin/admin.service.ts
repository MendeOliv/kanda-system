import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { orders };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const statusMap: Record<string, OrderStatus> = {
      confirmed: OrderStatus.CONFIRMED,
      processing: OrderStatus.PROCESSING,
      preparing: OrderStatus.PROCESSING,
      shipped: OrderStatus.SHIPPED,
      delivered: OrderStatus.DELIVERED,
      cancelled: OrderStatus.CANCELLED,
    };

    const normalized = statusMap[String(status).toLowerCase()] ?? OrderStatus.PENDING;

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: normalized },
    });

    await this.prisma.trackingHistory.create({
      data: {
        orderId,
        status: normalized,
        description: `Status atualizado para ${normalized}`,
      },
    });

    return { success: true };
  }

  async createProduct(body: any) {
    const categoryId = body.categoryId || (
      await this.prisma.category.findFirst()
    )?.id;

    if (!categoryId) {
      throw new NotFoundException('Nenhuma categoria disponível. Crie uma categoria primeiro.');
    }

    const product = await this.prisma.product.create({
      data: {
        name: body.name,
        description: body.description || '',
        price: new Prisma.Decimal(body.price ?? 0),
        discountPrice: body.discountPrice != null
          ? new Prisma.Decimal(body.discountPrice)
          : null,
        stock: body.stock ?? 0,
        sku: body.sku || `sku-${Date.now()}`,
        categoryId,
        imageUrl: body.imageUrl,
        status: body.status || 'active',
      },
      include: { category: true },
    });
    return { success: true, product };
  }

  async updateProduct(productId: string, body: any) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = new Prisma.Decimal(body.price);
    if (body.discountPrice !== undefined) {
      data.discountPrice = body.discountPrice == null
        ? null
        : new Prisma.Decimal(body.discountPrice);
    }
    if (body.stock !== undefined) data.stock = body.stock;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.status !== undefined) data.status = body.status;

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data,
      include: { category: true },
    });
    return { success: true, product: updated };
  }

  async deleteProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto não encontrado');

    await this.prisma.product.update({
      where: { id: productId },
      data: { status: 'inactive' },
    });

    return { success: true };
  }

  async getStats() {
    const [totalOrders, totalRevenue, topProductsRaw, ordersByStatus] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Preencher nomes dos top products
    const productIds = topProductsRaw.map((c) => c.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const topProducts = topProductsRaw.map((c) => ({
      productId: c.productId,
      name: productMap.get(c.productId) || c.productId,
      totalQuantity: c._sum.quantity,
    }));

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      topProducts,
      ordersByStatus,
    };
  }
}