import { AutomationService } from './automation.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { GeminiProvider } from './providers/gemini.provider';
import { GoogleVisionProvider } from './providers/google-vision.provider';
import { PaymentsService } from '../payments/payments.service';
import { BadRequestException } from '@nestjs/common';

describe('AutomationService', () => {
  let service: AutomationService;

  const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const mockProducts = { search: jest.fn() };
  const mockOrders = { create: jest.fn() };
  const mockPayments = { createPaymentForOrder: jest.fn() };
  const mockGemini = { isConfigured: false, parseShoppingList: jest.fn() };
  const mockVision = { isConfigured: false, extractText: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProductsService, useValue: mockProducts },
        { provide: OrdersService, useValue: mockOrders },
        { provide: PaymentsService, useValue: mockPayments },
        { provide: GeminiProvider, useValue: mockGemini },
        { provide: GoogleVisionProvider, useValue: mockVision },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── parseShoppingList ─────────────────────────────────────
  describe('parseShoppingList', () => {

    it('deve lançar erro se nem imageUrl nem text forem fornecidos', async () => {
      await expect(service.parseShoppingList({} as any)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se imageUrl for fornecida mas Vision não configurada', async () => {
      await expect(
        service.parseShoppingList({ imageUrl: 'https://img.example.com/lista.jpg' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve usar Vision + Gemini quando ambos estão configurados, com imageUrl', async () => {
      const backupVision = mockVision.isConfigured;
      mockVision.isConfigured = true;
      mockVision.extractText.mockResolvedValue('2 arroz\n1 óleo');

      mockGemini.isConfigured = true;
      mockGemini.parseShoppingList.mockResolvedValue([
        { name: 'Arroz Sol 25kg', quantity: 2, unit: 'un' },
        { name: 'Óleo Fula 5L', quantity: 1, unit: 'un' },
      ]);

      mockProducts.search
        .mockResolvedValueOnce([{ id: 'p1', sku: 'AL-001', name: 'Arroz Sol 25kg', price: 18500 }])
        .mockResolvedValueOnce([{ id: 'p2', sku: 'BE-002', name: 'Óleo Fula 5L', price: 9500 }]);

      const result = await service.parseShoppingList({ imageUrl: 'https://img.example.com/foto.jpg' });

      expect(mockVision.extractText).toHaveBeenCalledWith('https://img.example.com/foto.jpg');
      expect(mockGemini.parseShoppingList).toHaveBeenCalled();
      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(18500 * 2 + 9500 * 1);
      expect(result.rawText).toBe('2 arroz\n1 óleo');

      mockGemini.isConfigured = false;
      mockVision.isConfigured = backupVision;
    });

    it('deve usar fallback regex quando Gemini NÃO estiver configurado', async () => {
      mockProducts.search
        .mockResolvedValueOnce([{ id: 1, sku: 'AL-001', name: 'Arroz Sol 25kg', price: 18500 }])
        .mockResolvedValueOnce([{ id: 2, sku: 'BE-002', name: 'Água Mineral 5L', price: 1200 }]);

      const result = await service.parseShoppingList({ text: '2 arroz\n1 água' });

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(18500 * 2 + 1200 * 1);
      expect(result.rawText).toBe('2 arroz\n1 água');
      expect(result.unrecognizedItems).toHaveLength(0);
    });

    it('deve reportar itens não encontrados no catálogo', async () => {
      mockProducts.search.mockResolvedValue([]); // Nenhum match

      const result = await service.parseShoppingList({ text: '3 chocolate' });

      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.unrecognizedItems).toContain('chocolate');
    });

    it('deve tratar formato "arroz 5" (quantidade no fim)', async () => {
      mockProducts.search.mockResolvedValue([{ id: 1, sku: 'AL-001', name: 'Arroz Sol 25kg', price: 18500 }]);

      const result = await service.parseShoppingList({ text: 'arroz 5' });

      expect(result.products[0].quantity).toBe(5);
    });

    it('deve tratar texto sem quantidade (default 1)', async () => {
      mockProducts.search.mockResolvedValue([{ id: 1, sku: 'AL-001', name: 'Arroz Sol 25kg', price: 18500 }]);

      const result = await service.parseShoppingList({ text: 'arroz' });

      expect(result.products[0].quantity).toBe(1);
    });
  });

  // ─── syncOrder ──────────────────────────────────────────
  describe('syncOrder', () => {
    it('deve rejeitar dados inválidos (userPhone em falta)', async () => {
      await expect(service.syncOrder({ items: [] })).rejects.toThrow(BadRequestException);
    });

    it('deve criar order e link de pagamento para APPYPAY', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'u1', firebaseUid: 'wa:244999000', phone: '244999000' });

      (mockOrders.create as jest.Mock).mockResolvedValue({
        id: 'order-id',
        orderNumber: 'KND-CCCCCCCC-BBBB',
        totalAmount: 18700,
      });

      mockPayments.createPaymentForOrder.mockResolvedValue(
        { paymentUrl: 'https://appypay.com/pay/test' }
      );

      const result = await service.syncOrder({
        userPhone: '244999000',
        items: [{ productId: 'p1', quantity: 2 }],
        deliveryZone: 'KK5000',
        paymentMethod: 'APPYPAY',
      });

      expect(result.orderNumber).toBe('KND-CCCCCCCC-BBBB');
      expect(result.paymentUrl).toBe('https://appypay.com/pay/test');
    });
  });
});