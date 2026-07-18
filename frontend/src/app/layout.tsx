import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kanda Luanda - O Seu Supermercado de Confiança",
  description:
    "Faça as suas compras online em Luanda. Entrega rápida, produtos frescos e preços justos. O seu mercado de vizinhança digital.",
  keywords: ["supermercado online", "Luanda", "compras online", "Angola", "Kanda"],
  openGraph: {
    title: "Kanda Luanda - Supermercado Online",
    description: "O seu vizinho de confiança em Luanda",
    type: "website",
    locale: "pt_AO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="bg-background text-on-background font-montserrat">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
