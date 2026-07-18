import { IsOptional, IsString, IsInt, IsDecimal, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsDecimal()
  price: number | string;

  @IsOptional()
  @IsDecimal()
  discountPrice?: number | string;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsString()
  status?: string;
}