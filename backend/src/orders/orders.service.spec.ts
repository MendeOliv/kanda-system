import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { Prisma, PaymentStatus, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/* ------------------------------------------------------------------ */
/*  Mock factories                                                     */
/* ------------------------------------------------------------------ */

function makeProduct(overrides: Record<string, any> = {}) {
  return {
    id: 'p1',
    name: 'Product 1',
    description: 'Desc',
    price: new Decimal(100),
    discountPrice: null,
    stock: 10,
    sku: 'SKU-001',
    categoryId: 'cat1',
    imageUrl: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    brandId: null,
    ...overrides,
  };
}

function makeUser(overrides: Record<string, any> = {}) {
  return {
    id: 'user1',
    firebaseUid: 'firebaseUid1',
    phone: '+244900000001',
    firstName: 'Test',
    lastName: 'User',
    email: null,
    avatar: null,
    role: 'USER',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function makeCartItem(overrides: Record<string, any> = {}) {
  return {
    id: 'ci1',
    productId: 'p1',
    quantity: 2,
    price: new Decimal(100),
    product: makeProduct(),
    ...overrides,
  };
}

function makeCart(items: any[] = [makeCartItem()], overrides: Record<string, any> = {}) {
  return {
    id: 'cart1',
    userId: 'user1',
    items,
    subtotal: new Decimal(0),
    deliveryFee: new Decimal(0),
    total: new Decimal(0),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCreatedOrder(overrides: Record<string, any> = {}) {
  return {
    id: 'order1',
    orderNumber: 'KL-1234',
    userId: 'user1',
    addressId: 'addr1',
    zone: 'KK5000',
    deliveryReference: 'ref1',
    paymentMethod: 'CASH',
    deliveryFee: new Decimal(500),
    subtotal: new Decimal(250),
    totalAmount: new Decimal(750),
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    notes: 'Test order',
    externalMessageId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Prisma mock builder                                                */
/* ------------------------------------------------------------------ */

function buildPrismaMock() {
  const m: any = {
    user: { findUnique: jest.fn() },
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    trackingHistory: { create: jest.fn() },
    orderItem: { findMany: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
    cart: { update: jest.fn() },
    processedMessage: { findUnique: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(async (cb: any) => {
      const txMock = {
        ...m,
        $transaction: undefined,
      };
      return cb(txMock);
    }),
  };
  return m;
}

const cartServiceMock: any = {
  getCartWithItems: jest.fn(),
};

/* ------------------------------------------------------------------ */
/*  Default DTO                                                        */
/* ------------------------------------------------------------------ */

function defaultDto(overrides: Record<string, any> = {}) {
  return {
    deliveryZone: 'KK5000',
    deliveryReference: 'ref1',
    addressId: 'addr1',
    paymentMethod: 'CASH',
    notes: 'Test order',
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: ReturnType<typeof buildPrismaMock>;
  let cartService: typeof cartServiceMock;

  beforeEach(async () => {
    prisma = buildPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* ================================================================ */
  /*  Pre-condition: user validation                                   */
  /* ================================================================ */

  describe('authentication required', () => {
    it('should throw BadRequestException when no identifier provided', async () => {
      await expect(service.create(defaultDto())).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.create(defaultDto(), 'unknown')).rejects.toThrow(NotFoundException);
    });
  });

  /* ================================================================ */
  /*  A — Criar pedido a partir do carrinho                            */
  /* ================================================================ */

  describe('A — create order from cart', () => {
    it('should create an order with correct KL-XXXX order number', async () => {
      const user = makeUser();
      const product1 = makeProduct();
      const product2 = makeProduct({ id: 'p2', name: 'Product 2', price: new Decimal(50) });
      const cartItems = [
        makeCartItem({ productId: 'p1', quantity: 2, price: new Decimal(100), product: product1 }),
        makeCartItem({ id: 'ci2', productId: 'p2', quantity: 1, price: new Decimal(50), product: product2 }),
      ];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product1, product2]);
      prisma.product.update
        .mockResolvedValueOnce({ ...product1, stock: 8 })
        .mockResolvedValueOnce({ ...product2, stock: 4 });
      prisma.order.findUnique.mockResolvedValue(null); // order number unique
      const createdOrder = makeCreatedOrder();
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: 'Pedido criado com sucesso' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(result.success).toBe(true);
      expect(result.orderNumber).toMatch(/^KL-\d{4}$/);
      expect(prisma.order.create).toHaveBeenCalledTimes(1);
      expect(prisma.trackingHistory.create).toHaveBeenCalledTimes(1);
    });
  });

  /* ================================================================ */
  /*  B — Múltiplos itens                                              */
  /* ================================================================ */

  describe('B — multiple items', () => {
    it('should create order with multiple cart items', async () => {
      const user = makeUser();
      const p1 = makeProduct({ id: 'p1', price: new Decimal(100) });
      const p2 = makeProduct({ id: 'p2', name: 'Product 2', price: new Decimal(50) });
      const p3 = makeProduct({ id: 'p3', name: 'Product 3', price: new Decimal(200) });
      const items = [
        makeCartItem({ productId: 'p1', quantity: 2, price: new Decimal(100), product: p1 }),
        makeCartItem({ id: 'ci2', productId: 'p2', quantity: 1, price: new Decimal(50), product: p2 }),
        makeCartItem({ id: 'ci3', productId: 'p3', quantity: 3, price: new Decimal(200), product: p3 }),
      ];
      const cart = makeCart(items);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([p1, p2, p3]);
      prisma.product.update
        .mockResolvedValueOnce({ ...p1, stock: 8 })
        .mockResolvedValueOnce({ ...p2, stock: 4 })
        .mockResolvedValueOnce({ ...p3, stock: 7 });
      prisma.order.findUnique.mockResolvedValue(null);

      // subtotal = 2*100 + 1*50 + 3*200 = 850
      const createdOrder = makeCreatedOrder({
        subtotal: new Decimal(850),
        deliveryFee: new Decimal(500),
        totalAmount: new Decimal(1350),
      });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(result.success).toBe(true);
      expect(Number(result.totalAmount)).toBe(1350);
      expect(prisma.order.create).toHaveBeenCalledTimes(1);
      // 3 products = 3 stock decrements
      expect(prisma.product.update).toHaveBeenCalledTimes(3);
    });
  });

  /* ================================================================ */
  /*  C — Carrinho vazio                                               */
  /* ================================================================ */

  describe('C — empty cart', () => {
    it('should throw BadRequestException when cart is null', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      cartService.getCartWithItems.mockResolvedValue(null);
      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cart has no items', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      cartService.getCartWithItems.mockResolvedValue(makeCart([]));
      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow(BadRequestException);
    });
  });

  /* ================================================================ */
  /*  D — Produto inexistente                                          */
  /* ================================================================ */

  describe('D — non-existent product in cart', () => {
    it('should throw BadRequestException when product count does not match', async () => {
      const user = makeUser();
      const cartItems = [
        makeCartItem({ productId: 'p-missing', quantity: 1 }),
      ];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      // findMany returns fewer products than requested
      prisma.product.findMany.mockResolvedValue([]);

      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow(BadRequestException);
    });
  });

  /* ================================================================ */
  /*  E — Produto inativo                                              */
  /* ================================================================ */

  describe('E — inactive product', () => {
    it('should throw BadRequestException for inactive product', async () => {
      const user = makeUser();
      const inactiveProduct = makeProduct({ status: 'inactive' });
      const cartItems = [makeCartItem({ product: inactiveProduct })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([inactiveProduct]);

      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow(BadRequestException);
    });
  });

  /* ================================================================ */
  /*  F — Stock insuficiente                                           */
  /* ================================================================ */

  describe('F — insufficient stock', () => {
    it('should throw BadRequestException when stock < quantity (P2025 error)', async () => {
      const user = makeUser();
      const product = makeProduct({ stock: 3 });
      const cartItems = [makeCartItem({ quantity: 5, product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.order.findUnique.mockResolvedValue(null);

      // Simulate P2025 Prisma error for conditional stock update failure
      const p2025Error = Object.assign(new Error('Record to update not found'), {
        code: 'P2025',
        clientVersion: '6.0.0',
        meta: { cause: 'Record to update not found' },
      });
      prisma.product.update.mockRejectedValue(p2025Error);

      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow(BadRequestException);
    });
  });

  /* ================================================================ */
  /*  G — Preço atual (do produto real)                                */
  /* ================================================================ */

  describe('G — current product price', () => {
    it('should use the real product price, not any arbitrary input', async () => {
      const user = makeUser();
      const product = makeProduct({ price: new Decimal(350), discountPrice: null });
      const cartItems = [makeCartItem({ quantity: 1, price: new Decimal(350), product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 9 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder({
        subtotal: new Decimal(350),
        totalAmount: new Decimal(850), // 350 + 500 delivery
      });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(Number(result.totalAmount)).toBe(850);
    });

    it('should use discountPrice when available', async () => {
      const user = makeUser();
      const product = makeProduct({ price: new Decimal(200), discountPrice: new Decimal(150) });
      const cartItems = [makeCartItem({ quantity: 2, price: new Decimal(150), product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      // subtotal = 2 * 150 = 300
      const createdOrder = makeCreatedOrder({
        subtotal: new Decimal(300),
        totalAmount: new Decimal(800), // 300 + 500
      });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(Number(result.totalAmount)).toBe(800);
    });
  });

  /* ================================================================ */
  /*  H — Subtotal                                                     */
  /* ================================================================ */

  describe('H — subtotal', () => {
    it('should compute subtotal as sum of (price * quantity) for each item', async () => {
      const user = makeUser();
      const p1 = makeProduct({ id: 'p1', price: new Decimal(100) });
      const p2 = makeProduct({ id: 'p2', name: 'Product 2', price: new Decimal(250) });
      const items = [
        makeCartItem({ productId: 'p1', quantity: 3, price: new Decimal(100), product: p1 }),
        makeCartItem({ id: 'ci2', productId: 'p2', quantity: 2, price: new Decimal(250), product: p2 }),
      ];
      const cart = makeCart(items);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([p1, p2]);
      prisma.product.update
        .mockResolvedValueOnce({ ...p1, stock: 7 })
        .mockResolvedValueOnce({ ...p2, stock: 3 });
      prisma.order.findUnique.mockResolvedValue(null);

      // subtotal = 3*100 + 2*250 = 800
      const createdOrder = makeCreatedOrder({
        subtotal: new Decimal(800),
        totalAmount: new Decimal(1300), // 800 + 500
      });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(Number(result.totalAmount)).toBe(1300);
    });
  });

  /* ================================================================ */
  /*  I — Total (subtotal + deliveryFee)                               */
  /* ================================================================ */

  describe('I — total', () => {
    it('should add delivery fee (500) when subtotal < 10000', async () => {
      const user = makeUser();
      const product = makeProduct({ price: new Decimal(100) });
      const cartItems = [makeCartItem({ quantity: 1, product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 9 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder({
        subtotal: new Decimal(100),
        deliveryFee: new Decimal(500),
        totalAmount: new Decimal(600),
      });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(Number(result.totalAmount)).toBe(600);
    });

    it('should offer free delivery when subtotal >= 10000', async () => {
      const user = makeUser();
      const product = makeProduct({ price: new Decimal(5000) });
      const cartItems = [makeCartItem({ quantity: 3, product })]; // 15000
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 7 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder({
        subtotal: new Decimal(15000),
        deliveryFee: new Decimal(0),
        totalAmount: new Decimal(15000),
      });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      const result = await service.create(defaultDto(), 'firebaseUid1');

      expect(Number(result.totalAmount)).toBe(15000);
    });
  });

  /* ================================================================ */
  /*  J — Persistência                                                 */
  /* ================================================================ */

  describe('J — persistence', () => {
    it('should call order.create with correct data structure', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder();
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      await service.create(defaultDto(), 'firebaseUid1');

      expect(prisma.order.create).toHaveBeenCalledTimes(1);
      const createCall = prisma.order.create.mock.calls[0][0];
      expect(createCall.data.userId).toBe('user1');
      expect(createCall.data.zone).toBe('KK5000');
      expect(createCall.data.status).toBe(OrderStatus.PENDING);
      expect(createCall.data.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(createCall.data.items).toBeDefined();
    });
  });

  /* ================================================================ */
  /*  K — Atomicidade (all-or-nothing)                                 */
  /* ================================================================ */

  describe('K — atomicity', () => {
    it('should run order creation, cart cleanup, and tracking inside a single $transaction', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder();
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      await service.create(defaultDto(), 'firebaseUid1');

      // $transaction was called
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      // All these operations were called
      expect(prisma.product.update).toHaveBeenCalled();
      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
      expect(prisma.cart.update).toHaveBeenCalled();
      expect(prisma.trackingHistory.create).toHaveBeenCalled();
    });

    it('should roll back everything if order creation fails', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      // Order creation fails
      prisma.order.create.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow('DB connection lost');
      // Cart should NOT be cleaned (transaction rolled back)
      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(prisma.trackingHistory.create).not.toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  L — Isolamento (userId isolation)                                */
  /* ================================================================ */

  describe('L — isolation', () => {
    it('should use userId from auth, not from request body', async () => {
      const userA = makeUser({ id: 'userA', firebaseUid: 'fbA' });
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems, { userId: 'userA' });

      prisma.user.findUnique.mockResolvedValue(userA);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder({ userId: 'userA' });
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      await service.create(defaultDto(), 'fbA');

      const createCall = prisma.order.create.mock.calls[0][0];
      expect(createCall.data.userId).toBe('userA');
    });
  });

  /* ================================================================ */
  /*  M — Concorrência (stock race condition)                          */
  /* ================================================================ */

  describe('M — stock concurrency', () => {
    it('should fail the second order when two compete for the same stock', async () => {
      const user = makeUser();
      const product = makeProduct({ stock: 3 }); // only 3 available

      // Simulate two concurrent requests, each wanting 3
      const makeSetup = () => {
        const cartItems = [makeCartItem({ quantity: 3, product })];
        const cart = makeCart(cartItems);
        return { cartItems, cart };
      };

      const setup1 = makeSetup();
      const setup2 = makeSetup();

      // Both users resolve
      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems
        .mockResolvedValueOnce(setup1.cart)
        .mockResolvedValueOnce(setup2.cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.order.findUnique.mockResolvedValue(null);

      // First order succeeds (stock 3 >= 3, decrement to 0)
      prisma.product.update
        .mockResolvedValueOnce({ ...product, stock: 0 }) // first order: 3→0
        .mockRejectedValueOnce( // second order: stock 0 < 3 → P2025
          Object.assign(new Error('Record to update not found'), {
            code: 'P2025',
            clientVersion: '6.0.0',
            meta: {},
          }),
        );

      const createdOrder1 = makeCreatedOrder();
      prisma.order.create
        .mockResolvedValueOnce(createdOrder1)
        .mockRejectedValueOnce(new Error('should not be called'));

      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      // Run both concurrently
      const [result1, result2] = await Promise.allSettled([
        service.create(defaultDto(), 'firebaseUid1'),
        service.create(defaultDto(), 'firebaseUid1'),
      ]);

      expect(result1.status).toBe('fulfilled');
      expect(result2.status).toBe('rejected');
    });
  });

  /* ================================================================ */
  /*  N — Carrinho após pedido                                         */
  /* ================================================================ */

  describe('N — cart cleanup after order', () => {
    it('should clear cart items and reset totals after successful order', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder();
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      await service.create(defaultDto(), 'firebaseUid1');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart1' } });
      expect(prisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart1' },
        data: { subtotal: 0, deliveryFee: 0, total: 0 },
      });
    });
  });

  /* ================================================================ */
  /*  O — Rollback                                                    */
  /* ================================================================ */

  describe('O — rollback on stock failure', () => {
    it('should not create order or clean cart when stock decrement fails', async () => {
      const user = makeUser();
      const product = makeProduct({ stock: 1 });
      const cartItems = [makeCartItem({ quantity: 5, product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.order.findUnique.mockResolvedValue(null);

      // Stock update fails (1 < 5)
      prisma.product.update.mockRejectedValue(
        Object.assign(new Error('Record to update not found'), {
          code: 'P2025',
          clientVersion: '6.0.0',
          meta: {},
        }),
      );

      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow(BadRequestException);

      // Order should NOT be created
      expect(prisma.order.create).not.toHaveBeenCalled();
      // Cart should NOT be cleaned
      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(prisma.trackingHistory.create).not.toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  IDEMPOTÊNCIA COMERCIAL (critical blocker)                        */
  /* ================================================================ */

  describe('IDEMPOTENCY — return same order for duplicate externalMessageId', () => {
    it('should return existing order without creating a new one', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);
      const externalMessageId = 'wa-msg-001';

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);

      const existingOrder = makeCreatedOrder({
        externalMessageId,
        orderNumber: 'KL-9999',
      });

      // Inside transaction, the FIRST findUnique call is the idempotency check.
      // If it finds the existing order, it returns early (no generateOrderNumber, no stock update, etc).
      prisma.order.findUnique
        .mockResolvedValueOnce(existingOrder); // idempotency check returns existing order

      const result = await service.create(
        defaultDto({ externalMessageId }),
        'firebaseUid1',
      );

      expect(result.success).toBe(true);
      expect(result.orderNumber).toBe('KL-9999');
      // Stock should NOT be decremented (idempotent return)
      expect(prisma.product.update).not.toHaveBeenCalled();
      // New order should NOT be created
      expect(prisma.order.create).not.toHaveBeenCalled();
      // Cart should NOT be cleaned
      expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('should handle concurrent idempotent requests safely', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);
      const externalMessageId = 'wa-msg-concurrent';

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);

      const existingOrder = makeCreatedOrder({ externalMessageId });

      // Both findUnique calls return the existing order (simulating race resolution)
      prisma.order.findUnique.mockResolvedValue(existingOrder);

      const [result1, result2] = await Promise.all([
        service.create(defaultDto({ externalMessageId }), 'firebaseUid1'),
        service.create(defaultDto({ externalMessageId }), 'firebaseUid1'),
      ]);

      // Both should return the same order
      expect(result1.orderNumber).toBe(existingOrder.orderNumber);
      expect(result2.orderNumber).toBe(existingOrder.orderNumber);
      // Neither should create a new order
      expect(prisma.order.create).not.toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  TRACKING ATOMIC — tracking inside transaction                    */
  /* ================================================================ */

  describe('TRACKING ATOMICITY', () => {
    it('should create tracking history inside the same transaction as the order', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);

      const createdOrder = makeCreatedOrder();
      prisma.order.create.mockResolvedValue(createdOrder);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      prisma.cart.update.mockResolvedValue({ id: 'cart1', subtotal: 0, deliveryFee: 0, total: 0 });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th1', orderId: 'order1', status: 'PENDING', date: new Date(), description: '' });

      await service.create(defaultDto(), 'firebaseUid1');

      // Verify tracking was created as part of the transaction callback
      expect(prisma.trackingHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order1',
          status: 'PENDING',
          description: 'Pedido criado com sucesso',
        },
      });
    });

    it('should not create tracking if order creation fails (transaction rollback)', async () => {
      const user = makeUser();
      const product = makeProduct();
      const cartItems = [makeCartItem({ product })];
      const cart = makeCart(cartItems);

      prisma.user.findUnique.mockResolvedValue(user);
      cartService.getCartWithItems.mockResolvedValue(cart);
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.product.update.mockResolvedValue({ ...product, stock: 8 });
      prisma.order.findUnique.mockResolvedValue(null);
      prisma.order.create.mockRejectedValue(new Error('Constraint violation'));

      await expect(service.create(defaultDto(), 'firebaseUid1')).rejects.toThrow();

      // Tracking should NOT be created on rollback
      expect(prisma.trackingHistory.create).not.toHaveBeenCalled();
    });
  });

  /* ================================================================ */
  /*  cancel — should include tracking in transaction                  */
  /* ================================================================ */

  describe('cancel', () => {
    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.cancel('unknown', 'order1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(service.cancel('firebaseUid1', 'order1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order already cancelled', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.order.findFirst.mockResolvedValue({ id: 'order1', status: 'CANCELLED' });
      await expect(service.cancel('firebaseUid1', 'order1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel order, restore stock, and create tracking in transaction', async () => {
      const user = makeUser();
      prisma.user.findUnique.mockResolvedValue(user);
      prisma.order.findFirst.mockResolvedValue({ id: 'order1', status: 'PENDING', userId: 'user1' });
      prisma.orderItem.findMany.mockResolvedValue([
        { id: 'oi1', orderId: 'order1', productId: 'p1', quantity: 2, price: new Decimal(100) },
      ]);
      prisma.product.update.mockResolvedValue(makeProduct({ stock: 12 }));
      prisma.order.update.mockResolvedValue({ id: 'order1', status: 'CANCELLED' });
      prisma.trackingHistory.create.mockResolvedValue({ id: 'th2', orderId: 'order1', status: 'CANCELLED', date: new Date(), description: '' });

      const result = await service.cancel('firebaseUid1', 'order1');

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { stock: { increment: 2 } },
      });
      expect(prisma.trackingHistory.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order1',
          status: 'CANCELLED',
          description: 'Pedido cancelado pelo utilizador',
        },
      });
    });
  });

  /* ================================================================ */
  /*  findUserOrders                                                   */
  /* ================================================================ */

  describe('findUserOrders', () => {
    it('should return orders for the authenticated user', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.order.findMany.mockResolvedValue([
        { id: 'order1', orderNumber: 'KL-1000', status: 'PENDING' },
      ]);

      const result = await service.findUserOrders('firebaseUid1');
      expect(result.orders).toHaveLength(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findUserOrders('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  /* ================================================================ */
  /*  findOne                                                          */
  /* ================================================================ */

  describe('findOne', () => {
    it('should return a specific order', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.order.findFirst.mockResolvedValue({
        id: 'order1',
        orderNumber: 'KL-1000',
        status: 'PENDING',
        items: [],
        trackingHistory: [],
      });

      const result = await service.findOne('firebaseUid1', 'order1');
      expect(result.order).toBeDefined();
      expect(result.order.id).toBe('order1');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());
      prisma.order.findFirst.mockResolvedValue(null);
      await expect(service.findOne('firebaseUid1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  /* ================================================================ */
  /*  tracking                                                         */
  /* ================================================================ */

  describe('tracking', () => {
    it('should return order tracking history', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order1',
        orderNumber: 'KL-1000',
        status: 'PENDING',
        trackingHistory: [
          { id: 'th1', status: 'PENDING', description: 'Pedido criado', date: new Date() },
        ],
      });

      const result = await service.tracking('firebaseUid1', 'order1');
      expect(result.status).toBe('PENDING');
      expect(result.history).toHaveLength(1);
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.tracking('firebaseUid1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
