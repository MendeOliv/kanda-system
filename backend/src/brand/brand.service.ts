import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });
    if (!brand) {
      throw new NotFoundException(`Marca com ID ${id} não encontrada`);
    }
    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { slug },
    });
    if (!brand) {
      throw new NotFoundException(`Marca com slug ${slug} não encontrada`);
    }
    return brand;
  }

  // Optional: admin methods (create, update, deactivate) can be added later
}