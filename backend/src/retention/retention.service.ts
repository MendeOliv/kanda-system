import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export const DEFAULT_RETENTION_HOURS = 12;

/**
 * Retention policy for conversational AI history.
 *
 * Only ConversationMessage rows older than the retention window are deleted.
 * Orders, order items, cart, products, customers, tracking history and other
 * commercial data are NEVER touched here. Expired ConversationLock rows are
 * cleaned too (they are transient operational rows, not commercial data) so the
 * lock table cannot grow without bound.
 *
 * Deliberately dependency-free on @nestjs/schedule: a plain in-process interval
 * is enough and avoids adding a new runtime dependency.
 */
@Injectable()
export class RetentionService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('Retention');
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private retentionHours(): number {
    const h = Number(this.configService.get<number>('RETENTION_MESSAGE_HOURS') ?? DEFAULT_RETENTION_HOURS);
    return Number.isFinite(h) && h > 0 ? h : DEFAULT_RETENTION_HOURS;
  }

  private intervalMs(): number {
    const ms = Number(this.configService.get<number>('RETENTION_INTERVAL_MS') ?? 3_600_000);
    return Number.isFinite(ms) && ms > 0 ? ms : 3_600_000;
  }

  onApplicationBootstrap() {
    const hours = this.retentionHours();
    const interval = this.intervalMs();
    this.logger.log(
      `[RETENTION] Cleanup scheduled every ${interval}ms (keep ${hours}h of conversation history)`,
    );
    // Run once shortly after startup, then on the interval.
    setTimeout(() => void this.runCleanup(), 5000).unref?.();
    this.timer = setInterval(() => void this.runCleanup(), interval);
  }

  onApplicationShutdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runCleanup(options: { now?: Date } = {}): Promise<{ deletedMessages: number; deletedLocks: number }> {
    const now = options.now ?? new Date();
    const cutoff = new Date(now.getTime() - this.retentionHours() * 3_600_000);

    this.logger.log('[RETENTION] Starting conversation cleanup');
    if (options.now) {
      this.logger.debug(`[RETENTION] Simulated now=${now.toISOString()} cutoff=${cutoff.toISOString()}`);
    }

    // AI conversational history only. Never commercial data.
    const deleted = await this.prisma.conversationMessage.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });
    this.logger.log(`[RETENTION] Deleted ${deleted.count} conversation messages`);

    // Transient operational rows; clear expired locks so they can't accumulate.
    const lockDel = await this.prisma.conversationLock.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    if (lockDel.count > 0) {
      this.logger.log(`[RETENTION] Deleted ${lockDel.count} expired conversation locks`);
    }

    this.logger.log('[RETENTION] Cleanup completed');
    return { deletedMessages: deleted.count, deletedLocks: lockDel.count };
  }
}