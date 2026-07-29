import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('order/:id')
  async createPayment(@Param('id') id: string) {
    return this.paymentsService.createPaymentForOrder(id);
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
