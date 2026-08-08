import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email inválido');
    }

    const existing = await this.prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email já subscrito');
    }

    await this.prisma.newsletter.create({
      data: { email },
    });

    return { success: true, message: 'Subscrito com sucesso!' };
  }
}