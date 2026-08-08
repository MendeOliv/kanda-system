import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async findOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, subtotal: 0, deliveryFee: 0, total: 0 },
      });
    }
    return cart;
  }

  private async recalc(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });
    const subtotal = items.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0,
    );
    const deliveryFee = subtotal >= 10000 ? 0 : 500;
    const total = subtotal + deliveryFee;

    return this.prisma.cart.update({
      where: { id: cartId },
      data: { subtotal, deliveryFee, total },
      include: { items: { include: { product: true } } },
    });
  }

  private async getCartWithItems(userId: string) {
    const cart = await this.findOrCreateCart(userId);
    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  async getCart(userId: string) {
    const result = await this.getCartWithItems(userId);
    return {
      items: result?.items ?? [],
      subtotal: result ? Number(result.subtotal) : 0,
      deliveryFee: result ? Number(result.deliveryFee) : 0,
      total: result ? Number(result.total) : 0,
    };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (quantity <= 0) throw new BadRequestException('Quantidade inválida');
    if (product.stock < quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    const cart = await this.findOrCreateCart(userId);
    const price = product.discountPrice || product.price;

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity }, price },
      create: { cartId: cart.id, productId, quantity, price },
    });

    const result = await this.recalc(cart.id);
    return { success: true, cart: result };
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    const cart = await this.findOrCreateCart(userId);

    if (quantity <= 0) {
      await this.prisma.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });
    } else {
      await this.prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity },
      });
    }

    const result = await this.recalc(cart.id);
    return { success: true, cart: result };
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.findOrCreateCart(userId);
    await this.prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId } },
    }).catch(() => {
      // Item não existia — ignorar
    });

    const result = await this.recalc(cart.id);
    return { success: true, cart: result };
  }

  async clearCart(userId: string) {
    const cart = await this.findOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await this.recalc(cart.id);
    return { success: true };
  }
}