import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class IncomingMessageDto {
  @IsNotEmpty()
  @IsString()
  externalMessageId: string;

  @IsNotEmpty()
  @IsString()
  from: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsNumber()
  timestamp: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsBoolean()
  forwarded?: boolean;

  @IsOptional()
  @IsBoolean()
  fromMe?: boolean;
}