/**
 * LIVE PATH INTEGRATION — WhatsAppController -> AIService -> tool -> CartService/OrdersService
 *
 * Unlike the per-service unit tests, this spec wires the REAL WhatsAppController,
 * the REAL AIService and the REAL ConfirmationService together. Only the transport
 * boundaries are mocked (Baileys/Gemini, WhatsApp HTTP, Prisma, products).
 *
 * The objective is to prove that the real path carries:
 *   customerId         (resolved from the conversation JID, LID preserved)
 *   externalMessageId  (Baileys message.key.id, untouched)
 * down to CartService/OrdersService, and that the confirmation gate really blocks
 * create_order without an explicit confirmation from a previous message.
 */
const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { ConversationService } from '../conversation/conversation.service';
import { AIService } from '../ai/ai.service';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { ConfirmationService } from '../confirmation/confirmation.service';
import { PrismaService } from '../prisma/prisma.service';

const CUSTOMER_JID = '25838925955116@lid';
const WA_USER = { id: 'user-1', firebaseUid: CUSTOMER_JID, phone: 'lid:25838925955116' };

const CART = {
  items: [
    { productId: 'p1', quantity: 2, price: 100, product: { id: 'p1', name: 'Banana' } },
  ],
  subtotal: 200,
  deliveryFee: 500,
  total: 700,
};

/** In-memory stand-in for the PendingOrderConfirmation table. */
let confirmationStore: any = null;

const prismaMock: any = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  pendingOrderConfirmation: {
    findUnique: jest.fn(async ({ where }: any) =>
      confirmationStore && confirmationStore.userId === where.userId ? confirmationStore : null,
    ),
    upsert: jest.fn(async ({ create, update }: any) => {
      confirmationStore = confirmationStore
        ? { ...confirmationStore, ...update }
        : { id: 'pc1', ...create };
      return confirmationStore;
    }),
    deleteMany: jest.fn(async () => {
      const existed = !!confirmationStore;
      confirmationStore = null;
      return { count: existed ? 1 : 0 };
    }),
  },
};

const cartServiceMock: any = {
  getCart: jest.fn(),
  getCartWithItems: jest.fn(),
  addItem: jest.fn(),
  updateItem: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
};

const ordersServiceMock: any = { create: jest.fn() };

const conversationServiceMock: any = {
  messageExists: jest.fn().mockResolvedValue(false),
  getOrCreateConversation: jest
    .fn()
    .mockResolvedValue({ id: 'conv-1', customerId: CUSTOMER_JID }),
  getRecentMessages: jest.fn().mockResolvedValue([]),
  addMessage: jest.fn().mockImplementation(async (conversationId, data) => ({ id: 'm1', ...data })),
  withConversationLock: jest.fn(async (_id: string, operation: () => Promise<any>) => operation()),
};

const whatsappServiceMock: any = { sendMessage: jest.fn().mockResolvedValue(undefined) };

const toolCall = (...calls: Array<{ name: string; args: any }>) => ({
  response: {
    candidates: [
      { content: { parts: calls.map((c) => ({ functionCall: c, thoughtSignature: 'sig' })) } },
    ],
  },
});

const finalText = (text: string) => ({
  response: { text: () => text, candidates: [{ content: { parts: [] } }] },
});

describe('LIVE PATH: WhatsApp -> Conversation -> Gemini -> Cart -> Confirmation -> Order', () => {
  let controller: WhatsAppController;

  beforeEach(async () => {
    jest.clearAllMocks();
    confirmationStore = null;
    prismaMock.user.findUnique.mockResolvedValue(WA_USER);
    cartServiceMock.getCart.mockResolvedValue(CART);
    cartServiceMock.addItem.mockResolvedValue({ cart: CART, idempotent: false });
    ordersServiceMock.create.mockResolvedValue({
      orderNumber: 'KL-7777',
      totalAmount: 700,
      order: { totalAmount: 700 },
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsAppController],
      providers: [
        AIService,
        ConfirmationService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => (key === 'GEMINI_API_KEY' ? 'test-key' : null) },
        },
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductsService, useValue: { search: jest.fn().mockResolvedValue([]) } },
        { provide: CartService, useValue: cartServiceMock },
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: ConversationService, useValue: conversationServiceMock },
        { provide: WhatsAppService, useValue: whatsappServiceMock },
      ],
    }).compile();

    controller = module.get<WhatsAppController>(WhatsAppController);
  });

  const incoming = (body: string, externalMessageId: string) => ({
    from: CUSTOMER_JID,
    body,
    externalMessageId,
    timestamp: 1788271390, // Unix seconds, Baileys contract
    type: 'chat',
  });

  it('carries customerId and the inbound externalMessageId down to CartService', async () => {
    mockGenerateContent.mockResolvedValueOnce(
      toolCall({ name: 'add_to_cart', args: { productId: 'p1', quantity: 2 } }),
    );
    mockGenerateContent.mockResolvedValueOnce(finalText('Adicionei 2 bananas ao carrinho.'));

    const result = await controller.receiveMessage(incoming('quero 2 bananas', 'wa-live-1'));

    expect(result).toEqual({ status: 'Message received' });
    // customerId resolved the WhatsApp user...
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { firebaseUid: CUSTOMER_JID } });
    // ...and the exact inbound message id reached the cart idempotency layer
    expect(cartServiceMock.addItem).toHaveBeenCalledWith('user-1', 'p1', 2, 'wa-live-1');
    expect(whatsappServiceMock.sendMessage).toHaveBeenCalledWith(
      CUSTOMER_JID,
      'Adicionei 2 bananas ao carrinho.',
    );
  });

  it('refuses create_order when no confirmation is pending (Gemini cannot force it)', async () => {
    mockGenerateContent.mockResolvedValueOnce(toolCall({ name: 'create_order', args: {} }));
    mockGenerateContent.mockResolvedValueOnce(finalText('Preciso que confirme o pedido.'));

    await controller.receiveMessage(incoming('faz o pedido logo', 'wa-live-2'));

    expect(ordersServiceMock.create).not.toHaveBeenCalled();
    expect(confirmationStore).toBeNull();
  });

  it('runs the full flow: summary -> explicit confirmation in the NEXT message -> order', async () => {
    // Message 1: customer asks to finish -> summary + CONFIRMATION_PENDING, no order
    mockGenerateContent.mockResolvedValueOnce(toolCall({ name: 'request_order_confirmation', args: {} }));
    mockGenerateContent.mockResolvedValueOnce(finalText('Resumo do pedido... Confirma? (sim/não)'));

    await controller.receiveMessage(incoming('quero finalizar', 'wa-live-3'));

    expect(confirmationStore).not.toBeNull();
    expect(confirmationStore.cartFingerprint).toBe('p1:2:100');
    expect(confirmationStore.externalMessageId).toBe('wa-live-3');
    expect(ordersServiceMock.create).not.toHaveBeenCalled();

    // Message 2: customer explicitly confirms -> order created and state cleared
    mockGenerateContent.mockResolvedValueOnce(toolCall({ name: 'create_order', args: {} }));
    mockGenerateContent.mockResolvedValueOnce(finalText('Pedido KL-7777 criado com sucesso!'));

    await controller.receiveMessage(incoming('sim, confirmo', 'wa-live-4'));

    expect(ordersServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ externalMessageId: 'wa-live-4' }),
      'user-1',
    );
    expect(confirmationStore).toBeNull();
    expect(whatsappServiceMock.sendMessage).toHaveBeenLastCalledWith(
      CUSTOMER_JID,
      'Pedido KL-7777 criado com sucesso!',
    );
  });

  it('refuses to consume a confirmation created by the SAME inbound message', async () => {
    // Gemini tries to summarise and create the order in a single turn: the customer
    // never saw the summary and never confirmed it.
    mockGenerateContent.mockResolvedValueOnce(
      toolCall(
        { name: 'request_order_confirmation', args: {} },
        { name: 'create_order', args: {} },
      ),
    );
    mockGenerateContent.mockResolvedValueOnce(finalText('Confirma este pedido?'));

    await controller.receiveMessage(incoming('fechar pedido', 'wa-live-6'));

    expect(ordersServiceMock.create).not.toHaveBeenCalled();
    // The pending confirmation survives so the customer can still confirm it
    expect(confirmationStore).not.toBeNull();
  });

  it('keeps the order idempotent for a repeated externalMessageId', async () => {
    mockGenerateContent.mockResolvedValueOnce(toolCall({ name: 'request_order_confirmation', args: {} }));
    mockGenerateContent.mockResolvedValueOnce(finalText('Confirma?'));
    await controller.receiveMessage(incoming('finalizar', 'wa-live-7'));

    mockGenerateContent.mockResolvedValueOnce(toolCall({ name: 'create_order', args: {} }));
    mockGenerateContent.mockResolvedValueOnce(finalText('Pedido criado!'));
    await controller.receiveMessage(incoming('sim', 'wa-live-8'));

    expect(ordersServiceMock.create).toHaveBeenCalledTimes(1);

    // The very same inbound message (Baileys redelivery) is ignored by the controller
    conversationServiceMock.messageExists.mockResolvedValueOnce(true);
    mockGenerateContent.mockResolvedValueOnce(toolCall({ name: 'create_order', args: {} }));
    mockGenerateContent.mockResolvedValueOnce(finalText('Pedido criado!'));
    const replay = await controller.receiveMessage(incoming('sim', 'wa-live-8'));

    expect(replay).toEqual({ status: 'Message received (duplicate ignored)' });
    expect(ordersServiceMock.create).toHaveBeenCalledTimes(1);
  });
});
