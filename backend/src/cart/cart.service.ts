import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfirmationService } from '../confirmation/confirmation.service';

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
  private readonly logger = new Logger(CartService.name);

  constructor(
    private prisma: PrismaService,
    private confirmationService: ConfirmationService,
  ) {}

  /**
   * Any successful cart mutation invalidates a pending order confirmation: the
   * customer must see the updated summary before an order can be created.
   * A failure here is logged but never breaks the mutation — the stale row keeps
   * its old fingerprint, so create_order stays blocked (fail-closed).
   */
  private async invalidatePendingConfirmation(userId: string) {
    try {
      await this.confirmationService.invalidate(userId);
    } catch (error: any) {
      this.logger.error(
        `Failed to invalidate pending confirmation for user ${userId}: ${error?.message}`,
      );
    }
  }

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

  /**
   * Recalculate cart totals. MUST be called with the transaction client so the
   * totals update is atomic with the item changes that triggered it.
   */
  private async recalc(tx: PrismaService, cartId: string) {
    const items = await tx.cartItem.findMany({
      where: { cartId },
      include: { product: true },
    });
    const subtotal = items.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0,
    );
    const deliveryFee = subtotal >= 10000 ? 0 : 500;
    const total = subtotal + deliveryFee;

    return tx.cart.update({
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
    const items = result?.items ?? [];
    // Derive totals from items (same formula as recalc) so the response is
    // never stale when the persisted cart row was created with zero defaults.
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const deliveryFee = subtotal >= 10000 ? 0 : 500;
    const total = subtotal + deliveryFee;
    return { items, subtotal, deliveryFee, total };
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
    if (product.status !== 'active') {
      throw new BadRequestException('Produto inativo');
    }
    if (product.stock < quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Get or create cart safely (outside transaction)
    const cart = await this.getOrCreateCart(userId);
    const price = product.discountPrice || product.price;

    // Perform atomic operations inside transaction
    const updatedCart = await this.prisma.$transaction(async (tx) => {
      // Cast: Omit<PrismaClient, ITXClientDenyList> drops getter-based model delegates
      const t = tx as unknown as PrismaService;
      // Upsert cart item
      await t.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity: { increment: quantity }, price },
        create: { cartId: cart.id, productId, quantity, price },
      });

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await t.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals (inside the same transaction)
      return this.recalc(t, cart.id);
    });

    await this.invalidatePendingConfirmation(userId);

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
      const t = tx as unknown as PrismaService;
      if (quantity <= 0) {
        await t.cartItem.delete({
          where: { cartId_productId: { cartId: cart.id, productId } },
        }).catch(() => {
          // Item não existia — ignorar
        });
      } else {
        await t.cartItem.update({
          where: { cartId_productId: { cartId: cart.id, productId } },
          data: { quantity },
        });
      }

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await t.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals (inside the same transaction)
      return this.recalc(t, cart.id);
    });

    await this.invalidatePendingConfirmation(userId);

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
      const t = tx as unknown as PrismaService;
      // TOTAL REMOVAL: the whole cart line is deleted, there is no decrement here.
      await t.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
      }).catch(() => {
        // Item não existia — ignorar
      });

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await t.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals (inside the same transaction)
      return this.recalc(t, cart.id);
    });

    await this.invalidatePendingConfirmation(userId);

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
      const t = tx as unknown as PrismaService;
      await t.cartItem.deleteMany({ where: { cartId: cart.id } });

      // Record processed message for idempotency (only if externalMessageId is provided)
      if (externalMessageId) {
        await t.processedMessage.create({
          data: { externalMessageId, userId },
        });
      }

      // Recalculate cart totals (inside the same transaction)
      return this.recalc(t, cart.id);
    });

    await this.invalidatePendingConfirmation(userId);

    return { success: true, cart: updatedCart, idempotent: undefined };
  }
}