import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async send(data: any) {
    if (!data.name || !data.email || !data.subject || !data.message) {
      throw new BadRequestException('Campos obrigatórios em falta');
    }

    await this.prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      },
    });

    // TODO: Enviar email para suporte@kandaluanda.ao

    return { success: true, message: 'Mensagem enviada!' };
  }
}