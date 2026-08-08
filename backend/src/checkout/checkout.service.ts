import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async validate(userId: string, data: any) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilizador não encontrado');

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio');
    }

    // Validar morada (se fornecida)
    if (data.addressId) {
      const address = await this.prisma.address.findFirst({
        where: { id: data.addressId, userId },
      });
      if (!address) throw new BadRequestException('Morada de entrega inválida');
    }

    const subtotal = Number(cart.subtotal);
    const deliveryFee = subtotal >= 10000 ? 0 : 500;
    const total = subtotal + deliveryFee;

    return {
      valid: true,
      summary: {
        items: cart.items,
        subtotal,
        deliveryFee,
        total,
      },
    };
  }

  async process(userId: string, data: any) {
    const summary = await this.validate(userId, data);

    return {
      success: true,
      orderId: null, // Será preenchido no endpoint de pedido
      paymentUrl: 'https://payment.multicaixa.ao/kanda',
      summary,
    };
  }
}