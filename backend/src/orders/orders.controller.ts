import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pedido' })
  async create(@Request() req, @Body() body: any) {
    return this.ordersService.create(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos do utilizador' })
  async findUserOrders(@Request() req) {
    return this.ordersService.findUserOrders(req.user.userId);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Rastrear pedido' })
  async tracking(@Request() req, @Param('id') id: string) {
    return this.ordersService.tracking(req.user.userId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhe do pedido' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.userId, id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  async cancel(@Request() req, @Param('id') id: string) {
    return this.ordersService.cancel(req.user.userId, id);
  }
}