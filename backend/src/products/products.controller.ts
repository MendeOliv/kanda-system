import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar produto' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
    @ApiOperation({ summary: 'Listar produtos com filtros' })
    async findAll(@Query() query: any = {}) {
      return this.productsService.findAll(query);
    }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias' })
  async listCategories() {
    return this.productsService.listCategories();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Produtos em destaque' })
  async getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Obter produto por SKU' })
  async findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter produto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto (soft-delete)' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}