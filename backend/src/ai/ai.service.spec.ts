const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      };
    }),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

describe('AIService', () => {
  let service: AIService;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              if (key === 'GEMINI_MODEL') return 'gemini-test';
              return null;
            }),
          },
        },
        { provide: PrismaService, useValue: {} },
        { provide: ProductsService, useValue: { search: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with API key', () => {
    // The constructor of AIService will call the mocked GoogleGenerativeAI
    expect(service['isConfigured']).toBe(true);
  });

  it('should return error message when not configured', async () => {
    // Create a service with no API key
    const noKeyModule: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return null; // no key
              if (key === 'GEMINI_MODEL') return 'gemini-test';
              return null;
            }),
          },
        },
        { provide: PrismaService, useValue: {} },
        { provide: ProductsService, useValue: { search: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    const noKeyService = noKeyModule.get<AIService>(AIService);
    expect(noKeyService['isConfigured']).toBe(false);

    const result = await noKeyService.generateResponse('Hello');
    expect(result).toBe('Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.');
  });

  it('should generate a response when configured', async () => {
    const mockResponseText = 'Test response';
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    const result = await service.generateResponse('Hello');
    expect(result).toBe(mockResponseText);
    expect(mockGenerateContent).toHaveBeenCalled();
    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(typeof promptArg).toBe('string');
    expect(promptArg).toContain('Você é um assistente da Kanda');
    expect(promptArg).toContain('Usuário: Hello');
  });

  it('should handle empty response from Gemini', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '', // empty string
      },
    });

    const result = await service.generateResponse('Hello');
    expect(result).toBe('Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.');
  });

  it('should handle error from Gemini API', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API error'));

    const result = await service.generateResponse('Hello');
    expect(result).toBe('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
  });
});