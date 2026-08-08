import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockUser = {
  id: 'user1',
  firebaseUid: 'firebase1',
  phone: '+244923000000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  avatar: null,
  role: 'USER',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const createUserDto: CreateUserDto = {
  firebaseUid: 'firebase1',
  phone: '+244923000000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValueOnce(mockUser as any);

      const result = await service.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.phone).toBe('+244923000000');
    });

    it('should throw ConflictException when user already exists', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockUser as any);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted users', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValueOnce([mockUser] as any);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].phone).toBe('+244923000000');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockUser as any);

      const result = await service.findOne('user1');
      expect(result).toBeDefined();
      expect(result.id).toBe('user1');
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByFirebaseUid', () => {
    it('should return user by firebase UID', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockUser as any);

      const result = await service.findByFirebaseUid('firebase1');
      expect(result).toBeDefined();
      expect((result as any).firebaseUid).toBe('firebase1');
    });

    it('should return message when user not registered', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);

      const result = await service.findByFirebaseUid('unknown');
      expect(result).toEqual({ message: 'Utilizador ainda não registado. Complete o registo.' });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({ ...mockUser, firstName: 'Jane' } as any);

      const result = await service.update('user1', { firstName: 'Jane' });
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);

      await expect(service.update('nonexistent', { firstName: 'Jane' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce({ ...mockUser, deletedAt: new Date(), status: 'inactive' } as any);

      const result = await service.remove('user1');
      expect(result.deletedAt).toBeDefined();
      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValueOnce(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
