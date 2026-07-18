"use client";

import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api";
import type { Category } from "@/types";
import { Apple, Coffee, Shirt, Home } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Alimentares: <Apple className="h-8 w-8" />,
  Bebidas: <Coffee className="h-8 w-8" />,
  Higiene: <Shirt className="h-8 w-8" />,
  "Produtos de Casa": <Home className="h-8 w-8" />,
};

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi.categories
      .list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="categorias" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-container-high" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categorias" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Categorias</h2>
          <p className="mt-2 text-on-surface-variant">Explore os nossos produtos por categoria</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/mercado?categoria=${cat.slug}`}
              className="bg-surface-container-lowest rounded-2xl p-6 text-center shadow-sm ring-1 ring-surface-container-high transition-all hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                {CATEGORY_ICONS[cat.name] || <Home className="h-8 w-8" />}
              </div>
              <h3 className="font-semibold text-on-surface">{cat.name}</h3>
              {cat._count && (
                <p className="text-xs text-on-surface-variant">{cat._count.products} produtos</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
