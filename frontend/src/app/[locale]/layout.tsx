import '../globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './providers';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kanda Luanda - O Seu Supermercado de Confiança',
    description: 'Faça as suas compras online em Luanda. Entrega rápida, produtos frescos e preços justos.',
    openGraph: {
      title: 'Kanda Luanda - Supermercado Online',
      description: 'O seu vizinho de confiança em Luanda',
      type: 'website',
      locale: 'pt-AO',
    },
    icons: [
      { rel: 'icon', url: '/favicon.ico' },
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use hardcoded locale/messages to bypass next-intl middleware requirement
  let locale = 'pt-AO';
  let messages;
  try {
    locale = await getLocale();
    messages = await getMessages();
  } catch {
    messages = (await import('../../messages/pt-AO.json')).default;
  }

  return (
    <html lang={locale}>
      <body className="bg-background text-on-background font-montserrat">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}