import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { GeminiProvider } from './providers/gemini.provider';
import { GoogleVisionProvider } from './providers/google-vision.provider';

export interface LlmItem {
  name: string;
  quantity: number;
  unit: string | null;
}

export interface MatchedProduct {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  matchedSku: boolean;
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly gemini: GeminiProvider,
    private readonly vision: GoogleVisionProvider,
  ) {}

  async parseShoppingList(input: {
    imageUrl?: string;
    text?: string;
  }): Promise<{
    products: MatchedProduct[];
    total: number;
    rawText: string;
    unrecognizedItems: string[];
  }> {
    let rawText = '';

    if (input.imageUrl) {
      if (!this.vision.isConfigured) {
        throw new BadRequestException('OCR not configured');
      }
      rawText = await this.vision.extractText(input.imageUrl);
    } else if (input.text) {
      rawText = input.text;
    } else {
      throw new BadRequestException('No input provided');
    }

    let llmItems: LlmItem[];
    if (this.gemini.isConfigured) {
      this.logger.log('Using Gemini Flash to parse shopping list');
      llmItems = await this.gemini.parseShoppingList(rawText);
    } else {
      this.logger.warn('Gemini not configured - using regex fallback');
      llmItems = this.fallbackParse(rawText);
    }

    const { products: matched, unmatched } = await this.matchProducts(llmItems);
    const total = matched.reduce((sum, p) => sum + p.price * p.quantity, 0);

    return {
      products: matched,
      total,
      rawText,
      unrecognizedItems: unmatched,
    };
  }

  private async matchProducts(items: LlmItem[]) {
    const matched: MatchedProduct[] = [];
    const unmatched: string[] = [];

    for (const item of items) {
      const results = await this.productsService.search(item.name);
      if (results.length === 0) {
        unmatched.push(item.name);
        continue;
      }

      const best = results[0];
      matched.push({
        productId: best.id,
        sku: best.sku || '',
        name: best.name,
        price: Number(best.price),
        quantity: item.quantity,
        matchedSku: (best.sku || '').toLowerCase() === item.name.toLowerCase(),
      });
    }

    return { products: matched, unmatched };
  }

  /** Fallback regex: suporta "2 arroz" (quantidade-início) e "arroz 5" (quantidade-fim). */
  private fallbackParse(text: string): LlmItem[] {
    if (!text || typeof text !== 'string') {
      this.logger.warn('fallbackParse received non-string input');
      return [];
    }

    const lines = text.split('\n').filter(l => l.trim());
    const items: LlmItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Padrão: "2 arroz" (quantidade no início, nome depois)
      let match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
      if (match) {
        items.push({
          name: match[2].trim(),
          quantity: parseFloat(match[1].replace(',', '.')),
          unit: null,
        });
        continue;
      }

      // Padrão: "arroz 5" ou "arroz x5" (quantidade no final)
      match = trimmed.match(/^(.+?)\s+(?:x\s*)?(\d+(?:[.,]\d+)?)\s*$/);
      if (match) {
        items.push({
          name: match[1].trim(),
          quantity: parseFloat(match[2].replace(',', '.')),
          unit: null,
        });
        continue;
      }

      // Nenhuma quantidade explícita → default 1
      items.push({ name: trimmed, quantity: 1, unit: null });
    }

    return items;
  }

  async syncOrder(data: any) {
    const { userPhone, items, deliveryZone, paymentMethod } = data;
    
    if (!userPhone || !items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Invalid order data: userPhone and items are required');
    }

    let user = await this.prisma.user.findUnique({ where: { phone: userPhone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: userPhone,
          firebaseUid: `wa:${userPhone}`,
          role: 'USER',
          status: 'ACTIVE'
        }
      });
    }

    const order = await this.ordersService.create({
      items: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity })),
      deliveryZone,
      paymentMethod: paymentMethod || 'CASH',
      deliveryReference: data.deliveryReference || ''
    }, user.firebaseUid);

    let paymentUrl: string | null = null;
    if (paymentMethod === 'APPYPAY' || paymentMethod === 'MULTICAIXA') {
      const payment = await this.paymentsService.createPaymentForOrder(order.id);
      paymentUrl = payment.paymentUrl;
    }

    if (!order?.orderNumber) {
      throw new Error('Order creation failed — missing order number');
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.totalAmount,
      paymentUrl
    };
  }

  async getStatus(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: { status: true, paymentStatus: true, totalAmount: true }
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}