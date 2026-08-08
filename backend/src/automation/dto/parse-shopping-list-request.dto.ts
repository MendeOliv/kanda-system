import { IsString, IsOptional } from 'class-validator';

export class ParseShoppingListRequestDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  text?: string;
}