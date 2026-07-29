/**
 * Item extraído pelo LLM da lista de compras.
 * Ex: "2 arroz, 1 óleo Fula 5L"
 */
export interface LlmItem {
  name: string;
  quantity: number;
  unit?: string;
}