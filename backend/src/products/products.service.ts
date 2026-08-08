import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private toNumber(product: any) {
    return product
      ? {
          ...product,
          price: Number(product.price),
          discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
        }
      : product;
  }

  // ─── CRUD ──────────────────────────────────────

  async create(createProductDto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Categoria ${createProductDto.categoryId} não encontrada`);
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        sku: createProductDto.sku,
        categoryId: createProductDto.categoryId,
        price: createProductDto.price,
        discountPrice: createProductDto.discountPrice ?? null,
        stock: createProductDto.stock ?? 0,
        description: createProductDto.description,
        imageUrl: createProductDto.imageUrl,
        status: createProductDto.status ?? 'active',
      },
      include: { category: true },
    });

    return this.toNumber(product);
  }

  async findAll(query: any = {}) {
    const { category, page = 1, limit = 20, search, priceMin, priceMax } = query;
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { status: 'active' };

    if (category) {
      where.category = { name: { contains: category, mode: 'insensitive' } };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin.toString());
      if (priceMax) where.price.lte = parseFloat(priceMax.toString());
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((c) => this.toNumber(c)),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }
    return this.toNumber(product);
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Produto com SKU '${sku}' não encontrado`);
    }
    return this.toNumber(product);
  }

  async findBySlug(slug: string) {
    // Slug pode ser o sku ou o id
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ sku: slug }, { id: slug }],
        status: 'active',
      },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return { product: this.toNumber(product) };
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) return [];

    const q = query.trim();
    const products = await this.prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { startsWith: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    return products.map((c) => this.toNumber(c));
  }

  async update(id: string, updateProductDto: UpdateProductDto | any) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }

    const data: any = {};
    for (const [key, value] of Object.entries(updateProductDto)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return this.toNumber(updated);
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: 'inactive' },
    });
    return this.toNumber(updated);
  }

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { categories };
  }

  async getFeatured() {
    const products = await this.prisma.product.findMany({
      where: { status: 'active' },
      take: 10,
      include: { category: true },
      orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
    });
    return {
      products: products.map((c) => this.toNumber(c)),
    };
  }
}