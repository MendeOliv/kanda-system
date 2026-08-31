import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { AIService } from '../ai/ai.service';
import { ConversationService } from '../conversation/conversation.service';

describe('WhatsAppController (status@broadcast)', () => {
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
            getOrCreateConversation: jest.fn().mockResolvedValue({ id: 'test-conv-id' }),
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
    });

    expect(result).toEqual({ status: 'Message received (status ignored)' });
    expect(conversationService.getOrCreateConversation).not.toHaveBeenCalled();
    expect(conversationService.getRecentMessages).not.toHaveBeenCalled();
    expect(conversationService.addMessage).not.toHaveBeenCalled();
    expect(aiService.generateResponseWithHistory).not.toHaveBeenCalled();
    expect(whatsappService.sendMessage).not.toHaveBeenCalled();
  });

  it('should process regular messages normally', async () => {
    const result = await controller.receiveMessage({
      from: '+1234567890',
      body: 'Hello',
      externalMessageId: 'test-external-id',
      timestamp: Date.now(),
    });

    expect(result).toEqual({ status: 'Message received' });
    expect(conversationService.getOrCreateConversation).toHaveBeenCalledWith('+1234567890');
    expect(conversationService.getRecentMessages).toHaveBeenCalled();
    expect(conversationService.addMessage).toHaveBeenCalledTimes(2); // user + assistant
    expect(aiService.generateResponseWithHistory).toHaveBeenCalled();
    expect(whatsappService.sendMessage).toHaveBeenCalledWith('+1234567890', 'Test response');
  });
});