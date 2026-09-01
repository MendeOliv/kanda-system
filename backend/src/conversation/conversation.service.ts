import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get or create a conversation for a customer (WhatsApp JID/phone)
   */
  async getOrCreateConversation(customerId: string) {
    // Try to find existing conversation by customerId
    const conversation = await this.prisma.conversation.findFirst({
      where: { customerId },
    });

    if (conversation) {
      return conversation;
    }

    // Create new conversation
    return this.prisma.conversation.create({
      data: {
        customerId,
      },
    });
  }

  /**
   * Add a message to a conversation
   * @param conversationId The conversation ID
   * @param data The message data (without conversation relation)
   */
  async addMessage(
    conversationId: string,
    data: Omit<Prisma.ConversationMessageCreateInput, 'conversation'>,
  ) {
    return this.prisma.conversationMessage.create({
      data: {
        ...data,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
      },
    });
  }

  /**
     * Get recent messages for a conversation, limited to the last N messages
     * @param conversationId The conversation ID
     * @param limit The number of most recent messages to retrieve (default: 10)
     */
    async getRecentMessages(
      conversationId: string,
      limit: number = 10,
    ) {
      // Exclude very old messages (likely test artifacts) to prevent history pollution
      const cutoff = new Date('2024-01-01');
      return this.prisma.conversationMessage.findMany({
        where: {
          conversationId,
          timestamp: {
            gte: cutoff,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    }

  /**
   * Process a message with concurrency control for a specific conversation.
   * Ensures that messages for the same conversation are processed sequentially using a database-based lock.
   * @param conversationId The conversation ID
   * @param operation The async operation to perform
   */
  async withConversationLock<T>(
    conversationId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const lockDuration = 15000; // 15 seconds lock duration
    const acquisitionTimeout = 20000; // 20 seconds to acquire lock
    const retryInterval = 100; // 100 ms between retries

    const startTime = Date.now();
    let lastError;

    while (Date.now() - startTime < acquisitionTimeout) {
      try {
        // Try to create the lock
        await this.prisma.conversationLock.create({
          data: {
            conversationId,
            expiresAt: new Date(Date.now() + lockDuration),
          },
        });

        // Lock acquired, now run the operation and then release the lock
        try {
          return await operation();
        } finally {
          // Release the lock by deleting it
          await this.prisma.conversationLock.deleteMany({
            where: {
              conversationId,
            },
          });
        }
      } catch (error) {
        // Handle unique constraint violation (lock already exists)
        if (error.code === 'P2002') {
          // Check if the existing lock is expired
          const existingLock = await this.prisma.conversationLock.findUnique({
            where: { conversationId },
          });

          if (existingLock && existingLock.expiresAt < new Date()) {
            // Expired lock, delete it and retry
            await this.prisma.conversationLock.delete({
              where: { id: existingLock.id },
            });
            // Continue to try creating the lock again
            continue;
          }

          // Lock exists and is not expired, wait and retry
          await new Promise(resolve => setTimeout(resolve, retryInterval));
          continue;
        }

        // For other errors (e.g., expired lock due to concurrent deletion), throw immediately
        throw error;
      }
    }

    // If we exited the loop, we timed out
    throw new Error(
      `Could not acquire lock for conversation ${conversationId} after ${acquisitionTimeout}ms`,
    );
  }

  /**
   * Check if a message with the given externalMessageId already exists (idempotency)
   * @param externalMessageId The external message ID from WhatsApp
   */
  async messageExists(externalMessageId: string): Promise<boolean> {
    const count = await this.prisma.conversationMessage.count({
      where: { externalMessageId },
    });
    return count > 0;
  }
}