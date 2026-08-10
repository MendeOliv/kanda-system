"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

interface Product {
  id: number;
  brand: string;
  name: string;
  price: number;
  priceLabel: string;
  oldPrice?: string;
  image: string;
  badge?: { label: string; tone: "promo" | "soldout" };
  soldOut?: boolean;
}

const PRODUCTS: Product[] = [
  { id: 1, brand: "Tio Lucas", name: "Arroz Agulha Extra Longo 5Kg", price: 5200, priceLabel: "5.200 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM__VufmPH7expfaUPpXDHhai57lEsfVndez9uQm6BBsSq7UXT7hqfvno8kDI-_coMNFlXxS2rfUWqgvmKOYbIU0pBpgQHA_gGJfC2SHmeEnVjeaiFLLYoGbdTZIUF421oIXuW-brTF-kCSqNvkuFNAFUwfiOjOT-uLJmHvRaPXU2YLKgqHNpo_PsaUO1b_Twi9Qf6WVvTfk5JkyfTTAahBlqNc8MWKgt3svvGedQKwOTWgwQdf_Ny" },
  { id: 2, brand: "Fula", name: "Óleo Alimentar Fula 1L", price: 1850, priceLabel: "1.850 Kz", oldPrice: "2.100 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLoUkm1WV5FQHk7uVah_uw-yhEKBCpqiBFtEvFddQpeXMYvIqxMpgyuejo2E1-G1NyOM0wi2TPQKlr5EMBAkudNTkMhBAF8qjTsLrbaETuBdG7OLsUnKCgLI_WlS7C6ZITYt3_EwTr3wBqyjyUTATEmwwCg9AsI2qzkHcHZ1xnK_1b-cJvKBWM5dOTX2ljU-2TvdkyS7yI_BLgpc0hV2-KOxJnwuhBx-I2CCj8STiek-Csi1tGsSb6", badge: { label: "Promoção", tone: "promo" } },
  { id: 3, brand: "Bom Petisco", name: "Atum em Azeite Bom Petisco 120g", price: 950, priceLabel: "950 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQcrM9-QXSAFY5sHK6RSGwCWEuLUchMlMn10QciPcUETggRrZqhZ6ujjjp6Zn3Z2-YtKomMUU-121XFxnN1XvGozKzIaQ6EAw0yhtPUDOeVpbrPWTu98C-xibiatyeS7qpAtW3DCGoy3ALqw1tM_zBKs-lfzERr4y8MBWeIO3Puwa9t7qePtNFbxAeh2oYDKf6eaddbE6lZbl3-RZmbxteFPAtxyxAU2dVP2ZZ2TZLaS0GkzALtTtv", badge: { label: "Esgotado", tone: "soldout" }, soldOut: true },
  { id: 4, brand: "Nacional", name: "Feijão Preto Nacional 1Kg", price: 1400, priceLabel: "1.400 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9aoJfEzuflJJS_U-91JIxxKEj5hePV-lZ72BkowYVw8OOLHaUBZ4xEbM9u5tA5S6VndFovKysF-gVQPi8xEYV-NlxUoZ7m83TajCKbTGHsGepAPkEEYFH398lBHk4ih5JyUSO91YSgy9b2boi2dAyOBahdRRHSr5KrBAwBiLUnKDr9lvzfxCVrvowPWqSWPNg9AZ6H0MNR3vXWWKadvIuo1VyEx2mnz6Fa-OSiu5YS-swC1NbJctt" },
  { id: 5, brand: "Milaneza", name: "Esparguete Milaneza 500g", price: 650, priceLabel: "650 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDg3QbCrQXTcet_AeyPmcVpqUrLSBJbP0asIHLZ8YWvS90cYr7yeOPTggSbRJg0W2qUpB553zNOlZ-e7PX3w5Xs7-IcAoy057RQssBFZI6N-o5zyc7b2b6PZSGFB65rtFSTYzTRKu8PvMzuDIQxnqh6lRbKDZl92Uy61N6HkTTsbpsQrE7QHb3fv1-R7APto_Q44-o2nveShQRHxdFn-YggpFKMGNzf3CwZCjfozsJKlfyBOhST5d5r" },
  { id: 6, brand: "AngoDoce", name: "Açúcar Branco AngoDoce 2Kg", price: 2100, priceLabel: "2.100 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF1Ost9e4uN8Ck0P9U0igcQLqG4NENqkEVMt7gskdlZxcmgsg2-EETcSOxojl9KWfzxpxF8pnbQY-EtygaTZSa9D1wHdL_Z4hkKTPJeej4CRYd81x1SjragWXk9iti62Y8gTyKQ6eTnyEQt6gEVyNolQb9nmOhjZaSkhxs-L8QDFSzbQ3-MKTcTO5IRnGZa9-p1i9hDztizZ0oWlWJG508Y5HjMAKVNEqswAqhSP0mYsWJ5JBXF3ju" },
];

export default function MercadoPage() {
  const { locale } = useParams();
  const { addItem } = useCart();

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-container-margin py-xl flex flex-col md:flex-row gap-xl relative">
      {/* Left Sidebar (Filters) */}
      <aside className="hidden md:block w-64 shrink-0 space-y-xl sticky top-24 h-fit">
        <div className="text-secondary font-body-sm text-body-sm mb-lg">
          <Link href={`/${locale}/`} className="hover:text-primary transition-colors">Início</Link>
          <span> &gt; </span>
          <span className="font-label-bold text-on-surface">Alimentares</span>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-md soft-shadow-level-1 border border-surface-variant">
          <div className="flex items-center gap-sm mb-md pb-xs border-b border-surface-variant">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            <h2 className="font-h3 text-h3 text-on-surface">Filtros</h2>
          </div>

          <div className="mb-lg">
            <h3 className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Sub-categorias</h3>
            <ul className="space-y-sm font-body-sm text-body-sm text-on-surface">
              {["Arroz & Massas", "Óleos & Azeites", "Enlatados & Conservas", "Farinhas & Cereais"].map((c, i) => (
                <li key={c}>
                  <label className="flex items-center gap-xs cursor-pointer hover:text-primary transition-colors">
                    <input defaultChecked={i === 0} className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
                    {c}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-lg">
            <h3 className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Preço (Kz)</h3>
            <div className="flex items-center gap-sm">
              <input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Min" type="number" />
              <span className="text-outline-variant">-</span>
              <input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Max" type="number" />
            </div>
          </div>

          <div>
            <h3 className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Marca</h3>
            <ul className="space-y-sm font-body-sm text-body-sm text-on-surface">
              {["Tio Lucas", "Fula", "Bom Petisco"].map((m) => (
                <li key={m}>
                  <label className="flex items-center gap-xs cursor-pointer hover:text-primary transition-colors">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
                    {m}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Product Grid Area */}
      <section className="flex-1 w-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-lg gap-md">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface">Alimentares</h1>
            <p className="font-body-md text-body-md text-secondary mt-base">Mostrando 24 de 156 produtos</p>
          </div>
          <div className="flex items-center gap-xs">
            <span className="font-body-sm text-body-sm text-secondary">Ordenar por:</span>
            <select className="bg-surface-container-lowest border border-outline-variant rounded-lg py-xs pl-sm pr-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary soft-shadow-level-1 cursor-pointer">
              <option>Relevância</option>
              <option>Preço: Menor ao Maior</option>
              <option>Preço: Maior ao Menor</option>
              <option>Mais Vendidos</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter md:gap-md">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="bg-surface-container-lowest rounded-lg soft-shadow-level-1 overflow-hidden flex flex-col relative group border border-transparent hover:border-outline-variant transition-all duration-200"
            >
              {p.badge && (
                <div
                  className={`absolute top-xs left-xs z-10 font-label-bold text-[10px] px-xs py-[2px] rounded-full uppercase tracking-wider soft-shadow-level-1 ${
                    p.badge.tone === "promo"
                      ? "bg-primary-fixed text-on-primary-fixed"
                      : "bg-error text-on-error"
                  }`}
                >
                  {p.badge.label}
                </div>
              )}
              <div className="h-48 w-full bg-surface-container-high relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={p.image} alt={p.name} />
              </div>
              <div className="p-sm flex-1 flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide text-[10px] mb-base">{p.brand}</span>
                <h3 className="font-body-md text-body-md text-on-surface line-clamp-2 leading-tight">{p.name}</h3>
                <div className="mt-auto pt-sm flex flex-col gap-sm">
                  <div className="flex items-center gap-xs">
                    <span className="font-price-display text-price-display text-primary">{p.priceLabel}</span>
                    {p.oldPrice && (
                      <span className="font-body-sm text-body-sm text-outline-variant line-through text-[12px]">{p.oldPrice}</span>
                    )}
                  </div>
                  {p.soldOut ? (
                    <button className="w-full h-[48px] bg-surface-variant text-secondary rounded-lg flex items-center justify-center gap-xs font-label-bold text-label-bold cursor-not-allowed" disabled>
                      <span className="material-symbols-outlined text-[20px]">notifications</span> Avisar-me
                    </button>
                  ) : (
                    <button
                      onClick={() => addItem({ id: p.id, name: p.name, price: p.price, qty: 1, image: p.image })}
                      className="w-full h-[48px] bg-primary text-on-primary rounded-lg flex items-center justify-center gap-xs font-label-bold text-label-bold hover:bg-surface-tint active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span> Adicionar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-xl flex justify-center items-center gap-sm font-body-md text-body-md">
          <button className="p-xs text-secondary hover:bg-surface-container-low rounded flex items-center justify-center disabled:opacity-50">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`w-8 h-8 flex items-center justify-center rounded-full font-label-bold ${
                n === 1 ? "bg-primary text-on-primary" : "text-secondary hover:bg-surface-container-low transition-colors"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="text-outline-variant">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:bg-surface-container-low transition-colors">8</button>
          <button className="p-xs text-secondary hover:bg-surface-container-low rounded flex items-center justify-center">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>
    </main>
  );
}