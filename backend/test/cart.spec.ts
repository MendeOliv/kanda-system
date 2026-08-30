require('dotenv').config({ path: '.env' });
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../src/cart/cart.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;
  const TEST_USER_ID_BASE = 'test-user-cart-01';
  const TEST_USER_A_BASE = 'user-a-cart';
  const TEST_USER_B_BASE = 'user-b-cart';
  const TEST_PRODUCT_ID_BASE = 'test-product-cart-01';
  const TEST_PRODUCT_2_ID_BASE = 'test-product-cart-02';
  const TEST_INACTIVE_PRODUCT_ID_BASE = 'test-product-inactive';
  const TEST_DISCOUNT_PRODUCT_ID_BASE = 'test-product-discount';
  const TEST_CATEGORY_ID_BASE = 'category-test';

  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [CartService, PrismaService],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: { in: [TEST_USER_ID_BASE, TEST_USER_A_BASE, TEST_USER_B_BASE] } } },
    });
    await prisma.cart.deleteMany({
      where: { userId: { in: [TEST_USER_ID_BASE, TEST_USER_A_BASE, TEST_USER_B_BASE] } },
    });
    await prisma.processedMessage.deleteMany({
      where: { userId: { in: [TEST_USER_ID_BASE, TEST_USER_A_BASE, TEST_USER_B_BASE] } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [TEST_PRODUCT_ID_BASE, TEST_PRODUCT_2_ID_BASE, TEST_INACTIVE_PRODUCT_ID_BASE, TEST_DISCOUNT_PRODUCT_ID_BASE] } },
    });
    await prisma.category.deleteMany({
      where: { id: TEST_CATEGORY_ID_BASE },
    });

    // Ensure test category exists
    await prisma.category.create({
      data: {
        id: TEST_CATEGORY_ID_BASE,
        name: 'Test Category',
        slug: 'test-category',
        isActive: true,
      },
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: { in: [TEST_USER_ID_BASE, TEST_USER_A_BASE, TEST_USER_B_BASE] } } },
    });
    await prisma.cart.deleteMany({
      where: { userId: { in: [TEST_USER_ID_BASE, TEST_USER_A_BASE, TEST_USER_B_BASE] } },
    });
    await prisma.processedMessage.deleteMany({
      where: { userId: { in: [TEST_USER_ID_BASE, TEST_USER_A_BASE, TEST_USER_B_BASE] } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [TEST_PRODUCT_ID_BASE, TEST_PRODUCT_2_ID_BASE, TEST_INACTIVE_PRODUCT_ID_BASE, TEST_DISCOUNT_PRODUCT_ID_BASE] } },
    });
    await prisma.category.deleteMany({
      where: { id: TEST_CATEGORY_ID_BASE },
    });
  });

  describe('A - adicionar produto existente', () => {
    it('should add an existing product to cart', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      const result = await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 2);
      expect(result.success).toBe(true);
      expect(result.cart.items.length).toBe(1);
      expect(result.cart.items[0].quantity).toBe(2);
      expect(result.cart.items[0].productId).toBe(TEST_PRODUCT_ID_BASE);
    });
  });

  describe('B - adicionar quantidade', () => {
    it('should add quantity to existing cart item', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      // First add 1
      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 1);
      // Then add 2 more
      const result = await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 2);
      expect(result.cart.items[0].quantity).toBe(3);
    });
  });

  describe('C - múltiplos produtos', () => {
    it('should handle multiple different products', async () => {
      // Create test products
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_2_ID_BASE,
          name: 'Test Product 2',
          sku: 'TEST-SKU-02',
          price: 200,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product 2 for cart',
        },
      });

      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 1);
      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_2_ID_BASE, 2);

      const cart = await service.getCart(TEST_USER_ID_BASE);
      expect(cart.items.length).toBe(2);
      const quantities = cart.items.map(item => item.quantity);
      expect(quantities).toContain(1);
      expect(quantities).toContain(2);
    });
  });

  describe('D - atualizar quantidade', () => {
    it('should update quantity of existing cart item', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 1);
      const result = await service.updateItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 5);
      expect(result.cart.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity set to 0 or less', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 1);
      await service.updateItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 0);
      const cart = await service.getCart(TEST_USER_ID_BASE);
      expect(cart.items.length).toBe(0);
    });
  });

  describe('E - remover produto', () => {
    it('should remove product from cart', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 3);
      await service.removeItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE);
      const cart = await service.getCart(TEST_USER_ID_BASE);
      expect(cart.items.length).toBe(0);
    });
  });

  describe('F - consultar carrinho', () => {
    it('should return cart with items, subtotal, total', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 2); // price 100 each
      const cart = await service.getCart(TEST_USER_ID_BASE);
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.subtotal).toBe(200); // 2 * 100
      // deliveryFee: 500 if subtotal < 10000
      expect(cart.deliveryFee).toBe(500);
      expect(cart.total).toBe(700); // 200 + 500
    });
  });

  describe('G - produto inexistente', () => {
    it('should throw NotFoundException for non-existent product', async () => {
      // Ensure category exists (already in beforeEach)
      await expect(
        service.addItem(TEST_USER_ID_BASE, 'non-existent-product', 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('H - produto inativo', () => {
    it('should throw BadRequestException for inactive product', async () => {
      // Create inactive product
      await prisma.product.create({
        data: {
          id: TEST_INACTIVE_PRODUCT_ID_BASE,
          name: 'Inactive Product',
          sku: 'INACTIVE-SKU',
          price: 50,
          stock: 10,
          status: 'inactive',
          categoryId: TEST_CATEGORY_ID_BASE,
        },
      });

      await expect(
        service.addItem(TEST_USER_ID_BASE, TEST_INACTIVE_PRODUCT_ID_BASE, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('I - quantidade inválida', () => {
    it('should throw BadRequestException for quantity <= 0', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await expect(
        service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 0),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, -1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('J - quantidade superior ao stock', () => {
    it('should throw BadRequestException when quantity exceeds stock', async () => {
      // Create test product with low stock
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await expect(
        service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 1000), // stock is 10
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('K - persistência após nova requisição/processo', () => {
    it('should persist cart across service instantiation', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      // Add item in this test
      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 3);
      // Now get cart via a new service instance (simulating new request)
      const module = await Test.createTestingModule({
        providers: [CartService, PrismaService],
      }).compile();
      const newService = module.get<CartService>(CartService);
      const cart = await newService.getCart(TEST_USER_ID_BASE);
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(3);
      await module.close();
    });
  });

  describe('L - concorrência / lost update', () => {
    it('should handle concurrent updates without lost update', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      // Reset cart for this test (already cleaned in beforeEach)
      const productId = TEST_PRODUCT_ID_BASE;
      const userId = TEST_USER_ID_BASE;

      // Simulate two concurrent addItem operations
      const add1 = service.addItem(userId, productId, 2);
      const add2 = service.addItem(userId, productId, 3);

      // Wait for both to complete
      const [result1, result2] = await Promise.all([add1, add2]);

      // The final quantity should be 5 (2+3)
      const cart = await service.getCart(userId);
      expect(cart.items[0].quantity).toBe(5);
      // Both operations should succeed
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe('M - retry / idempotência', () => {
    it('should not process the same externalMessageId twice', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      const externalMessageId = 'TEST-CART-IDEM-001';
      const productId = TEST_PRODUCT_ID_BASE;
      const userId = TEST_USER_ID_BASE;

      // First call
      const result1 = await service.addItem(userId, productId, 2, externalMessageId);
      expect(result1.success).toBe(true);
      expect(result1.cart.items[0].quantity).toBe(2);
      expect(result1.idempotent).toBeUndefined(); // first time not idempotent

      // Second call with same externalMessageId
      const result2 = await service.addItem(userId, productId, 2, externalMessageId);
      expect(result2.success).toBe(true);
      // Quantity should still be 2, not 4
      const cart = await service.getCart(userId);
      expect(cart.items[0].quantity).toBe(2);
      expect(result2.idempotent).toBe(true); // second time should be idempotent
    });
  });

  describe('N - preço e subtotal', () => {
    it('should calculate subtotal from product price, not from input', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      // Product price is 100
      await service.addItem(TEST_USER_ID_BASE, TEST_PRODUCT_ID_BASE, 1);
      const cart = await service.getCart(TEST_USER_ID_BASE);
      expect(cart.subtotal).toBe(100);
      // If we try to add with a different price via tool? Not possible, but we trust the service uses product price.
    });

    it('should use discountPrice if set', async () => {
      // Create test product with discount
      await prisma.product.create({
        data: {
          id: TEST_DISCOUNT_PRODUCT_ID_BASE,
          name: 'Discount Product',
          sku: 'DISCOUNT-SKU',
          price: 200,
          discountPrice: 150,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
        },
      });

      await service.addItem(TEST_USER_ID_BASE, TEST_DISCOUNT_PRODUCT_ID_BASE, 1);
      const cart = await service.getCart(TEST_USER_ID_BASE);
      // Should use discountPrice 150
      expect(cart.subtotal).toBe(150);
    });
  });

  describe('O - isolamento entre clientes', () => {
    it('should not allow user A to access user B\'s cart', async () => {
      // Create test product
      await prisma.product.create({
        data: {
          id: TEST_PRODUCT_ID_BASE,
          name: 'Test Product',
          sku: 'TEST-SKU-01',
          price: 100,
          stock: 10,
          status: 'active',
          categoryId: TEST_CATEGORY_ID_BASE,
          description: 'Test product for cart',
        },
      });

      await service.addItem(TEST_USER_A_BASE, TEST_PRODUCT_ID_BASE, 5);
      await service.addItem(TEST_USER_B_BASE, TEST_PRODUCT_ID_BASE, 3);

      const cartA = await service.getCart(TEST_USER_A_BASE);
      const cartB = await service.getCart(TEST_USER_B_BASE);

      expect(cartA.items[0].quantity).toBe(5);
      expect(cartB.items[0].quantity).toBe(3);
      // Ensure they are different
      expect(cartA.items[0].quantity).not.toBe(cartB.items[0].quantity);
    });
  });
});