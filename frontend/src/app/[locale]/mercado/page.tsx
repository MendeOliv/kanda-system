"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { catalogApi } from "@/lib/api";
import { useTranslations } from "next-intl";
const FALLBACK_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
import { useState, useEffect } from "react";

interface Product {
  id: number | string;
  name: string;
  price: number;
  priceLabel: string;
  oldPrice?: string;
  image: string;
  badge?: { label: string; tone: "promo" | "soldout" };
  soldOut?: boolean;
  category?: {
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MercadoPage() {
  const { locale } = useParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrandIds([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      const response = await catalogApi.brands.list();
      setBrands(response || []);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
      setError("Falha ao carregar marcas");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await catalogApi.categories.list();
      setCategories(response.categories || response);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Falha ao carregar categorias");
    }
  };

  const fetchProducts = async (category: string | null = null, brandIds: string[] = []) => {
    try {
      setLoading(true);
      const params: any = {};
      if (category) {
        params.category = category;
      }
      if (brandIds.length > 0) {
        params.brandIds = brandIds.join(",");
      }
      const response = await catalogApi.products.list(params);
      setProducts(response.products || response);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Falha ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory, selectedBrandIds);
  }, [selectedCategory, selectedBrandIds]);

  if (loading) {
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
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <label className="flex items-center gap-xs cursor-pointer hover:text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                      />
                      {cat.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-lg">
              <h3 className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Preço (Kz)</h3>
              <div className="flex items-center gap-sm">
<input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" type="number" />
                <span className="text-outline-variant">-</span>
<input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" type="number" />
              </div>
            </div>

            <div>
              <h3 className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Marca</h3>
              <ul className="space-y-sm font-body-sm text-body-sm text-on-surface">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-xs cursor-pointer hover:text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBrandIds.includes(brand.id)}
                        onChange={() => {
                          setSelectedBrandIds((prev) =>
                            prev.includes(brand.id)
                              ? prev.filter((id) => id !== brand.id)
                              : [...prev, brand.id]
                          );
                        }}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                      />
                      {brand.name}
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
              <p className="font-body-md text-body-md text-secondary mt-base">Carregando produtos...</p>
            </div>
            <div className="flex items-center gap-xs">
              <span className="font-body-sm text-body-sm text-secondary">Ordenar por:</span>
              <select className="bg-surface-container-lowest border border-outline-variant rounded-lg py-xs pl-sm pr-lg font-body-sm text-body-sm text_on_surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary soft_shadow_level_1 cursor-pointer">
                <option>Relevância</option>
                <option>Preço: Menor ao Maior</option>
                <option>Preço: Maior ao Menor</option>
                <option>Mais Vendidos</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter md:gap-md">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <article key={`skeleton-${i}`} className="bg-surface-container-lowest rounded-lg soft-shadow-level-1 overflow-hidden flex flex-col relative group border border-transparent hover:border-outline-variant transition_all duration-200">
                <div className="h-48 w-full bg-surface-container-high relative overflow_hidden">
                  <div className="animate_pulse bg-surface_container_high"></div>
                </div>
                <div className="p-sm flex-1 flex flex_col">
                  <span className="font_body_sm text_body_sm text_on_surface_variant uppercase tracking-wide text-[10px] mb-base">Marca</span>
                  <h3 className="font_body_md text_body_md text_on_surface line_clamp_2 leading_tight">Nome do Produto</h3>
                  <div className="mt-auto pt_sm flex flex_col gap_sm">
                    <div className="flex items-center gap_xs">
                      <span className="font_price_display text_price_display text_primary">0 Kz</span>
                    </div>
                    <button className="w-full h-[48px] bg_surface_variant text_secondary rounded-lg flex items-center justify_center gap_xs font_label_bold text_label_bold cursor_not_allowed" disabled>
                      <span className="material_symbols_outlined text-[20px]">notifications</span> Avisar-me
                    </button>
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
                className={`w-8 h-8 flex items-center justify-center rounded-full font-label-bold ${n === 1 ? "bg-primary text-on-primary" : "text-secondary hover:bg-surface-container-low transition-colors"}`}
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

  if (error) {
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
              <h3 className="font-label-bold text-label-bold text_on_surface_variant mb_sm">Sub-categorias</h3>
              <ul className="space_y_sm font_body_sm text_body_sm text_on_surface">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <label className="flex items-center gap-xs cursor-pointer hover:text_primary transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                        className="rounded border_outline_variant text_primary focus:ring_primary w-4 h-4"
                      />
                      {cat.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-lg">
              <h3 className="font-label-bold text-label-bold text_on_surface_variant mb_sm">Preço (Kz)</h3>
              <div className="flex items-center gap-sm">
<input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" type="number" />
                <span className="text_outline_variant">-</span>
<input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" type="number" />
              </div>
            </div>

            <div>
              <h3 className="font-label-bold text-label-bold text_on_surface_variant mb_sm">Marca</h3>
              <ul className="space_y_sm font_body_sm text_body_sm text_on_surface">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-xs cursor-pointer hover:text_primary transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBrandIds.includes(brand.id)}
                        onChange={() => {
                          setSelectedBrandIds((prev) =>
                            prev.includes(brand.id)
                              ? prev.filter((id) => id !== brand.id)
                              : [...prev, brand.id]
                          );
                        }}
                        className="rounded border_outline_variant text_primary focus:ring_primary w-4 h-4"
                      />
                      {brand.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="flex-1 w-full flex flex-col">
          <div className="flex flex-col sm:flex_row sm:items-end justify-between mb-lg gap_md">
            <div>
              <h1 className="font_h1 text_h1 text_on_surface">Alimentares</h1>
              <p className="font_body_md text_body_md text_secondary mt_base">{error}</p>
            </div>
            <div className="flex items-center gap_xs">
              <span className="font_body_sm text_body_sm text_secondary">Ordenar por:</span>
              <select className="bg_surface_container_lowest border border_outline_variant rounded-lg py-xs pl_sm pr-lg font_body_sm text_body_sm text_on_surface focus:outline-none focus:border_primary focus:ring_1 focus:ring_1 soft_shadow_level_1 cursor-pointer">
                <option>Relevância</option>
                <option>Preço: Menor ao Maior</option>
                <option>Preço: Maior ao Menor</option>
                <option>Mais Vendidos</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid_cols_2 sm:grid_cols_3 lg:grid_cols_4 gap_gutter md:gap_md">
            <div className="flex flex-col items-center py-20 text_center">
              <p className="text_lg font_medium text_on_surface_variant">Falha ao carregar produtos. Tente novamente mais tarde.</p>
              <button
                onClick={() => {
                  fetchCategories();
                  fetchBrands();
                  fetchProducts(selectedCategory, selectedBrandIds);
                }}
                className="bg_primary text_on_primary font_label_bold h-12 px-xl rounded-lg flex items-center justify_center gap_xs hover:bg_surface_tint transition_colors"
              >
                <span className="material_symbols_outlined text-[20px]">refresh</span> Tentar Novamente
              </button>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt_xl flex justify-center items-center gap_sm font_body_md text_body_md">
            <button className="p-xs text_secondary hover:bg_surface_container_low rounded flex items-center justify_center disabled:opacity-50">
              <span className="material_symbols_outlined">chevron_left</span>
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 flex items-center justify-center rounded-full font_label_bold ${n === 1 ? "bg_primary text_on_primary" : "text_secondary hover:bg_surface_container_low transition-colors"}`}
              >
                {n}
              </button>
            ))}
            <span className="text_outline_variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-full text_secondary hover:bg_surface_container_low transition_colors">8</button>
            <button className="p-xs text_secondary hover:bg_surface_container_low rounded flex items-center justify-center">
              <span className="material_symbols_outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-container-margin py-xl flex flex_col md:flex_row gap_xl relative">
      {/* Left Sidebar (Filters) */}
      <aside className="hidden md:block w-64 shrink-0 space_y_xl sticky top-24 h-fit">
        <div className="text_secondary font_body_sm text_body_sm mb-lg">
          <Link href={`/${locale}/`} className="hover:text_primary transition-colors">Início</Link>
          <span> &gt; </span>
          <span className="font_label_bold text_on_surface">Alimentares</span>
        </div>
        <div className="bg_surface_container_lowest rounded-lg p-md soft_shadow_level_1 border border_surface_variant">
          <div className="flex items-center gap-sm mb-md pb-xs border-b border_surface_variant">
            <span className="material_symbols_outlined text_primary">filter_list</span>
            <h2 className="font_h3 text_h3 text_on_surface">Filtros</h2>
          </div>

          <div className="mb-lg">
            <h3 className="font_label_bold text_label_bold text_on_surface_variant mb_sm">Sub-categorias</h3>
            <ul className="space_y_sm font_body_sm text_body_sm text_on_surface">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <label className="flex items-center gap-xs cursor-pointer hover:text_primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat.name}
                      onChange={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                      className="rounded border_outline_variant text_primary focus:ring_primary w-4 h-4"
                    />
                    {cat.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-lg">
            <h3 className="font_label_bold text_label_bold text_on_surface_variant mb_sm">Preço (Kz)</h3>
            <div className="flex items-center gap-sm">
<input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" type="number" />
              <span className="text_outline_variant">-</span>
<input className="w-full bg-surface text-on-surface border border-outline-variant rounded py-xs px-sm font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" type="number" />
            </div>
          </div>

          <div>
            <h3 className="font_label_bold text_label_bold text_on_surface_variant mb_sm">Marca</h3>
            <ul className="space_y_sm font_body_sm text_body_sm text_on_surface">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <label className="flex items-center gap-xs cursor-pointer hover:text_primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBrandIds.includes(brand.id)}
                      onChange={() => {
                        setSelectedBrandIds((prev) =>
                          prev.includes(brand.id)
                            ? prev.filter((id) => id !== brand.id)
                            : [...prev, brand.id]
                        );
                      }}
                      className="rounded border_outline_variant text_primary focus:ring_primary w-4 h-4"
                    />
                    {brand.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Product Grid Area */}
      <section className="flex-1 w-full flex flex-col">
        <div className="flex flex-col sm:flex_row sm:items-end justify-between mb-lg gap_md">
          <div>
            <h1 className="font_h1 text_h1 text_on_surface">Alimentares</h1>
            <p className="font_body_md text_body_md text_secondary mt_base">
              Mostrando {products.length} produtos
            </p>
          </div>
          <div className="flex items-center gap_xs">
            <span className="font_body_sm text_body_sm text_secondary">Ordenar por:</span>
            <select className="bg_surface_container_lowest border border_outline_variant rounded-lg py-xs pl_sm pr-lg font_body_sm text_body_sm text_on_surface focus:outline-none focus:border_primary focus:ring_1 focus:ring_1 soft_shadow_level_1 cursor-pointer">
              <option>Relevância</option>
              <option>Preço: Menor ao Maior</option>
              <option>Preço: Maior ao Menor</option>
              <option>Mais Vendidos</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid_cols_2 sm:grid_cols_3 lg:grid_cols_4 gap_gutter md:gap_md">
          {products.map((p) => (
            <article
              key={p.id}
              className="bg_surface_container_lowest rounded-lg soft_shadow_level_1 overflow_hidden flex flex_col relative group border border_transparent hover:border_outline_variant transition_all duration-200"
            >
              {p.badge && (
                <div
                  className={`absolute top-xs left-xs z-10 font_label_bold text-[10px] px-xs py-[2px] rounded-full uppercase tracking-wider soft_shadow_level_1 ${
                    p.badge.tone === "promo"
                      ? "bg_primary_fixed text_on_primary_fixed"
                      : "bg_error text_on_error"
                  }`}
                >
                  {p.badge.label}
                </div>
              )}
              <div className="h-48 w-full bg_surface_container_high relative overflow_hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover group_hover:scale-105 transition-transform duration-300"
                  src={p.image ?? FALLBACK_IMAGE}
                  alt={p.name}
                 onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
              </div>
              <div className="p-sm flex-1 flex flex_col">
                <span className="font_body_sm text_body_sm text_on_surface_variant uppercase tracking-wide text-[10px] mb_base">{p.brand?.name ?? "Sem marca"}</span>
                <h3 className="font_body_md text_body_md text_on_surface line_clamp_2 leading_tight">{p.name}</h3>
                <div className="mt-auto pt_sm flex flex_col gap_sm">
                  <div className="flex items-center gap_xs">
                    <span className="font_price_display text_price_display text_primary">{p.priceLabel}</span>
                    {p.oldPrice && (
                      <span className="font_body_sm text_body_sm text_outline_variant line-through text-[12px]">{p.oldPrice}</span>
                    )}
                  </div>
                  {p.soldOut ? (
                    <button
                      className="w-full h-[48px] bg_surface_variant text_secondary rounded-lg flex items-center justify_center gap_xs font_label_bold text_label_bold cursor_not_allowed" disabled
                    >
                      <span className="material_symbols_outlined text-[20px]">notifications</span> Avisar-me
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        addItem({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          qty: 1,
                          image: p.image,
                        })
                      }
                      className="w-full h-[48px] bg_primary text_on_primary rounded-lg flex items-center justify_center gap_xs font_label_bold text_label_bold hover:bg_surface_tint active:scale-95 transition_all"
                    >
                      <span className="material_symbols_outlined text-[20px]">add</span> Adicionar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt_xl flex justify-center items-center gap_sm font_body_md text_body_md">
          <button className="p-xs text_secondary hover:bg_surface_container_low rounded flex items-center justify_center disabled:opacity-50">
            <span className="material_symbols_outlined">chevron_left</span>
          </button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`w-8 h-8 flex items-center justify-center rounded-full font_label_bold ${n === 1 ? "bg_primary text_on_primary" : "text_secondary hover:bg_surface_container_low transition-colors"}`}
            >
              {n}
            </button>
          ))}
          <span className="text_outline_variant">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-full text_secondary hover:bg_surface_container_low transition_colors">8</button>
          <button className="p-xs text_secondary hover:bg_surface_container_low rounded flex items-center justify-center">
            <span className="material_symbols_outlined">chevron_right</span>
          </button>
        </div>
      </section>
    </main>
  );
}