import { Controller, Post, Body } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Newsletter')
@Controller('api/newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscrever newsletter' })
  async subscribe(@Body() body: { email: string }) {
    return this.newsletterService.subscribe(body.email);
  }
}