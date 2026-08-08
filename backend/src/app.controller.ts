import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getRoot() {
    return { name: 'Kanda API', version: '1.0.0' };
  }

  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}