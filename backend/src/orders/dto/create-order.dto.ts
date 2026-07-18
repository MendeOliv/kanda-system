import { IsString, IsEnum, IsArray, IsOptional, IsNumber, Min, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  CASH = 'CASH',
  APPYPAY = 'APPYPAY',
}

export enum Zone {
  KK5000 = 'KK5000',
  KILAMBA = 'KILAMBA',
}

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ enum: Zone })
  @IsEnum(Zone)
  deliveryZone: Zone;

  @ApiProperty()
  @IsString()
  deliveryReference: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressId?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
