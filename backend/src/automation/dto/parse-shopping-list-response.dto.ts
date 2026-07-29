import { MatchedProduct } from '../interfaces/matched-product.interface';

export class ParseShoppingListResponseDto {
  products: MatchedProduct[];
  total: number;
  rawText?: string;
  unrecognizedItems?: string[];
}