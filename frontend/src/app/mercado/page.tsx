"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Todos", count: 124 },
  { name: "Hortifrúti", count: 45 },
  { name: "Padaria", count: 22 },
  { name: "Talho", count: 18 },
  { name: "Bebidas", count: 39 },
];

const PRODUCTS = [
  { name: "Laranjas da Huíla (Kg)", category: "Hortifrúti", price: "1.250 Kz", stock: "45 unidades", badge: "Destaque", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpEFTO40cUFroevzfzbE3ERnlD6p6kVsiq-fn43j8ldP3O9woK8hVP5Xz3DInKR7zROyQQCavOMJUQ5GmRSqkdDg1wpq77os366NR5CAyMUF9lvnjKw7wQT6CK4vMmQkurSqOa5fQ0geX_noYjfNYxgYN5w1Lz_ZSfqUUl96zigIO2rL76Ck4Ay4jv5UOridbjSwWK7lGLPxodI6XGtkFQ0LGGmhYburmeoCvPFurglNBoweJNOvpV" },
  { name: "Pão de Luanda Especial", category: "Padaria", price: "450 Kz", stock: "12 unidades", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3oLQVSLCdG-Hc-UhoWIxruyrQyJeMh-U3gPaBVptZmJ1sLLk0SfVzOTBmGgRWd1v3Esh627IPruKU2-HwXaJshrTdaKm_TMHwdgka6Qr6ewd3P6QTP2od0Jh4E5euFG-5UbDhOkjJrkOJobneqwRwjh6rODHeFFpGFzf2jnEktbAPQHjp01zBKoRaq4wVG9buZ28a2yho98vxI7WWGJGLUPQltcbRfqo7QfO4-DejiqX-8SzBm_-y" },
  { name: "Lombo de Novilho (Kg)", category: "Talho", price: "8.900 Kz", stock: "3 unidades", badge: "Esgotando", badgeType: "error", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAISF6Zbf7KedKMADLummrOq9QCNqEEGUg0s6i6w6k6A-OrGWfEJWvufByCr1dYXmMxkgkPp3E-VnXQCsvs7JFHD0yiyU5FcBa3__iDWks6ymtP3dlr8H5Yz_NozaQKzXAd6Da1KYuvGbp4AlbXt_v764GHPpWGGNVfaWmj51TLvZ-59rAcE1OjhtjQZjWAcJkfJ-e0A0Cz-TzwARLXkBHbKPmB17MS2GWjjdXpgponjFhcVInjVoQs" },
  { name: "Mel Puro de Malanje", category: "Mercearia", price: "3.500 Kz", stock: "15 unidades", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTzxRu9y_IGHB26aPqNY63_IjEJBYCqLXeAfwses-tkkqC3vu3HGATgPsch0fMQpOuEVhulCiiYpyZtd2mCBerMiBXHJQKLCJI8OlS5-UsYsN4yp2UUeic3xt4bhNjQ64gYBA5zrmYxQTlbtzqlSQi0x1oJVbWh7qeZ8YfooW4IURhIhYh0jf6VSA4MmVGJK-ZbdVc0iKfCQI6eaZKyWUcxU1ntkLXhZcT-DSaeZcFtvwj2cnBy5F7" },
  { name: "Cesto Mix Bio (Grande)", category: "Hortifrúti", price: "7.200 Kz", stock: "8 unidades", badge: "Orgânico", badgeType: "secondary", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDfeueEpm1_ll-vDLT_qIymEj0u9d1wS0r4UzS7xV4vNjCRQKlCrPVV53H1zVlw_p6QgE3Yf2SI0I0GZBVp3sm65-CgVhFTLx48y9rjvLmfMAH1OYADTRskoKb6HaiVjs91Z1QMgvTMSEs-DaxM81Gk6GUbtJ4gZar9w8K5kQMXN45umPSP00ezzj7NxXMV-MIepPCY3SZ-AwCv2r71g1X0zf_A6H-7YEupQ33fXwkCzeE4ZA8StY8" },
  { name: "Sumo Natural Maracujá", category: "Bebidas", price: "1.200 Kz", stock: "22 unidades", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Xo-fPymGg1LiXLKw2dyezNhrOEZRbXnHxKJSVWfto1ZXt_6v58snQCBYoVEWqhweUYld_nos5fihPtC1QgkJ6Klnq-953uZrNjflM3zrzjKT4IDabUIt7kjnLCLbbX6kn00_HXH2Ymv7N1GdE2rMhSfthruWoszxqpEouQ2KLTt3Tf-EFOAj1wUAS0DCTi7uSuNzzSU3Hw0_LUkl4fmFiYV-WITTIpg2GOXu_NON8hOre0qvqndM" },
];

export default function MercadoPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl flex gap-lg">
      <aside className="w-64 flex-shrink-0 hidden md:block">
        <div className="bg-surface-container-lowest p-md rounded-xl ambient-shadow flex flex-col gap-md sticky top-32">
          <h2 className="font-headline-md text-headline-md text-on-surface border-b border-surface-container-high pb-sm">Filtros</h2>
          <div>
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-sm">Categorias</h3>
            <ul className="flex flex-col gap-xs">
              {CATEGORIES.map((cat) => (
                <li
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === cat.name
                      ? "bg-primary-container/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className="font-body-md text-body-md">{cat.name}</span>
                  <span className="font-label-sm text-label-sm">{cat.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider mb-sm">Preço (Kz)</h3>
            <input className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" max="50000" min="0" type="range" />
          </div>
          <button className="mt-base w-full py-3 bg-secondary text-on-secondary rounded-lg font-label-md hover:bg-secondary/90 transition-all active:scale-95">
            Limpar Filtros
          </button>
        </div>
      </aside>

      <section className="flex-1">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface">Produtos Frescos</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Encontrados 124 produtos para você</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {PRODUCTS.map((p) => (
            <Link key={p.name} href={`/produto/${p.name.toLowerCase().replace(/\s+/g, "-")}`} className="product-card group relative bg-surface-container-lowest rounded-xl p-md ambient-shadow flex flex-col gap-sm transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden rounded-lg aspect-square mb-sm">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${p.image}')` }} />
                {p.badge && (
                  <span className={`absolute top-3 left-3 font-label-sm px-3 py-1 rounded-full ${
                    p.badgeType === "error" ? "bg-error text-on-error" :
                    p.badgeType === "secondary" ? "bg-secondary-container text-on-secondary-container" :
                    "bg-primary text-on-primary"
                  }`}>{p.badge}</span>
                )}
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-label-sm text-label-sm text-outline uppercase mb-xs">{p.category}</span>
                <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">{p.name}</h3>
                <div className="mt-auto pt-sm flex justify-between items-end">
                  <div>
                    <span className="font-headline-md text-headline-md text-primary font-bold">{p.price}</span>
                    <span className="font-label-sm text-label-sm text-tertiary block">{p.stock}</span>
                  </div>
                </div>
              </div>
              <button type="button" className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md flex items-center justify-center gap-2 mt-md shadow-lg shadow-primary/20" onClick={(e) => { e.preventDefault(); }}>
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Adicionar
              </button>
            </Link>
          ))}
        </div>

        <div className="mt-xl flex justify-center items-center gap-sm">
          <button type="button" className="p-2 rounded-lg hover:bg-surface-container-low text-outline disabled:opacity-30" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button type="button" className="w-10 h-10 rounded-lg bg-primary text-on-primary font-label-md">1</button>
          <button type="button" className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface-variant font-label-md">2</button>
          <button type="button" className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface-variant font-label-md">3</button>
          <span className="w-10 h-10 flex items-center justify-center text-outline">...</span>
          <button type="button" className="w-10 h-10 rounded-lg hover:bg-surface-container-low text-on-surface-variant font-label-md">12</button>
          <button type="button" className="p-2 rounded-lg hover:bg-surface-container-low text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>
    </main>
  );
}
