import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminAuthGuard } from './admin-auth.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard],
  exports: [AdminService, AdminAuthGuard],
})
export class AdminModule {}