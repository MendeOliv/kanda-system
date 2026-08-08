import { UserRole } from '@prisma/client';

export class UserEntity {
  id: string;
  firebaseUid: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: UserRole;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
