import { IsString, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethodEnum {
  CASH = 'CASH',
  APPYPAY = 'APPYPAY',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ enum: PaymentMethodEnum })
  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  @ApiProperty({ description: 'Amount in Kz' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
