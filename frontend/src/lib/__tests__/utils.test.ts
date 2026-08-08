import { formatCurrency } from '@/lib/utils';
import type { AppLocale } from '@/i18n/routing';

describe('formatCurrency', () => {
  it('should format AOA amount for pt-AO locale', () => {
    const amount = 1234.56;
    const formatted = formatCurrency(amount, 'pt-AO');
    // Intl.NumberFormat in pt-AO uses NBSP (\xa0) as thousands separator
    expect(formatted).toBe('1\u00a0235\u00a0Kz');
  });

  it('should format AOA amount for en locale', () => {
    const amount = 1234.56;
    const formatted = formatCurrency(amount, 'en');
    // en-GB locale with AOA currency: "AOA\xa01,235"
    expect(formatted).toBe('AOA\u00a01,235');
  });

  it('should format integer amounts correctly', () => {
    const amount = 1000;
    const formatted = formatCurrency(amount, 'pt-AO');
    expect(formatted).toBe('1\u00a0000\u00a0Kz');
  });

  it('should format zero amount correctly', () => {
    const amount = 0;
    const formatted = formatCurrency(amount, 'pt-AO');
    expect(formatted).toBe('0\u00a0Kz');
  });
});