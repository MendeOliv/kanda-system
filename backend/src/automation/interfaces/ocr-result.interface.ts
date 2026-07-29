/**
 * Resultado do OCR (extração de texto de imagem).
 */
export interface OcrResult {
  rawText: string;
  confidence?: number;
}