'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

const LOCALE_LABELS: Record<AppLocale, string> = {
  'pt-AO': 'PT',
  en: 'EN',
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations('language');

  const switchLocale = (newLocale: AppLocale) => {
    if (newLocale === locale) return;

    const cookieName = typeof routing.localeCookie === 'object' && routing.localeCookie ? (routing.localeCookie as { name: string }).name : 'NEXT_LOCALE';
    const cookieMaxAge = typeof routing.localeCookie === 'object' && routing.localeCookie ? (routing.localeCookie as { maxAge: number }).maxAge : 31536000;
    document.cookie = `${cookieName}=${newLocale};path=/;max-age=${cookieMaxAge};SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="relative">
      <label htmlFor="language-switcher" className="sr-only">
        {t('label')}
      </label>
      <select
        id="language-switcher"
        value={locale}
        onChange={(event) => switchLocale(event.target.value as AppLocale)}
        className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-2 py-1.5 text-sm font-medium text-on-surface-variant hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label={t('label')}
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {LOCALE_LABELS[item]}
          </option>
        ))}
      </select>
    </div>
  );
}
