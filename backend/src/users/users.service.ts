import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ─── CRUD (contrato original) ───────────────────

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: createUserDto.phone },
          { firebaseUid: createUserDto.firebaseUid },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um utilizador com este telemóvel ou Firebase UID');
    }

    return this.prisma.user.create({
      data: {
        firebaseUid: createUserDto.firebaseUid,
        phone: createUserDto.phone,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { addresses: true },
    });
    if (!user) {
      throw new NotFoundException(`Utilizador ${id} não encontrado`);
    }
    return user;
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.user.findFirst({
      where: { firebaseUid, deletedAt: null },
      include: { addresses: true },
    });
    if (!user) {
      return { message: 'Utilizador ainda não registado. Complete o registo.' };
    }
    return user;
  }

  async update(id: string, updateUserDto: any) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) {
      throw new NotFoundException(`Utilizador ${id} não encontrado`);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) {
      throw new NotFoundException(`Utilizador ${id} não encontrado`);
    }
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }

  // ─── Plano: perfil e moradas ───────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.name !== undefined) {
      const parts = String(data.name).split(' ').filter(Boolean);
      updateData.firstName = parts[0] || '';
      updateData.lastName = parts.slice(1).join(' ') || null;
    }
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;

    return this.prisma.user.update({ where: { id: userId }, data: updateData });
  }

  async listAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const zone = ['KK5000', 'KILAMBA'].includes(String(data.zone || '').toUpperCase())
      ? String(data.zone).toUpperCase()
      : 'KK5000';

    const reference = data.reference
      || [data.street, data.number, data.neighborhood, data.city]
          .filter(Boolean)
          .join(', ');

    return this.prisma.address.create({
      data: {
        userId,
        zone: zone as any,
        reference,
        isDefault: data.isDefault || false,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (data.reference !== undefined) updateData.reference = data.reference;
    if (data.zone !== undefined) {
      updateData.zone = ['KK5000', 'KILAMBA']
        .includes(String(data.zone).toUpperCase())
        ? String(data.zone).toUpperCase()
        : undefined;
    }
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    return this.prisma.address.update({ where: { id: addressId }, data: updateData });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');

    await this.prisma.address.delete({ where: { id: addressId } });
    return { success: true };
  }
}