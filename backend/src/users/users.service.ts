import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
      throw new ConflictException('User with this phone or Firebase UID already exists');
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
      include: {
        addresses: true,
        orders: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.user.findFirst({
      where: { firebaseUid, deletedAt: null },
      include: {
        addresses: true,
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      return { message: 'User not registered yet. Please complete registration.' };
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
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
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }
}
