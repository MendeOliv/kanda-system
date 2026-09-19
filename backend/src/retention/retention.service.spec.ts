import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RetentionService, DEFAULT_RETENTION_HOURS } from './retention.service';

describe('RetentionService', () => {
  let service: RetentionService;
  let prisma: any;
  const conversationMessageMock = { deleteMany: jest.fn().mockResolvedValue({ count: 5 }) };
  const conversationLockMock = { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) };

  beforeEach(async () => {
    jest.clearAllMocks();
    conversationMessageMock.deleteMany.mockResolvedValue({ count: 5 });
    conversationLockMock.deleteMany.mockResolvedValue({ count: 2 });

    // Every other Prisma model exposes deleteMany so the test can assert they are
    // NEVER called (commercial data must be protected).
    prisma = {
      conversationMessage: conversationMessageMock,
      conversationLock: conversationLockMock,
      order: { deleteMany: jest.fn() },
      orderItem: { deleteMany: jest.fn() },
      cart: { deleteMany: jest.fn() },
      product: { deleteMany: jest.fn() },
      user: { deleteMany: jest.fn() },
      trackingHistory: { deleteMany: jest.fn() },
      pendingOrderConfirmation: { deleteMany: jest.fn() },
      conversation: { deleteMany: jest.fn() },
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RetentionService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = moduleRef.get<RetentionService>(RetentionService);
  });

  it('deletes only conversation messages older than NOW() - 12h', async () => {
    const now = new Date('2026-09-19T12:00:00Z');
    await service.runCleanup({ now });
    expect(conversationMessageMock.deleteMany).toHaveBeenCalledWith({
      where: { timestamp: { lt: new Date('2026-09-19T00:00:00Z') } },
    });
  });

  it('uses the configured retention hours when provided', async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        RetentionService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((k: string) => (k === 'RETENTION_MESSAGE_HOURS' ? 24 : undefined)) },
        },
      ],
    }).compile();
    const svc = mod.get<RetentionService>(RetentionService);
    const now = new Date('2026-09-19T12:00:00Z');
    await svc.runCleanup({ now });
    expect(conversationMessageMock.deleteMany).toHaveBeenCalledWith({
      where: { timestamp: { lt: new Date('2026-09-18T12:00:00Z') } },
    });
    await mod.close();
  });

  it('never touches commercial data (orders/cart/products/users/etc)', async () => {
    await service.runCleanup({ now: new Date('2026-09-19T12:00:00Z') });
    const protectedModels = [
      'order',
      'orderItem',
      'cart',
      'product',
      'user',
      'trackingHistory',
      'pendingOrderConfirmation',
      'conversation',
    ];
    for (const model of protectedModels) {
      expect(prisma[model].deleteMany).not.toHaveBeenCalled();
    }
  });

  it('cleans expired conversation locks but nothing else', async () => {
    const now = new Date('2026-09-19T12:00:00Z');
    await service.runCleanup({ now });
    expect(conversationLockMock.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: now } },
    });
  });

  it('returns deletion counts', async () => {
    const res = await service.runCleanup({ now: new Date('2026-09-19T12:00:00Z') });
    expect(res).toEqual({ deletedMessages: 5, deletedLocks: 2 });
  });
});