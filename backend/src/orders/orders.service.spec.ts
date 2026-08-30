import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { Prisma, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock the PrismaService
const prismaServiceMock = {
  user: {
    findUnique: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  trackingHistory: {
    create: jest.fn(),
  },
  cartItem: {
    deleteMany: jest.fn(),
  },
  cart: {
    update: jest.fn(),
  },
  processedMessage: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(async (cb: any) => {
    // Create a transaction mock object that has the same structure but without $transaction to avoid infinite loop
    const txMock = {
      ...prismaServiceMock,
      $transaction: undefined, // avoid infinite loop
    };
    return cb(txMock);
  }),
};

// Mock the CartService
const cartServiceMock = {
  getCartWithItems: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: typeof prismaServiceMock;
  let cartService: typeof cartServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    // @ts-ignore
    prisma = module.get(PrismaService);
    // @ts-ignore
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error when user is not found', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      const createOrderDto = {
        deliveryZone: 'KK5000',
        deliveryReference: 'ref1',
        addressId: 'addr1',
        paymentMethod: 'CASH',
        notes: 'Test order',
      };

      // Act & Assert
      await expect(service.create(createOrderDto, 'unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error when cart is empty', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue({ id: 'user1', firebaseUid: 'firebaseUid1' });
      cartService.getCartWithItems.mockResolvedValue(null); // empty cart

      const createOrderDto = {
        deliveryZone: 'KK5000',
        deliveryReference: 'ref1',
        addressId: 'addr1',
        paymentMethod: 'CASH',
        notes: 'Test order',
      };

      // Act & Assert
      await expect(service.create(createOrderDto, 'firebaseUid1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create an order from cart and generate a KL-XXXX order number', async () => {
      // Arrange
      const userId = 'user1';
      const firebaseUid = 'firebaseUid1';
      const mockUser = { id: userId, firebaseUid };
      const mockProduct1 = {
        id: 'p1',
        name: 'Product 1',
        price: new Decimal(100),
        discountPrice: null,
        stock: 10,
        status: 'active',
      };
      const mockProduct2 = {
        id: 'p2',
        name: 'Product 2',
        price: new Decimal(50),
        discountPrice: null,
        stock: 5,
        status: 'active',
      };
      const mockCartItems = [
        {
          id: 'ci1',
          productId: 'p1',
          quantity: 2,
          price: new Decimal(100),
          product: mockProduct1,
        },
        {
          id: 'ci2',
          productId: 'p2',
          quantity: 1,
          price: new Decimal(50),
          product: mockProduct2,
        },
      ];
      const mockCart = {
        id: 'cart1',
        userId: userId,
        items: mockCartItems,
        subtotal: new Decimal(250), // 2*100 + 1*50
        deliveryFee: new Decimal(500),
        total: new Decimal(750),
        updatedAt: new Date(),
      };

      // Set up mocks
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.order.findUnique.mockResolvedValue(null); // no existing order number
      prisma.product.findMany.mockResolvedValue([mockProduct1, mockProduct2]);
      // Mock product update calls (decrement stock)
      prisma.product.update
        .mockResolvedValueOnce({ ...mockProduct1, stock: 8 }) // 10 - 2
        .mockResolvedValueOnce({ ...mockProduct2, stock: 4 }); // 5 - 1
      prisma.order.create.mockResolvedValue({
        id: 'order1',
        orderNumber: 'KL-1234',
        userId: userId,
        zone: 'KK5000',
        deliveryReference: 'ref1',
        addressId: 'addr1',
        paymentMethod: 'CASH',
        deliveryFee: new Decimal(500),
        subtotal: new Decimal(250),
        totalAmount: new Decimal(750),
        status: 'PENDING',
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Test order',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      });
      prisma.trackingHistory.create.mockResolvedValue(undefined);
      cartService.getCartWithItems.mockResolvedValue(mockCart);
      // Mock deleteMany and update for cart
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });

      const createOrderDto = {
        deliveryZone: 'KK5000',
        deliveryReference: 'ref1',
        addressId: 'addr1',
        paymentMethod: 'CASH',
        notes: 'Test order',
      };

      // Act
      const result = await service.create(createOrderDto, firebaseUid);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderNumber).toMatch(/^KL-\d{4}$/);
      expect(Number(result.totalAmount)).toBe(750);
      expect(cartService.getCartWithItems).toHaveBeenCalledWith(userId);
      expect(prisma.product.update).toHaveBeenCalledTimes(2);
      expect(prisma.order.create).toHaveBeenCalledTimes(1);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart1' } });
      expect(prisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart1' },
        data: { subtotal: 0, deliveryFee: 0, total: 0 },
      });
      expect(prisma.trackingHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order1',
          status: 'PENDING',
          description: 'Pedido criado com sucesso',
        },
      });
    });
  });
});