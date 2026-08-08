import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException } from '@nestjs/common';

const mockCategory = {
  id: 'cat1',
  name: 'Padaria',
  slug: 'padaria',
  description: 'Pães e bolos artesanais',
  imageUrl: null,
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { products: 5 },
};

const createCategoryDto: CreateCategoryDto = {
  name: 'Padaria',
  description: 'Pães e bolos artesanais',
  sortOrder: 0,
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, PrismaService],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category with auto-generated slug', async () => {
      jest.spyOn(prisma.category, 'create').mockResolvedValueOnce(mockCategory as any);

      const result = await service.create(createCategoryDto);
      expect(result).toBeDefined();
      expect(result.name).toBe('Padaria');
    });

    it('should create a category with custom slug', async () => {
      const dtoWithSlug: CreateCategoryDto = { ...createCategoryDto, slug: 'paes-artesanais' };
      jest.spyOn(prisma.category, 'create').mockResolvedValueOnce({ ...mockCategory, slug: 'paes-artesanais' } as any);

      const result = await service.create(dtoWithSlug);
      expect(result.slug).toBe('paes-artesanais');
    });
  });

  describe('findAll', () => {
    it('should return active categories', async () => {
      jest.spyOn(prisma.category, 'findMany').mockResolvedValueOnce([mockCategory] as any);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Padaria');
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(mockCategory as any);

      const result = await service.findOne('cat1');
      expect(result).toBeDefined();
      expect(result.id).toBe('cat1');
    });

    it('should throw NotFoundException when category not found', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(mockCategory as any);

      const result = await service.findBySlug('padaria');
      expect(result).toBeDefined();
      expect(result.slug).toBe('padaria');
    });

    it('should throw NotFoundException when slug not found', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(mockCategory as any);
      jest.spyOn(prisma.category, 'update').mockResolvedValueOnce({ ...mockCategory, name: 'Padaria Artesanal' } as any);

      const result = await service.update('cat1', { name: 'Padaria Artesanal' });
      expect(result.name).toBe('Padaria Artesanal');
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.update('nonexistent', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a category with products (set isActive to false)', async () => {
      const categoryWithProducts = { ...mockCategory, _count: { products: 5 } };
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(categoryWithProducts as any);
      jest.spyOn(prisma.category, 'update').mockResolvedValueOnce({ ...mockCategory, isActive: false } as any);

      const result = await service.remove('cat1');
      expect(result.isActive).toBe(false);
    });

    it('should delete a category with no products', async () => {
      const categoryNoProducts = { ...mockCategory, _count: { products: 0 } };
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(categoryNoProducts as any);
      jest.spyOn(prisma.category, 'delete').mockResolvedValueOnce(mockCategory as any);

      const result = await service.remove('cat1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when removing non-existent category', async () => {
      jest.spyOn(prisma.category, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
