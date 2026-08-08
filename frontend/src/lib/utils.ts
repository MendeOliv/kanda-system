import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AppLocale } from '@/i18n/routing';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: AppLocale = 'pt-AO'): string {
  const intlLocale = locale === 'en' ? 'en-GB' : 'pt-AO';

  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
