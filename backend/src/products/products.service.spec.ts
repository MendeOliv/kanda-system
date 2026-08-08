import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

const mockCategory = {
  id: 'cat1',
  name: 'Padaria',
  slug: 'padaria',
  description: null,
  imageUrl: null,
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct = {
  id: 'prod1',
  name: 'Pão Artesanal',
  description: 'Pão fresco feito com ingredientes naturais',
  price: 250,
  discountPrice: null,
  stock: 50,
  sku: 'PAO-001',
  categoryId: 'cat1',
  imageUrl: null,
  status: ProductStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: mockCategory,
};

const createProductDto: CreateProductDto = {
  name: 'Pão Artesanal',
  sku: 'PAO-001',
  categoryId: 'cat1',
  price: 250,
  stock: 50,
  description: 'Pão fresco feito com ingredientes naturais',
  status: 'ACTIVE',
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(mockCategory);
      jest.spyOn(prisma.product, 'create').mockResolvedValueOnce(mockProduct as any);

      const result = await service.create(createProductDto);
      expect(result).toBeDefined();
      expect(result.name).toBe('Pão Artesanal');
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.create(createProductDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated active products', async () => {
      jest.spyOn(prisma.product, 'findMany').mockResolvedValueOnce([mockProduct] as any);
      jest.spyOn(prisma.product, 'count').mockResolvedValueOnce(1);

      const result = await service.findAll();
      expect(result.products).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(mockProduct as any);

      const result = await service.findOne('prod1');
      expect(result).toBeDefined();
      expect(result.id).toBe('prod1');
    });

    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(mockProduct as any);

      const result = await service.findBySku('PAO-001');
      expect(result).toBeDefined();
      expect(result.sku).toBe('PAO-001');
    });

    it('should throw NotFoundException when SKU not found', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findBySku('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(mockProduct as any);
      jest.spyOn(prisma.product, 'update').mockResolvedValueOnce({ ...mockProduct, name: 'Pão de Leite' } as any);

      const result = await service.update('prod1', { name: 'Pão de Leite' });
      expect(result.name).toBe('Pão de Leite');
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a product (set status to inactive)', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(mockProduct as any);
      jest.spyOn(prisma.product, 'update').mockResolvedValueOnce({ ...mockProduct, status: 'inactive' } as any);

      const result = await service.remove('prod1');
      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
