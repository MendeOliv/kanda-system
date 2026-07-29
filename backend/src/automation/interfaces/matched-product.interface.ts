/**
 * Produto do catálogo após fuzzy matching.
 */
export interface MatchedProduct {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  matchedSku: boolean;
}