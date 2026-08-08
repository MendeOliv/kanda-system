import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@Controller('api/admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Listar pedidos (admin)' })
  async listOrders() {
    return this.adminService.listOrders();
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  async updateOrderStatus(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateOrderStatus(id, body.status);
  }

  @Post('products')
  @ApiOperation({ summary: 'Adicionar produto (admin)' })
  async createProduct(@Body() body: any) {
    return this.adminService.createProduct(body);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Editar produto (admin)' })
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateProduct(id, body);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Remover produto (admin)' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do dashboard (admin)' })
  async getStats() {
    return this.adminService.getStats();
  }
}