import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppController, normalizeIncomingTimestamp, normalizeRole } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { AIService } from '../ai/ai.service';
import { ConversationService } from '../conversation/conversation.service';

describe('normalizeIncomingTimestamp (Baileys Unix seconds contract)', () => {
  it('converts unix seconds to milliseconds Date', () => {
    const date = normalizeIncomingTimestamp(1788271390);
    expect(date.getTime()).toBe(1788271390000);
    expect(date.getFullYear()).toBeGreaterThan(2000);
  });

  it('passes milliseconds through unchanged (legacy/adapter fallback)', () => {
    const ms = Date.now();
    const date = normalizeIncomingTimestamp(ms);
    expect(date.getTime()).toBe(ms);
  });
});

describe('normalizeRole', () => {
  it('normalizes mixed legacy role casing', () => {
    expect(normalizeRole('USER')).toBe('user');
    expect(normalizeRole('user')).toBe('user');
    expect(normalizeRole('ASSISTANT')).toBe('model');
    expect(normalizeRole('assistant')).toBe('model');
    expect(normalizeRole('model')).toBe('model');
    expect(normalizeRole(null)).toBe('model');
  });
});

describe('WhatsAppController', () => {
  let controller: WhatsAppController;
  let whatsappService: WhatsAppService;
  let aiService: AIService;
  let conversationService: ConversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsAppController],
      providers: [
        {
          provide: WhatsAppService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: AIService,
          useValue: {
            generateResponseWithHistory: jest.fn().mockResolvedValue('Test response'),
          },
        },
        {
          provide: ConversationService,
          useValue: {
            getOrCreateConversation: jest.fn().mockResolvedValue({ id: 'test-conv-id', customerId: '25838925955116@lid' }),
            getRecentMessages: jest.fn().mockResolvedValue([]),
            addMessage: jest.fn().mockImplementation((conversationId, data) => {
              return Promise.resolve({ id: `msg-${Date.now()}`, ...data });
            }),
            messageExists: jest.fn().mockResolvedValue(false),
            withConversationLock: jest.fn().mockImplementation(async (conversationId, operation) => {
              return operation();
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<WhatsAppController>(WhatsAppController);
    whatsappService = module.get<WhatsAppService>(WhatsAppService);
    aiService = module.get<AIService>(AIService);
    conversationService = module.get<ConversationService>(ConversationService);
  });

  it('should ignore status@broadcast messages', async () => {
    const result = await controller.receiveMessage({
      from: 'status@broadcast',
      body: 'https://status.whatsapp.com/...',
      externalMessageId: 'test-external-id',
      timestamp: Date.now(),
      type: 'chat',
    });

    expect(result).toEqual({ status: 'Message received (status ignored)' });
    expect(conversationService.getOrCreateConversation).not.toHaveBeenCalled();
    expect(conversationService.getRecentMessages).not.toHaveBeenCalled();
    expect(conversationService.addMessage).not.toHaveBeenCalled();
    expect(aiService.generateResponseWithHistory).not.toHaveBeenCalled();
    expect(whatsappService.sendMessage).not.toHaveBeenCalled();
  });

  it('should process regular messages and persist user timestamp in milliseconds', async () => {
    const result = await controller.receiveMessage({
      from: '+1234567890',
      body: 'Hello',
      externalMessageId: 'test-external-id',
      timestamp: 1788271390, // unix seconds (Baileys contract)
      type: 'chat',
    });

    expect(result).toEqual({ status: 'Message received' });
    expect(conversationService.getOrCreateConversation).toHaveBeenCalledWith('+1234567890');

    // First addMessage call is the user message
    const userMessageCall = (conversationService.addMessage as jest.Mock).mock.calls[0];
    expect(userMessageCall[1].role).toBe('user');
    expect(userMessageCall[1].timestamp.getTime()).toBe(1788271390000);

    // Assistant message persisted with lowercase model role
    const assistantMessageCall = (conversationService.addMessage as jest.Mock).mock.calls[1];
    expect(assistantMessageCall[1].role).toBe('model');

    expect(aiService.generateResponseWithHistory).toHaveBeenCalledWith(
      'Hello',
      [],
      '25838925955116@lid',
    );
    expect(whatsappService.sendMessage).toHaveBeenCalledWith('+1234567890', 'Test response');
  });
});
