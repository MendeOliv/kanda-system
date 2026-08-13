import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { BrandService } from './brand.service';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @Public()
  async findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: string) {
    return this.brandService.findById(id);
  }

  @Get('slug/:slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    return this.brandService.findBySlug(slug);
  }
}