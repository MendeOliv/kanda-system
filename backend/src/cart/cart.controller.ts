import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obter carrinho do utilizador' })
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  async addItem(@Request() req, @Body() body: any) {
    return this.cartService.addItem(req.user.userId, body.productId, body.quantity);
  }

  @Put('items/:productId')
  @ApiOperation({ summary: 'Atualizar quantidade do item' })
  async updateItem(@Request() req, @Param('productId') productId: string, @Body() body: any) {
    return this.cartService.updateItem(req.user.userId, productId, body.quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  async removeItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Limpar carrinho' })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}