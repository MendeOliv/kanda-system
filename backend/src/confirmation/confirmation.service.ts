import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** How long a confirmation request stays valid before the customer must ask again. */
export const CONFIRMATION_TTL_MS = 15 * 60 * 1000;

export interface CartFingerprintLine {
  productId: string;
  quantity: number;
  // Decimal (Prisma) or number — always converted with Number()
  price: unknown;
}

/**
 * Deterministic fingerprint of the cart contents.
 *
 * It is the invalidation mechanism of the confirmation gate: if the cart changes
 * between `request_order_confirmation` and `create_order`, the fingerprint no
 * longer matches and the order is refused.
 */
export function buildCartFingerprint(lines: readonly CartFingerprintLine[] = []): string {
  return lines
    .map((line) => `${line.productId}:${Number(line.quantity)}:${Number(line.price)}`)
    .sort()
    .join('|');
}

export interface ConfirmationVerifyResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Persisted state machine for order confirmation:
 *
 *   CART -> request_order_confirmation -> CONFIRMATION_PENDING (this row)
 *        -> customer explicitly confirms (a NEW inbound message)
 *        -> create_order allowed -> row cleared
 *
 * The Gemini instruction is not the protection: this service is. `create_order`
 * cannot execute without a pending confirmation that is still valid.
 */
@Injectable()
export class ConfirmationService {
  private readonly logger = new Logger(ConfirmationService.name);

  constructor(private prisma: PrismaService) {}

  /** Persist that a confirmation was requested for the current cart contents. */
  async requestConfirmation(
    userId: string,
    cartFingerprint: string,
    options: { conversationId?: string; externalMessageId?: string } = {},
  ) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CONFIRMATION_TTL_MS);

    const pending = await this.prisma.pendingOrderConfirmation.upsert({
      where: { userId },
      update: {
        cartFingerprint,
        conversationId: options.conversationId ?? null,
        externalMessageId: options.externalMessageId ?? null,
        requestedAt: now,
        expiresAt,
      },
      create: {
        userId,
        cartFingerprint,
        conversationId: options.conversationId ?? null,
        externalMessageId: options.externalMessageId ?? null,
        requestedAt: now,
        expiresAt,
      },
    });

    this.logger.log(
      `Confirmation requested for user ${userId} (expires ${expiresAt.toISOString()}, msg ${options.externalMessageId ?? 'n/a'})`,
    );
    return pending;
  }

  /** Read the pending confirmation row, without validating it. */
  async getPending(userId: string) {
    return this.prisma.pendingOrderConfirmation.findUnique({ where: { userId } });
  }

  /** Drop any pending confirmation (cart mutation, empty cart, consumed order). */
  async invalidate(userId: string) {
    const { count } = await this.prisma.pendingOrderConfirmation.deleteMany({ where: { userId } });
    if (count > 0) {
      this.logger.log(`Pending confirmation invalidated for user ${userId}`);
    }
    return count;
  }

  /** Alias of invalidate() used after a successful order. */
  async clear(userId: string) {
    return this.invalidate(userId);
  }

  /**
   * Deterministic gate: is order creation allowed right now?
   *
   * Refuses when there is no pending confirmation, when it expired, when the cart
   * changed since the summary was shown, or when the confirmation was requested by
   * the very same inbound message that is trying to create the order (a customer
   * cannot confirm a summary they never saw).
   */
  async verify(
    userId: string,
    cartFingerprint: string,
    currentExternalMessageId: string = '',
  ): Promise<ConfirmationVerifyResult> {
    const pending = await this.getPending(userId);

    if (!pending) {
      return {
        allowed: false,
        reason:
          'Nenhuma confirmação pendente. Apresente o resumo do carrinho e pergunte ao cliente se confirma o pedido antes de criá-lo.',
      };
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
      await this.invalidate(userId);
      return {
        allowed: false,
        reason: 'A confirmação expirou. Apresente o resumo novamente e peça uma nova confirmação.',
      };
    }

    if (
      pending.externalMessageId &&
      currentExternalMessageId &&
      pending.externalMessageId === currentExternalMessageId
    ) {
      return {
        allowed: false,
        reason:
          'A confirmação tem de vir de uma mensagem posterior ao resumo. Pergunte ao cliente se confirma o pedido e aguarde a resposta.',
      };
    }

    if (pending.cartFingerprint !== cartFingerprint) {
      await this.invalidate(userId);
      return {
        allowed: false,
        reason: 'O carrinho mudou depois do resumo. Apresente o resumo atualizado e peça nova confirmação.',
      };
    }

    return { allowed: true };
  }
}
