import { Controller, Post, Body, Get, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AutomationService } from './automation.service';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('parse-shopping-list')
  async parseShoppingList(@Body() body: { imageUrl?: string; text?: string }) {
    return this.automationService.parseShoppingList(body);
  }

  @Post('orders/sync')
  async syncOrder(@Body() body: any) {
    return this.automationService.syncOrder(body);
  }

  @Get('orders/:orderNumber/status')
  async getStatus(@Param('orderNumber') orderNumber: string) {
    return this.automationService.getStatus(orderNumber);
  }

  @Get('health')
  async health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
