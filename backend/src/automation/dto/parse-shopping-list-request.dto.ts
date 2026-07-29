import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParseShoppingListRequestDto {
  @ApiPropertyOptional({ description: 'URL da imagem da lista de compras' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Texto da lista (alternativa à imagem)' })
  @IsString()
  @IsOptional()
  text?: string;
}