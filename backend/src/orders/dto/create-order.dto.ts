import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  CASH = 'CASH',
  APPYPAY = 'APPYPAY',
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Delivery zone name (e.g., KK5000, Kilamba)' })
  @IsString()
  deliveryZone: string;

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  externalMessageId?: string;
}