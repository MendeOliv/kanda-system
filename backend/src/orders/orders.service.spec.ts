import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const decimal = (value: number) => new Decimal(value);

const mockUser = {
  id: 'user1',
  firebaseUid: 'firebaseUid1',
  phone: '923456789',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  avatar: null,
  role: UserRole.USER,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockProduct1 = {
  id: 'product1',
  name: 'Product 1',
  price: decimal(100),
  stock: 10,
  status: 'active',
  categoryId: 'cat1',
  sku: 'SKU1',
  description: null,
  imageUrl: null,
  discountPrice: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct2 = {
  id: 'product2',
  name: 'Product 2',
  price: decimal(50),
  stock: 5,
  status: 'active',
  categoryId: 'cat2',
  sku: 'SKU2',
  description: null,
  imageUrl: null,
  discountPrice: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createOrderDto: any = {
  items: [
    { productId: 'product1', quantity: 2 },
    { productId: 'product2', quantity: 1 },
  ],
  deliveryZone: 'KK5000',
  deliveryReference: 'ref1',
  addressId: 'addr1',
  paymentMethod: 'CASH',
  notes: 'Test order',
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, PrismaService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.spyOn(prisma, '$transaction').mockImplementation(async (fn: any) => {
      if (typeof fn === 'function') {
        return fn(prisma as unknown as Prisma.TransactionClient);
      }
      return fn;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order and generate a KL-XXXX order number', async () => {
          jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
          jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null as any);
          jest.spyOn(prisma.product, 'findMany').mockResolvedValueOnce([mockProduct1, mockProduct2] as any);
          jest.spyOn(prisma.product, 'update').mockResolvedValueOnce({ ...mockProduct1, stock: 8 } as any)
            .mockResolvedValueOnce({ ...mockProduct2, stock: 3 } as any);
      jest.spyOn(prisma.order, 'create').mockResolvedValueOnce({
        id: 'order1',
        orderNumber: 'KL-1234',
        userId: 'user1',
        zone: 'KK5000',
        deliveryReference: 'ref1',
        addressId: 'addr1',
        paymentMethod: 'CASH',
        deliveryFee: decimal(500),
        subtotal: decimal(250),
        totalAmount: decimal(750),
        status: 'PENDING',
        paymentStatus: 'PENDING',
        notes: 'Test order',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any);
      jest.spyOn(prisma.trackingHistory, 'create').mockResolvedValueOnce(null as any);

      const order = await service.create(createOrderDto, 'firebaseUid1');

      expect(order).toBeDefined();
      expect(order.orderNumber).toMatch(/^KL-\d{4}$/);
      expect(Number(order.totalAmount)).toBe(750);
    });

    it('should throw an error when user is not found', async () => {
          jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

          await expect(service.create(createOrderDto, 'unknown')).rejects.toThrow(
            'Utilizador não encontrado',
          );
        });

    it('should throw an error when a product is invalid', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(prisma.product, 'findMany').mockResolvedValueOnce([mockProduct1] as any);

      await expect(service.create(createOrderDto, 'firebaseUid1')).rejects.toThrow(
        'Um ou mais produtos são inválidos ou inativos',
      );
    });
  });
});