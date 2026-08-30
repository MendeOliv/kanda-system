import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  // Mock the PrismaService
  const prismaServiceMock = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    // @ts-ignore
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category with auto-generated slug', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Padaria',
        description: 'Pães e bolos artesanais',
        sortOrder: 0,
      };
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'padaria',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaServiceMock.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);
      expect(result).toEqual(mockCategory);
      expect(prismaServiceMock.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Padaria',
          slug: 'padaria',
          description: 'Pães e bolos artesanais',
          imageUrl: undefined,
          sortOrder: 0,
        },
      });
    });

    it('should create a category with custom slug', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Padaria',
        slug: 'bakery',
        description: 'Pães e bolos artesanais',
        sortOrder: 0,
      };
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'bakery',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaServiceMock.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);
      expect(result).toEqual(mockCategory);
      expect(prismaServiceMock.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Padaria',
          slug: 'bakery',
          description: 'Pães e bolos artesanais',
          imageUrl: undefined,
          sortOrder: 0,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return active categories', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Padaria',
          slug: 'padaria',
          description: 'Pães e bolos artesanais',
          imageUrl: undefined,
          isActive: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 5 },
        },
      ];
      prismaServiceMock.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();
      expect(result).toEqual(mockCategories);
      expect(prismaServiceMock.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'padaria',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
        _count: { products: 0 },
      };
      prismaServiceMock.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat1');
      expect(result).toEqual(mockCategory);
      expect(prismaServiceMock.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        include: {
          products: {
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
          },
          _count: { select: { products: true } },
        },
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      prismaServiceMock.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'padaria',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
        _count: { products: 0 },
      };
      prismaServiceMock.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('padaria');
      expect(result).toEqual(mockCategory);
      expect(prismaServiceMock.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'padaria' },
        include: {
          products: {
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException when slug not found', async () => {
      prismaServiceMock.category.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'padaria',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Padaria Atualizada',
        description: 'Descrição atualizada',
        sortOrder: 1,
      };
      const updatedCategory = {
        ...mockCategory,
        ...updateCategoryDto,
        updatedAt: new Date(),
      };
      prismaServiceMock.category.findUnique.mockResolvedValue(mockCategory);
      prismaServiceMock.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update('cat1', updateCategoryDto);
      expect(result).toEqual(updatedCategory);
      expect(prismaServiceMock.category.findUnique).toHaveBeenCalledWith({ where: { id: 'cat1' } });
      expect(prismaServiceMock.category.update).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        data: updateCategoryDto,
      });
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      prismaServiceMock.category.findUnique.mockResolvedValue(null);
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Padaria',
      };

      await expect(service.update('nonexistent', updateCategoryDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete a category with products', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'padaria',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 3 },
      };
      const updatedCategory = {
        ...mockCategory,
        isActive: false,
        updatedAt: new Date(),
      };
      prismaServiceMock.category.findUnique.mockResolvedValue(mockCategory);
      prismaServiceMock.category.update.mockResolvedValue(updatedCategory);

      const result = await service.remove('cat1');
      expect(result).toEqual(updatedCategory);
      expect(prismaServiceMock.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        include: { _count: { select: { products: true } } },
      });
      expect(prismaServiceMock.category.update).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        data: { isActive: false },
      });
    });

    it('should delete a category with no products', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Padaria',
        slug: 'padaria',
        description: 'Pães e bolos artesanais',
        imageUrl: undefined,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };
      prismaServiceMock.category.findUnique.mockResolvedValue(mockCategory);
      prismaServiceMock.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove('cat1');
      expect(result).toEqual(mockCategory);
      expect(prismaServiceMock.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        include: { _count: { select: { products: true } } },
      });
      expect(prismaServiceMock.category.delete).toHaveBeenCalledWith({ where: { id: 'cat1' } });
    });

    it('should throw NotFoundException when removing non-existent category', async () => {
      prismaServiceMock.category.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});