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
  let productsService: ProductsService;
  let moduleRef: TestingModule;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
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
        { provide: ProductsService, useValue: { search: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get<AIService>(AIService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    productsService = moduleRef.get<ProductsService>(ProductsService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with API key', () => {
    expect(service['isConfigured']).toBe(true);
  });

  it('should return error message when not configured', async () => {
    const noKeyModule: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return null;
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
    
    await noKeyModule.close();
  });

  it('should generate a response when configured (no function call)', async () => {
    const mockResponseText = 'Olá! Como posso ajudar?';
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => mockResponseText,
        candidates: [{ content: { parts: [] } }],
      },
    });

    const result = await service.generateResponse('Olá');
    expect(result).toBe(mockResponseText);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const promptArg = mockGenerateContent.mock.calls[0][0];
    expect(promptArg.contents).toHaveLength(1);
    expect(promptArg.contents[0]).toEqual({
      role: 'user',
      parts: [{ text: 'Olá' }],
    });
    expect(promptArg.tools).toBeDefined();
    expect(promptArg.toolConfig.functionCallingConfig.mode).toBe('AUTO');
  });

  describe('function calling', () => {
    const mockSearchResults = [
      {
        id: 1,
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante Coca-Cola lata 350ml',
        category: { name: 'Bebidas' },
        price: 5.99,
        discountPrice: null,
        stock: 100,
        sku: 'CC350ML',
      },
    ];

    it('should execute function call with results and return final response', async () => {
      // First call: returns functionCall
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Coca cola' },
                      id: 'call_123',
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      // Second call: returns final text response
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Encontrei Coca-Cola 350ml por R$ 5,99.',
          candidates: [{ content: { parts: [] } }],
        },
      });

      // Mock ProductsService.search
      productsService.search.mockResolvedValueOnce(mockSearchResults);

      const result = await service.generateResponseWithHistory('Coca cola', []);

      expect(result).toBe('Encontrei Coca-Cola 350ml por R$ 5,99.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(productsService.search).toHaveBeenCalledWith('Coca cola');

      // Validate first call contents
      const firstCall = mockGenerateContent.mock.calls[0][0];
      expect(firstCall.contents).toEqual([
        { role: 'user', parts: [{ text: 'Coca cola' }] },
      ]);
      expect(firstCall.tools).toBeDefined();
      expect(firstCall.toolConfig.functionCallingConfig.mode).toBe('AUTO');

      // Validate second call contents (the critical part)
      const secondCall = mockGenerateContent.mock.calls[1][0];
      // Should have: user message, model functionCall, user functionResponse
      expect(secondCall.contents).toHaveLength(3);
      expect(secondCall.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Coca cola' }],
      });
      // The functionCall should be nested correctly: parts[0].functionCall
      expect(secondCall.contents[1]).toEqual({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'search_catalog',
              args: { q: 'Coca cola' },
              id: 'call_123',
            },
          },
        ],
      });
      // The functionResponse should be nested correctly: parts[0].functionResponse
      expect(secondCall.contents[2]).toEqual({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'search_catalog',
              response: { results: mockSearchResults },
            },
          },
        ],
      });
      // Second call should have toolConfig with mode: 'NONE'
      expect(secondCall.toolConfig).toBeDefined();
      expect(secondCall.toolConfig.functionCallingConfig.mode).toBe('NONE');
    });

    it('should execute function call without results and return final response', async () => {
      // First call: returns functionCall
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Pepsi' },
                      id: 'call_456',
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      // Second call: returns final text response
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Não encontrei produtos para Pepsi.',
          candidates: [{ content: { parts: [] } }],
        },
      });

      // Mock ProductsService.search to return empty array
      productsService.search.mockResolvedValueOnce([]);

      const result = await service.generateResponseWithHistory('Pepsi', []);

      expect(result).toBe('Não encontrei produtos para Pepsi.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
      expect(productsService.search).toHaveBeenCalledWith('Pepsi');

      // Validate second call contents for empty results
      const secondCall = mockGenerateContent.mock.calls[1][0];
      expect(secondCall.contents).toHaveLength(3);
      expect(secondCall.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Pepsi' }],
      });
      expect(secondCall.contents[1]).toEqual({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'search_catalog',
              args: { q: 'Pepsi' },
              id: 'call_456',
            },
          },
        ],
      });
      expect(secondCall.contents[2]).toEqual({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'search_catalog',
              response: { results: [] },
            },
          },
        ],
      });
      expect(secondCall.toolConfig.functionCallingConfig.mode).toBe('NONE');
    });

    it('should validate payload structure - functionCall must be nested correctly', async () => {
      // This test ensures we don't have the bug where functionCall is flattened
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Test' },
                      id: 'call_789',
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Resposta final',
          candidates: [{ content: { parts: [] } }],
        },
      });

      productsService.search.mockResolvedValueOnce([{ id: 1, name: 'Test Product' }]);

      await service.generateResponseWithHistory('Test', []);

      const secondCall = mockGenerateContent.mock.calls[1][0];
      // Extract the model's functionCall part
      const modelPart = secondCall.contents[1].parts[0];
      // Validate that it has functionCall property (not flattened)
      expect(modelPart).toHaveProperty('functionCall');
      expect(modelPart.functionCall).toEqual({
        name: 'search_catalog',
        args: { q: 'Test' },
        id: 'call_789',
      });
      // Ensure it does NOT have the flattened structure (name, args, id directly in parts[0])
      expect(modelPart).not.toHaveProperty('name');
      expect(modelPart).not.toHaveProperty('args');
      expect(modelPart).not.toHaveProperty('id');
    });

    it('should not duplicate user message in history', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'search_catalog',
                      args: { q: 'Dupe test' },
                      id: 'call_dup',
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'Sem duplicação',
          candidates: [{ content: { parts: [] } }],
        },
      });

      productsService.search.mockResolvedValueOnce([]);

      // Provide history with one previous user message
      const history = [
        { role: 'USER', content: 'Olá' },
        { role: 'ASSISTANT', content: 'Oi!' },
      ];

      await service.generateResponseWithHistory('Dupe test', history);

      const secondCall = mockGenerateContent.mock.calls[1][0];
      // Contents should be:
      // 0: history[0] (USER: Olá) -> role user
      // 1: history[1] (ASSISTANT: Oi!) -> role model
      // 2: current user message (Dupe test) -> role user
      // 3: model functionCall
      // 4: user functionResponse
      expect(secondCall.contents).toHaveLength(5);
      expect(secondCall.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Olá' }],
      });
      expect(secondCall.contents[1]).toEqual({
        role: 'model',
        parts: [{ text: 'Oi!' }],
      });
      expect(secondCall.contents[2]).toEqual({
        role: 'user',
        parts: [{ text: 'Dupe test' }],
      });
      expect(secondCall.contents[3]).toEqual({
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'search_catalog',
              args: { q: 'Dupe test' },
              id: 'call_dup',
            },
          },
        ],
      });
      expect(secondCall.contents[4]).toEqual({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: 'search_catalog',
              response: { results: [] },
            },
          },
        ],
      });
      // Ensure the current user message appears exactly once (at index 2)
      const userMessageCount = secondCall.contents.filter(
        c => c.role === 'user' && c.parts[0].text === 'Dupe test'
      ).length;
      expect(userMessageCount).toBe(1);
    });
  });

  it('should handle empty response from Gemini', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => '',
        candidates: [{ content: { parts: [] } }],
      },
    });

    const result = await service.generateResponse('Hello');
    expect(result).toBe('Desculpe, não consegui gerar uma resposta no momento. Por favor, tente novamente.');
  });

  it('should handle error from Gemini API', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

    const result = await service.generateResponse('Hello');
    expect(result).toBe('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
  });
});