import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);

  constructor(private prisma: PrismaService) {}

  async syncOrder(data: any) {
    this.logger.log(`Syncing order from n8n: ${JSON.stringify(data)}`);
    return { received: true, message: 'Order sync endpoint ready' };
  }

  async updateOrderStatus(data: { orderNumber: string; status: string; riderName?: string; riderPhone?: string }) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: data.orderNumber },
    });

    if (!order) {
      throw new NotFoundException(`Order ${data.orderNumber} not found`);
    }

    const updateData: Record<string, any> = { status: data.status };

    if (data.riderName) updateData.riderName = data.riderName;
    if (data.riderPhone) updateData.riderPhone = data.riderPhone;

    return this.prisma.order.update({
      where: { orderNumber: data.orderNumber },
      data: updateData,
      include: { items: true },
    });
  }

  async getAiContext(userPhone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone: userPhone },
      include: {
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
        addresses: true,
      },
    });

    if (!user) {
      return { conversationState: { step: 'new_user' }, user: null };
    }

    return {
      conversationState: { step: 'returning_user' },
      user: {
        id: user.id,
        firstName: user.firstName,
        phone: user.phone,
        role: user.role,
      },
      recentOrders: user.orders,
      addresses: user.addresses,
    };
  }

  async updateAiContext(data: { userPhone: string; conversationState?: any }) {
    this.logger.log(`AI context update for ${data.userPhone}: ${JSON.stringify(data.conversationState)}`);
    return { received: true, userPhone: data.userPhone };
  }

  async getCatalog() {
    const [categories, products] = await Promise.all([
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.product.findMany({
        where: { status: 'active' },
        include: { category: true },
      }),
    ]);

    return { categories, products };
  }
}
