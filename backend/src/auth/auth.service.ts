import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(phone: string) {
    // Validar telemóvel (Angola: 9 dígitos, começa com 9)
    const phoneRegex = /^9[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('Número de telefone inválido. Deve ter 9 dígitos e começar com 9.');
    }

    // Gerar OTP de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Guardar ou atualizar tentativa
    await this.prisma.otpAttempt.upsert({
      where: { phone },
      update: { otp, expiresAt },
      create: { phone, otp, expiresAt },
    });

    // TODO: Integrar com Twilio ou outro provedor de SMS
    console.log(`[OTP] Enviado para ${phone}: ${otp}`);

    return { success: true, message: 'Código enviado com sucesso.' };
  }

  async verifyOtp(phone: string, otp: string) {
    const attempt = await this.prisma.otpAttempt.findUnique({
      where: { phone },
    });

    if (!attempt || attempt.otp !== otp || attempt.expiresAt < new Date()) {
      throw new UnauthorizedException('Código inválido ou expirado.');
    }

    // Limpar tentativa
    await this.prisma.otpAttempt.delete({ where: { phone } });

    // Procurar ou criar utilizador
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          firebaseUid: `otp:${phone}`,
          firstName: null,
          lastName: null,
          email: null,
          status: 'active',
          role: UserRole.USER,
        },
      });
    }

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      user,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true },
    });

    if (!user) {
      throw new UnauthorizedException('Utilizador não encontrado.');
    }

    return { user };
  }
}
