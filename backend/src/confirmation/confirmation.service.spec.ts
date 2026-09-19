import { Test, TestingModule } from '@nestjs/testing';
import {
  ConfirmationService,
  buildCartFingerprint,
  CONFIRMATION_TTL_MS,
} from './confirmation.service';
import { PrismaService } from '../prisma/prisma.service';

const prismaMock: any = {
  pendingOrderConfirmation: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
};

/** A valid, non-expired pending confirmation row. */
const pendingRow = (overrides: Record<string, any> = {}) => ({
  id: 'pc1',
  userId: 'user-1',
  conversationId: null,
  externalMessageId: 'wa-msg-1',
  cartFingerprint: 'p1:2:100',
  requestedAt: new Date(Date.now() - 60_000),
  expiresAt: new Date(Date.now() + 60_000),
  ...overrides,
});

describe('buildCartFingerprint', () => {
  it('is stable regardless of the item order', () => {
    const a = buildCartFingerprint([
      { productId: 'p1', quantity: 2, price: 100 },
      { productId: 'p2', quantity: 1, price: 50 },
    ]);
    const b = buildCartFingerprint([
      { productId: 'p2', quantity: 1, price: 50 },
      { productId: 'p1', quantity: 2, price: 100 },
    ]);
    expect(a).toBe(b);
  });

  it('changes when a quantity changes', () => {
    const before = buildCartFingerprint([{ productId: 'p1', quantity: 2, price: 100 }]);
    const after = buildCartFingerprint([{ productId: 'p1', quantity: 3, price: 100 }]);
    expect(before).not.toBe(after);
  });

  it('is empty for an empty cart', () => {
    expect(buildCartFingerprint([])).toBe('');
    expect(buildCartFingerprint()).toBe('');
  });
});

describe('ConfirmationService (deterministic order-confirmation gate)', () => {
  let service: ConfirmationService;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfirmationService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ConfirmationService>(ConfirmationService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
    prisma.pendingOrderConfirmation.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('persists CONFIRMATION_PENDING bound to the cart fingerprint with a TTL', async () => {
    const before = Date.now();
    prisma.pendingOrderConfirmation.upsert.mockImplementation(async ({ create }: any) => create);

    const row = await service.requestConfirmation('user-1', 'p1:2:100', {
      externalMessageId: 'wa-msg-1',
    });

    expect(prisma.pendingOrderConfirmation.upsert).toHaveBeenCalledTimes(1);
    const args = prisma.pendingOrderConfirmation.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ userId: 'user-1' });
    expect(args.create).toMatchObject({
      userId: 'user-1',
      cartFingerprint: 'p1:2:100',
      externalMessageId: 'wa-msg-1',
    });
    const ttl = new Date(row.expiresAt).getTime() - before;
    expect(ttl).toBeGreaterThan(CONFIRMATION_TTL_MS - 5_000);
    expect(ttl).toBeLessThanOrEqual(CONFIRMATION_TTL_MS + 5_000);
  });

  it('BLOCKS create_order when there is no pending confirmation', async () => {
    prisma.pendingOrderConfirmation.findUnique.mockResolvedValue(null);

    const result = await service.verify('user-1', 'p1:2:100', 'wa-msg-2');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Nenhuma confirmação pendente');
  });

  it('BLOCKS and clears an expired confirmation', async () => {
    prisma.pendingOrderConfirmation.findUnique.mockResolvedValue(
      pendingRow({ expiresAt: new Date(Date.now() - 1_000) }),
    );

    const result = await service.verify('user-1', 'p1:2:100', 'wa-msg-2');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('expirou');
    expect(prisma.pendingOrderConfirmation.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('BLOCKS a confirmation requested by the very same inbound message', async () => {
    prisma.pendingOrderConfirmation.findUnique.mockResolvedValue(
      pendingRow({ externalMessageId: 'wa-same' }),
    );

    const result = await service.verify('user-1', 'p1:2:100', 'wa-same');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('mensagem posterior');
    // The pending state is kept: the customer may still confirm in the next message
    expect(prisma.pendingOrderConfirmation.deleteMany).not.toHaveBeenCalled();
  });

  it('BLOCKS and invalidates when the cart changed after the summary', async () => {
    prisma.pendingOrderConfirmation.findUnique.mockResolvedValue(
      pendingRow({ cartFingerprint: 'p1:2:100' }),
    );

    const result = await service.verify('user-1', 'p1:3:100', 'wa-msg-2');

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('carrinho mudou');
    expect(prisma.pendingOrderConfirmation.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });
  });

  it('ALLOWS create_order for a valid pending confirmation from a previous message', async () => {
    prisma.pendingOrderConfirmation.findUnique.mockResolvedValue(
      pendingRow({ cartFingerprint: 'p1:2:100', externalMessageId: 'wa-msg-1' }),
    );

    const result = await service.verify('user-1', 'p1:2:100', 'wa-msg-2');

    expect(result.allowed).toBe(true);
    expect(prisma.pendingOrderConfirmation.deleteMany).not.toHaveBeenCalled();
  });

  it('clears the pending confirmation on demand (cart mutation / successful order)', async () => {
    await service.invalidate('user-1');
    expect(prisma.pendingOrderConfirmation.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    });

    await service.clear('user-1');
    expect(prisma.pendingOrderConfirmation.deleteMany).toHaveBeenCalledTimes(2);
  });
});
