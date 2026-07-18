import { Controller, Get, Post, Body, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { InternalService } from './internal.service';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Internal')
@ApiSecurity('internal-key')
@Controller('internal')
export class InternalController {
  private readonly logger = new Logger(InternalController.name);

  constructor(private readonly internalService: InternalService) {}

  private validateKey(key: string) {
    if (key !== process.env.N8N_INTERNAL_KEY) {
      throw new UnauthorizedException('Invalid internal API key');
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for internal services' })
  health() {
    return { status: 'ok', service: 'kanda-internal', timestamp: new Date().toISOString() };
  }

  @Post('orders/sync')
  @ApiOperation({ summary: 'Sync order from n8n workflow' })
  syncOrder(@Body() body: any, @Headers('x-internal-key') key: string) {
    this.validateKey(key);
    return this.internalService.syncOrder(body);
  }

  @Post('orders/:orderNumber/status')
  @ApiOperation({ summary: 'Update order status from n8n workflow' })
  updateStatus(@Body() body: any, @Headers('x-internal-key') key: string) {
    this.validateKey(key);
    return this.internalService.updateOrderStatus(body);
  }

  @Post('ai-context')
  @ApiOperation({ summary: 'Get or create AI context for WhatsApp' })
  getAiContext(@Body() body: { userPhone: string }, @Headers('x-internal-key') key: string) {
    this.validateKey(key);
    return this.internalService.getAiContext(body.userPhone);
  }

  @Post('ai-context/update')
  @ApiOperation({ summary: 'Update AI context from WhatsApp conversation' })
  updateAiContext(@Body() body: any, @Headers('x-internal-key') key: string) {
    this.validateKey(key);
    return this.internalService.updateAiContext(body);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Full catalog for n8n sync' })
  getCatalog(@Headers('x-internal-key') key: string) {
    this.validateKey(key);
    return this.internalService.getCatalog();
  }
}
