import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ─── CRUD ──────────────────────────────────────

  async create(createProductDto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category ${createProductDto.categoryId} not found`);
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        sku: createProductDto.sku,
        categoryId: createProductDto.categoryId,
        price: createProductDto.price,
        discountPrice: createProductDto.discountPrice,
        stock: createProductDto.stock ?? 0,
        description: createProductDto.description,
        imageUrl: createProductDto.imageUrl,
        status: (createProductDto.status as ProductStatus) ?? 'ACTIVE',
      },
      include: { category: true },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU '${sku}' not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateProductDto)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  // ─── Fuzzy Search ─────────────────────────────

  /**
   * Busca produtos por nome usando PostgreSQL ILIKE (case-insensitive).
   * Retorna os produtos ativos ordenados por relevância (melhor match primeiro).
   *
   * FUTURO: Adicionar FTS (full-text search) com tsvector.
   */
  async search(query: string) {
      if (!query || query.trim().length === 0) return [];

      const q = query.trim();

      return this.prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { startsWith: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        orderBy: { name: 'asc' },
        take: 10,
      });
    }
}