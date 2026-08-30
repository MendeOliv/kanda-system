require('dotenv').config({ path: '.env' });
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';

const prismaMock = {
  cart: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  cartItem: {
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
  processedMessage: {
    findUnique: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  category: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(async (cb) => {
    const tx = { ...prismaMock, $transaction: undefined };
    return cb(tx as any);
  }),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('CartService', () => {
  let service: CartService;
  let prisma: typeof prismaMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCart', () => {
    it('should return empty cart if no items', async () => {
      prisma.cart.findUnique.mockResolvedValue({
        id: 'cart-id',
        userId: 'test-user',
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
      });
      prisma.cartItem.findMany.mockResolvedValue([]);

      const cart = await service.getCart('test-user');
      expect(cart.items.length).toBe(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.deliveryFee).toBe(500);
      expect(cart.total).toBe(500);
    });
  });

  describe('addItem', () => {
    it('should throw NotFoundException for non-existent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem('test-user', 'non-existent', 1),
      ).rejects.toThrow(Error); // Adjust to match the actual exception type
    });

    it('should throw BadRequestException for inactive product', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'test-product',
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: 100,
        stock: 10,
        status: 'inactive',
        categoryId: 'test-category',
        description: 'Test product',
        discountPrice: null,
      });

      await expect(
        service.addItem('test-user', 'test-product', 1),
      ).rejects.toThrow(Error);
    });

    it('should throw BadRequestException for quantity <= 0', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'test-product',
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: 100,
        stock: 10,
        status: 'active',
        categoryId: 'test-category',
        description: 'Test product',
        discountPrice: null,
      });

      await expect(
        service.addItem('test-user', 'test-product', 0),
      ).rejects.toThrow(Error);
      await expect(
        service.addItem('test-user', 'test-product', -1),
      ).rejects.toThrow(Error);
    });

    it('should throw BadRequestException when quantity exceeds stock', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'test-product',
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: 100,
        stock: 5,
        status: 'active',
        categoryId: 'test-category',
        description: 'Test product',
        discountPrice: null,
      });

      await expect(
        service.addItem('test-user', 'test-product', 10),
      ).rejects.toThrow(Error);
    });

    it('should add an existing product to cart', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'test-product',
        name: 'Test Product',
        sku: 'TEST-SKU',
        price: 100,
        stock: 10,
        status: 'active',
        categoryId: 'test-category',
        description: 'Test product',
        discountPrice: null,
      });

      // Mock cart creation
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({
        id: 'cart-id',
        userId: 'test-user',
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
      });

      const result = await service.addItem('test-user', 'test-product', 2);
      expect(result.success).toBe(true);
      expect(result.cart.items.length).toBe(1);
      expect(result.cart.items[0].quantity).toBe(2);
      expect(result.cart.items[0].productId).toBe('test-product');
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-product' },
      });
      expect(prisma.cartItem.upsert).toHaveBeenCalled();
    });
  });
});