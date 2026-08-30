const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      let callCount = 0;
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(async (params) => {
            callCount++;
            
            // First call - should trigger function call
            if (callCount === 1) {
              // Simulate Gemini deciding to call search_catalog function
              return {
                response: {
                  candidates: [
                    {
                      content: {
                        parts: [
                          {
                            functionCall: {
                              name: 'search_catalog',
                              args: {
                                q: 'coca cola'
                              }
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              };
            } 
            // Second call - after function response, should return final text
            else if (callCount === 2) {
              return {
                response: {
                  text: () => 'Encontrei Coca-Cola 2L por R$ 8,99 em estoque.'
                }
              };
            }
            
            // Fallback
            return {
              response: {
                text: () => 'Resposta padrão'
              }
            };
          })
        }
      };
    })
  };
});

// Import the service after mocking
import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

describe('AIService Function Calling Fix', () => {
  let service: AIService;
  let mockProductsService: ProductsService;

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
        { 
          provide: ProductsService, 
          useValue: {
            search: jest.fn().mockResolvedValue([
              {
                id: 1,
                name: 'Coca-Cola 2L',
                description: 'Refrigerante Coca-Cola 2 litros',
                category: { name: 'Bebidas' },
                price: 8.99,
                discountPrice: null,
                stock: 10,
                sku: 'COKE-2L'
              }
            ])
          } 
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    mockProductsService = module.get<ProductsService>(ProductsService);
  });

  it('should correctly handle function calling flow', async () => {
    // This simulates the exact scenario: "Quero coca cola"
    const result = await service.generateResponseWithHistory('Quero coca cola', []);
    
    // Should not return the error fallback
    expect(result).not.toBe('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
    
    // Should return a meaningful response about the product
    expect(result).toContain('Coca-Cola');
    expect(result).toContain('R$');
    
    // Verify the products service was called
    expect(mockProductsService.search).toHaveBeenCalledWith('coca cola');
  });
});