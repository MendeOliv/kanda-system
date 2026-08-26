import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly locks = new Map<string, Promise<any>>();

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
            id: conversationId
          }
        }
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
    return this.prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Process a message with concurrency control for a specific conversation.
   * Ensures that messages for the same conversation are processed sequentially.
   * @param conversationId The conversation ID
   * @param operation The async operation to perform
   */
  async withConversationLock<T>(
    conversationId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    // Get the existing lock for this conversation, or create a new one
    let lock = this.locks.get(conversationId);
    if (!lock) {
      lock = Promise.resolve();
      this.locks.set(conversationId, lock);
    }

    // Chain the new operation after the current lock
    const newLock = lock.then(async () => {
      try {
        return await operation();
      } finally {
        // Remove the lock when done
        this.locks.delete(conversationId);
      }
    });

    // Update the lock for this conversation
    this.locks.set(conversationId, newLock);

    return newLock;
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