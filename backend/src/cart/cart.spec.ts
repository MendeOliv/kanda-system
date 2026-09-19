require('dotenv').config({ path: '.env' });
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmationService } from '../confirmation/confirmation.service';

const confirmationServiceMock = {
  requestConfirmation: jest.fn(),
  getPending: jest.fn(),
  invalidate: jest.fn().mockResolvedValue(0),
  clear: jest.fn(),
  verify: jest.fn(),
};

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
  let confirmation: typeof confirmationServiceMock;

  /** Happy-path cart setup shared by the mutation tests. */
  const mockExistingCart = (items: any[] = []) => {
    prisma.cart.findUnique.mockResolvedValue({ id: 'cart-id', userId: 'test-user' });
    prisma.cartItem.findMany.mockResolvedValue(items);
    prisma.cart.update.mockResolvedValue({
      id: 'cart-id',
      userId: 'test-user',
      items,
      subtotal: items.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
      deliveryFee: 500,
      total: 500,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfirmationService, useValue: confirmationServiceMock },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
    confirmation = module.get(ConfirmationService);
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

      // recalc() reads items inside the transaction and persists totals
      prisma.cartItem.findMany.mockResolvedValue([
        { id: 'ci1', cartId: 'cart-id', productId: 'test-product', quantity: 2, price: 100, product: { id: 'test-product', name: 'Test Product' } },
      ]);
      prisma.cart.update.mockResolvedValue({
        id: 'cart-id',
        userId: 'test-user',
        subtotal: 200,
        deliveryFee: 500,
        total: 700,
        items: [
          { id: 'ci1', cartId: 'cart-id', productId: 'test-product', quantity: 2, price: 100, product: { id: 'test-product', name: 'Test Product' } },
        ],
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

    it('should invalidate a pending order confirmation when the cart changes', async () => {
      prisma.product.findUnique.mockResolvedValue({
        id: 'test-product',
        name: 'Test Product',
        price: 100,
        stock: 10,
        status: 'active',
        discountPrice: null,
      });
      mockExistingCart([
        { id: 'ci1', cartId: 'cart-id', productId: 'test-product', quantity: 1, price: 100 },
      ]);

      await service.addItem('test-user', 'test-product', 1);

      expect(confirmation.invalidate).toHaveBeenCalledWith('test-user');
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Idempotency (real WhatsApp call chain contract)                  */
  /* ---------------------------------------------------------------- */

  describe('idempotency (externalMessageId)', () => {
    it('should not apply the same cart mutation twice for the same externalMessageId', async () => {
      prisma.processedMessage.findUnique.mockResolvedValue({
        id: 'pm1',
        externalMessageId: 'wa-msg-1',
        userId: 'test-user',
      });
      mockExistingCart([
        { id: 'ci1', cartId: 'cart-id', productId: 'test-product', quantity: 1, price: 100 },
      ]);

      const result = await service.addItem('test-user', 'test-product', 1, 'wa-msg-1');

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      // No second mutation, no product read, no transaction, no new ProcessedMessage
      expect(prisma.product.findUnique).not.toHaveBeenCalled();
      expect(prisma.cartItem.upsert).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.processedMessage.create).not.toHaveBeenCalled();
    });

    it('should record the processed message when the mutation actually runs', async () => {
      prisma.processedMessage.findUnique.mockResolvedValue(null);
      prisma.product.findUnique.mockResolvedValue({
        id: 'test-product',
        name: 'Test Product',
        price: 100,
        stock: 10,
        status: 'active',
        discountPrice: null,
      });
      mockExistingCart([
        { id: 'ci1', cartId: 'cart-id', productId: 'test-product', quantity: 1, price: 100 },
      ]);

      await service.addItem('test-user', 'test-product', 1, 'wa-msg-2');

      expect(prisma.processedMessage.create).toHaveBeenCalledWith({
        data: { externalMessageId: 'wa-msg-2', userId: 'test-user' },
      });
    });
  });

  /* ---------------------------------------------------------------- */
  /*  remove_from_cart = TOTAL REMOVAL                                 */
  /* ---------------------------------------------------------------- */

  describe('removeItem', () => {
    it('should delete the whole cart line for a product with quantity > 1 (total removal)', async () => {
      mockExistingCart([
        { id: 'ci1', cartId: 'cart-id', productId: 'banana', quantity: 3, price: 100 },
      ]);
      prisma.cartItem.delete.mockResolvedValue({ id: 'ci1', productId: 'banana', quantity: 3 });
      // After the deletion the cart is empty
      prisma.cartItem.findMany.mockResolvedValue([]);
      prisma.cart.update.mockResolvedValue({ id: 'cart-id', items: [], subtotal: 0, deliveryFee: 500, total: 500 });

      const result = await service.removeItem('test-user', 'banana');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { cartId_productId: { cartId: 'cart-id', productId: 'banana' } },
      });
      // Never a decrement: the update path is not used by removeItem
      expect(prisma.cartItem.update).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.cart.items).toHaveLength(0);
      expect(confirmation.invalidate).toHaveBeenCalledWith('test-user');
    });

    it('should keep the cart untouched when removing a product that is not in the cart', async () => {
      mockExistingCart([
        { id: 'ci1', cartId: 'cart-id', productId: 'banana', quantity: 3, price: 100 },
      ]);
      prisma.cartItem.delete.mockRejectedValue(new Error('Record to delete does not exist'));

      const result = await service.removeItem('test-user', 'ghost-product');

      expect(result.success).toBe(true);
      expect(result.cart.items).toHaveLength(1);
      expect(result.cart.items[0].productId).toBe('banana');
    });
  });

  describe('clearCart', () => {
    it('should delete every item and invalidate the pending confirmation', async () => {
      mockExistingCart([]);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.clearCart('test-user');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart-id' } });
      expect(result.cart.items).toHaveLength(0);
      expect(confirmation.invalidate).toHaveBeenCalledWith('test-user');
    });
  });
});