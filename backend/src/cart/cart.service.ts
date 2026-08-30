import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CartReturn {
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      price: number;
      stock: number;
      active: boolean;
      discountPrice?: number | null;
    };
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  idempotent?: boolean;
}

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create a cart for the user, handling concurrent creation safely.
   * @param userId
   */
  private async getOrCreateCart(userId: string) {
    // Try to find existing cart
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      return cart;
    }
    // If not found, try to create; if unique constraint occurs, retry find
    try {
      cart = await this.prisma.cart.create({
        data: { userId, subtotal: 0, deliveryFee: 0, total: 0 },
      });
      return cart;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        // Another request created the cart concurrently; fetch it
        cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
          // This should not happen, but if it does, rethrow
          throw err;
        }
        return cart;
      }
      throw err;
    }
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

  public async getCartWithItems(userId: string) {
    const cart = await this.getOrCreateCart(userId);
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

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    externalMessageId: string = '',
  ) {
    // Idempotency check (only if externalMessageId is provided)
    if (externalMessageId) {
      const existing = await this.prisma.processedMessage.findUnique({
        where: { externalMessageId },
      });
      if (existing) {
        const cart = await this.getCart(userId);
        return { success: true, cart, idempotent: true };
      }
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (quantity <= 0) throw new BadRequestException('Quantidade inválida');
    if (product.stock < quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Get or create cart safely (outside transaction)
    const cart = await this.getOrCreateCart(userId);
    const price = product.discountPrice || product.price;

    // Perform atomic operations inside transaction
    const updatedCart = await this.prisma.$transaction(async (tx) => {
      // Upsert cart item
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity: { increment: quantity }, price },
        create: { cartId: cart.id, productId, quantity, price },
      });

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await tx.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals
      return this.recalc(cart.id);
    });

    return { success: true, cart: updatedCart, idempotent: undefined };
  }

  async updateItem(
    userId: string,
    productId: string,
    quantity: number,
    externalMessageId: string = '',
  ) {
    // Idempotency check (only if externalMessageId is provided)
    if (externalMessageId) {
      const existing = await this.prisma.processedMessage.findUnique({
        where: { externalMessageId },
      });
      if (existing) {
        const cart = await this.getCart(userId);
        return { success: true, cart, idempotent: true };
      }
    }

    // Get or create cart safely (outside transaction)
    const cart = await this.getOrCreateCart(userId);

    // Perform atomic operations inside transaction
    const updatedCart = await this.prisma.$transaction(async (tx) => {
      if (quantity <= 0) {
        await tx.cartItem.delete({
          where: { cartId_productId: { cartId: cart.id, productId } },
        }).catch(() => {
          // Item não existia — ignorar
        });
      } else {
        await tx.cartItem.update({
          where: { cartId_productId: { cartId: cart.id, productId } },
          data: { quantity },
        });
      }

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await tx.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals
      return this.recalc(cart.id);
    });

    return { success: true, cart: updatedCart, idempotent: undefined };
  }

  async removeItem(
    userId: string,
    productId: string,
    externalMessageId: string = '',
  ) {
    // Idempotency check (only if externalMessageId is provided)
    if (externalMessageId) {
      const existing = await this.prisma.processedMessage.findUnique({
        where: { externalMessageId },
      });
      if (existing) {
        const cart = await this.getCart(userId);
        return { success: true, cart, idempotent: true };
      }
    }

    // Get or create cart safely (outside transaction)
    const cart = await this.getOrCreateCart(userId);

    // Perform atomic operations inside transaction
    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
      }).catch(() => {
        // Item não existia — ignorar
      });

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await tx.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals
      return this.recalc(cart.id);
    });

    return { success: true, cart: updatedCart, idempotent: undefined };
  }

  async clearCart(
    userId: string,
    externalMessageId: string = '',
  ) {
    // Idempotency check (only if externalMessageId is provided)
    if (externalMessageId) {
      const existing = await this.prisma.processedMessage.findUnique({
        where: { externalMessageId },
      });
      if (existing) {
        const cart = await this.getCart(userId);
        return { success: true, cart, idempotent: true };
      }
    }

    // Get or create cart safely (outside transaction)
    const cart = await this.getOrCreateCart(userId);

    // Perform atomic operations inside transaction
    const updatedCart = await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await tx.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals
      return this.recalc(cart.id);
    });

    return { success: true, cart: updatedCart, idempotent: undefined };
  }
}