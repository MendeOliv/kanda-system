import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

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
        status: createProductDto.status ?? 'active',
      },
      include: { category: true },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { status: 'active' },
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

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
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
      data: { status: 'inactive' },
    });
  }
}