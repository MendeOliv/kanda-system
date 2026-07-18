"use client";

import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { Package, Plus, Search } from "lucide-react";

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.products
      .list()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category?.name).filter((n): n is string => Boolean(n)))];

  const filtered = products.filter((p) => {
    if (selectedCategory && p.category?.name !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <section id="produtos" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-container-high" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Os Nossos Produtos</h2>
          <p className="mt-2 text-on-surface-variant">
            {products.length} produtos disponíveis para entrega
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-outline-variant rounded-xl bg-white px-4 py-3 pl-10 font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                !selectedCategory
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
              )}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Package className="h-12 w-12 text-on-surface-variant/30" />
            <p className="text-lg font-medium text-on-surface-variant">Nenhum produto encontrado</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setSelectedCategory(null); }}
              className="bg-surface-container-low text-on-surface-variant px-8 py-4 rounded-xl font-label-md hover:bg-surface-container transition-all"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-surface-container-lowest rounded-2xl shadow-sm ring-1 ring-surface-container-high overflow-hidden transition-all hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-on-surface-variant/30" />
                    </div>
                  )}
                  {product.discountPrice && (
                    <span className="absolute left-2 top-2 rounded-full bg-error px-2 py-0.5 text-xs font-bold text-on-error">
                      -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">
                    {product.category?.name}
                  </p>
                  <h3 className="mt-1 font-semibold text-on-surface line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                      {product.discountPrice ? (
                        <div>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(product.discountPrice)}
                          </span>
                          <span className="ml-2 text-xs text-on-surface-variant line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-on-surface">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-all hover:brightness-110 active:scale-95"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
