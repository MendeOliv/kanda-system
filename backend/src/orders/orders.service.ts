import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Zone, PaymentMethod, OrderStatus, PaymentStatus, Prisma, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CartService } from '../cart/cart.service';

/**
 * Explicit interactive-transaction timeout for order creation.
 *
 * The 5000ms Prisma default is too tight for this transaction: create()
 * legitimately issues several sequential, bounded round-trips (order-number
 * probe + one conditional stock decrement per cart line + order insert + cart
 * cleanup + tracking) against the remote Supabase/Postgres over a connection
 * pooler. The incident that triggered this fix exceeded the 5s default
 * (5379ms observed). 20s leaves a wide, safe margin while still failing fast on
 * a genuinely hung query. This is set after analysing the cause (many remote
 * round-trips), not as a blind bump.
 */
const ORDER_TX_TIMEOUT_MS = 20_000;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService, private cartService: CartService) {}

  private async resolveUser(identifier: string) {
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: identifier },
    });
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { id: identifier } });
    }
    return user;
  }

  private async generateOrderNumber(tx: PrismaService): Promise<string> {
    let orderNumber = '';
    let exists = true;
    while (exists) {
      orderNumber = `KL-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = await tx.order.findUnique({ where: { orderNumber } });
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

  async create(createOrderDto: any, identifier?: string) {
    if (!identifier) {
      throw new BadRequestException('Autenticação de utilizador necessária');
    }

    const user = await this.resolveUser(identifier);
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }

    const externalMessageId = createOrderDto?.externalMessageId;

    // Get cart with items (before transaction for early validation)
    const cart = await this.cartService.getCartWithItems(user.id);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio ou não encontrado');
    }

    // Validate products exist (before transaction for early validation)
    const productIds = cart.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Um ou mais produtos são inválidos ou inativos');
    }
    const productMap = new Map<string, Product>(products.map(p => [p.id, p]));

    // Pre-validate product status before transaction
    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId);
      if (!product) {
        throw new NotFoundException(`Produto não encontrado: ${cartItem.productId}`);
      }
      if (product.status !== 'active') {
        throw new BadRequestException(`Produto inativo: ${product.name}`);
      }
    }

    const zone = this.normalizeZone(createOrderDto.deliveryZone || 'KK5000');
    const deliveryReference = createOrderDto.deliveryReference || 'N/A';
    const paymentMethod = this.normalizePaymentMethod(createOrderDto.paymentMethod);

    // Idempotency pre-check (read-only, OUTSIDE the transaction).
    //
    // Moving this read out of the write transaction removes one remote round-trip
    // from it. Correctness under a race is still guaranteed by the
    // UNIQUE(externalMessageId) column: a concurrent duplicate makes order.create
    // throw P2002 inside the transaction, which aborts the WHOLE transaction (so
    // stock is never decremented twice) and is handled below by returning the
    // already-existing order.
    if (externalMessageId) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { externalMessageId },
        include: { items: { include: { product: true } } },
      });
      if (existingOrder) {
        this.logger.warn(
          `Idempotent create_order: externalMessageId=${externalMessageId} → returning existing order ${existingOrder.orderNumber}`,
        );
        return {
          success: true,
          order: existingOrder,
          id: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          totalAmount: existingOrder.totalAmount,
        };
      }
    }

    // Everything that must be atomic runs inside a single transaction
    // (order, order items, stock decrement, tracking, cart cleanup).
    let createdOrder: any;
    try {
      createdOrder = await this.prisma.$transaction(
        async (tx) => {
          // Cast: Omit<PrismaClient, ITXClientDenyList> drops getter-based model delegates
          const t = tx as unknown as PrismaService;

          // Generate order number (inside tx to avoid collision)
          const orderNumber = await this.generateOrderNumber(t);

          // Decrement stock conditionally for each item
          let subtotal = 0;
          const itemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

          for (const cartItem of cart.items) {
            const product = productMap.get(cartItem.productId)!;

            // Conditional stock decrement: only if stock >= quantity
            try {
              await t.product.update({
                where: {
                  id: cartItem.productId,
                  stock: { gte: cartItem.quantity },
                },
                data: {
                  stock: { decrement: cartItem.quantity },
                },
              });
            } catch (err: any) {
              if (err?.code === 'P2025') {
                throw new BadRequestException(
                  `Stock insuficiente para produto: ${product.name} (disponível: ${product.stock}, pedido: ${cartItem.quantity})`,
                );
              }
              throw err;
            }

            const price = product.discountPrice || product.price;
            subtotal += Number(price) * cartItem.quantity;
            itemsData.push({
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price,
            });
          }

          const deliveryFee = subtotal >= 10000 ? 0 : 500;
          const totalAmount = subtotal + deliveryFee;

          // Create order with items
          const orderData: any = {
            orderNumber,
            userId: user.id,
            addressId: createOrderDto.addressId,
            zone,
            deliveryReference,
            paymentMethod,
            deliveryFee,
            subtotal,
            totalAmount,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            notes: createOrderDto.notes,
            items: { create: itemsData },
          };
          if (externalMessageId) {
            orderData.externalMessageId = externalMessageId;
          }

          const created = await t.order.create({
            data: orderData,
            include: { items: { include: { product: true } } },
          });

          // Clear cart items and reset totals (still inside transaction)
          await t.cartItem.deleteMany({
            where: { cartId: cart.id },
          });

          await t.cart.update({
            where: { id: cart.id },
            data: { subtotal: 0, deliveryFee: 0, total: 0 },
          });

          // Create initial tracking entry (inside transaction for atomicity)
          await t.trackingHistory.create({
            data: {
              orderId: created.id,
              status: 'PENDING',
              description: 'Pedido criado com sucesso',
            },
          });

          return created;
        },
        { timeout: ORDER_TX_TIMEOUT_MS },
      );
    } catch (err: any) {
      // Concurrent duplicate on UNIQUE(externalMessageId) — e.g. an AIService
      // retry racing a just-committed create. The transaction already rolled
      // back (nothing persisted, stock not decremented again), so return the
      // existing order instead of surfacing a raw P2002.
      if (err?.code === 'P2002' && externalMessageId) {
        const winner = await this.prisma.order.findUnique({
          where: { externalMessageId },
          include: { items: { include: { product: true } } },
        });
        if (winner) {
          this.logger.warn(
            `Idempotent create_order (P2002 race): externalMessageId=${externalMessageId} → returning existing order ${winner.orderNumber}`,
          );
          return {
            success: true,
            order: winner,
            id: winner.id,
            orderNumber: winner.orderNumber,
            totalAmount: winner.totalAmount,
          };
        }
      }
      throw err;
    }

    return {
      success: true,
      order: createdOrder,
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      totalAmount: createdOrder.totalAmount,
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
      const t = tx as unknown as PrismaService;
      // Repor stock
      for (const item of await t.orderItem.findMany({ where: { orderId: id } })) {
        await t.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await t.order.update({ where: { id }, data: { status: 'CANCELLED' } });

      // Tracking inside transaction for atomicity
      await t.trackingHistory.create({
        data: {
          orderId: id,
          status: 'CANCELLED',
          description: 'Pedido cancelado pelo utilizador',
        },
      });
    });

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