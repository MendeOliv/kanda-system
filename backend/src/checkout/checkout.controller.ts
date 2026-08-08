import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validar checkout' })
  async validate(@Request() req, @Body() body: any) {
    return this.checkoutService.validate(req.user.userId, body);
  }

  @Post('process')
  @ApiOperation({ summary: 'Processar pagamento' })
  async process(@Request() req, @Body() body: any) {
    return this.checkoutService.process(req.user.userId, body);
  }
}