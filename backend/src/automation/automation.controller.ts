import { Controller, Post, Body, Get, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AutomationService } from './automation.service';
import { N8NInternalKeyGuard } from '../auth/guards/n8n-internal-key.guard';
import { ParseShoppingListRequestDto, SyncOrderRequestDto } from './dto';

@Controller('automation')
@UseGuards(N8NInternalKeyGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('parse-shopping-list')
  async parseShoppingList(@Body() dto: ParseShoppingListRequestDto) {
    return this.automationService.parseShoppingList(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('orders/sync')
  async syncOrder(@Body() dto: SyncOrderRequestDto) {
    return this.automationService.syncOrder(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('orders/:orderNumber/status')
  async getStatus(@Param('orderNumber') orderNumber: string) {
    return this.automationService.getStatus(orderNumber);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get('health')
  async health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
