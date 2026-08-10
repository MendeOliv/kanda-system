"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const CATEGORIES = [
  { name: "Alimentares", icon: "restaurant", href: "/mercado?categoria=alimentares" },
  { name: "Higiene", icon: "clean_hands", href: "/mercado?categoria=higiene" },
  { name: "Bebidas", icon: "local_bar", href: "/mercado?categoria=bebidas" },
  { name: "Casa", icon: "home", href: "/mercado?categoria=casa" },
];

const PRODUCTS = [
  { id: 1, name: "Arroz Kanda Premium 5kg", price: 4500, priceLabel: "4.500 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-vaU3YLqdAtKGbuKm11uMntqOVaQQGx5Joi4eEoxbNDcJrs8dDQBin5_tfO84aW08rDmBgXOLaNEnyFoyXpF-m2DsnlZGKL0s5895kv17oFYG6f99g_O2LT6vxSRhQmceF27IUytJO0Y20iMPjF7CC42gy0565OYELuwpSPyIBREOTn5ANbgKhVw1OFX2V3QrSeBdloNwUzdY-z8QeR7KCH8KE3fdSp1t2B36nGTvBuJYM2ouRaYL", soldOut: true },
  { id: 2, name: "Óleo Alimentar Puro 1L", price: 1200, priceLabel: "1.200 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0ciKTNR7cowrcGyhtSZrWZ0uB4aqDd7iIzBDXc2bHinLn1KFBZrVcVJKYHEzz3HhM7mI0eYR3mQgohtZ3sdE7_5E6xcA5ociX32RxWcswVGmWybfzKEnQhoGpT5CyfkwSo5FY6b5i5tcL4PCczj2QJBoeOg8i9cMdvqftD0hxKGX4cK061iAxBTVpIZGSjVsFwR_qaltunFyj9WTTFbvDMJKj9yilBbxuDZndpPPH29KCDio0HEkz" },
  { id: 3, name: "Banana Pão Nacional (Cacho)", price: 800, priceLabel: "800 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBslDFYvhmSTsZhfqD9XczYzRrNm0uy0xoFRAyhrXAtwtPJKR1ShPrmlrxY3dzkeFWA1Udh4yan6iNlRD4kL4VO_nDYDwFYrtjJxRNz_4SucfaBWRq8ua4xfNRpyy5EpApO_8D4P631-qet8ZqUC9Nup20DTGBjpkbcNJboNXNp26cEpfZuiMejuwoWrsR_cx9NjcKLw1BIzm8pFNCaI9Un4-5Mh4T_Y9Br_Tf0vt6N2sd3qjxdgLN3" },
  { id: 4, name: "Papel Higiénico Folha Dupla 4 un", price: 600, priceLabel: "600 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ28geCq8jyCibvKz1TSr1dhDMwv4_QZG8uMH7MwAkUzCx5J-sofwfZsXaDLN_qUuKISbYGUQeH83VVwF7btg0pVxgMdQVN2pKveT9-Shs7rN6xc4gdYg8NxtZQtxfcGU2UQV4px73ZH5yUzoY1Pk5Rz61rwoS1Yf0uvxkwTcYDm_uFncKHHWvNwT_ItwY5S3HFKH8-0Y7LdaoGNd3EuUjM4iVLdFtO6dfG-hTT0VpC86hrvp_XT8Z" },
];

export default function HomePage() {
  const { locale } = useParams();
  const { addItem } = useCart();

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-container-margin py-xl space-y-xl">
      {/* Hero Banner */}
      <section className="w-full h-[400px] rounded-xl overflow-hidden relative shadow-[0px_2px_8px_rgba(26,43,76,0.06)] group cursor-pointer">
        <div
          className="absolute inset-0 bg-cover bg-center w-full h-full"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBF6woE4ntHBASi5o3qmbhlyHLkk6XW5I2XhUZfsfljI86_tfpLNE_0m8aGMZY3Rb4nt9pQsiP4uzz3Y4a-u-hTv3Jko6HlIJCoa-McGejVwRc6FDc9X2OYDADy2YZ5flbhpwsejEw0VWZqNxz4AeHdr8Ekoih5K3_cspCKm85aj2ss-PWclb2WGCeK96T9oI8COSQviGQKNJNgVLY206nY1RSLMPXCIRhe_wmRq3ILSdBwaIj5wnwJ')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface/80 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center p-xl md:p-12 w-full md:w-2/3">
          <span className="inline-block bg-primary-container text-on-primary-container font-label-bold px-sm py-xs rounded-full w-max mb-md shadow-sm">
            Promoção da Semana
          </span>
          <h1 className="font-h1 text-h1 text-on-primary mb-md drop-shadow-md">
            Frescura que vem da terra, direto para a sua mesa.
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary/90 mb-lg max-w-md">
            Descubra a nossa seleção de frutas da época com até 20% de desconto. Qualidade garantida pelo seu vizinho.
          </p>
          <Link
            href={`/${locale}/mercado`}
            className="bg-primary-container text-on-primary-container font-label-bold h-12 px-xl rounded-lg w-max hover:bg-primary-fixed-dim transition-colors flex items-center justify-center shadow-[0px_8px_24px_rgba(26,43,76,0.12)]"
          >
            Aproveitar Agora
          </Link>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section>
        <div className="flex justify-between items-end mb-lg">
          <h2 className="font-h2 text-h2 text-on-surface">Explorar Categorias</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-lg">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/${locale}${cat.href}`}
              className="bg-surface-container-lowest rounded-xl p-md flex flex-col items-center justify-center gap-sm aspect-square cursor-pointer hover:shadow-[0px_8px_24px_rgba(26,43,76,0.12)] transition-shadow border border-outline-variant hover:border-primary-container group"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined text-4xl">{cat.icon}</span>
              </div>
              <span className="font-label-bold text-label-bold text-on-surface text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section>
        <div className="flex justify-between items-end mb-lg">
          <h2 className="font-h2 text-h2 text-on-surface">Mais Vendidos</h2>
          <Link
            href={`/${locale}/mercado`}
            className="font-label-bold text-label-bold text-primary hover:text-primary-fixed-dim transition-colors"
          >
            Ver Todos
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md md:gap-lg">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-[0px_2px_8px_rgba(26,43,76,0.06)] overflow-hidden flex flex-col group hover:shadow-[0px_8px_24px_rgba(26,43,76,0.12)] transition-shadow"
            >
              <div className="aspect-square relative overflow-hidden bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={p.image}
                  alt={p.name}
                />
                {p.soldOut && (
                  <div className="absolute top-2 left-2 bg-error text-on-error font-label-bold text-[10px] px-2 py-1 rounded-full">
                    Esgotado
                  </div>
                )}
              </div>
              <div className="p-sm flex flex-col flex-1 gap-xs">
                <h3 className="font-body-md text-body-md text-on-surface line-clamp-2">{p.name}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-price-display text-price-display text-on-surface">{p.priceLabel}</span>
                </div>
                {p.soldOut ? (
                  <button
                    className="mt-sm w-full h-12 bg-surface-variant text-on-surface-variant font-label-bold rounded-lg flex items-center justify-center gap-xs cursor-not-allowed opacity-70"
                    disabled
                  >
                    Indisponível
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      addItem({ id: p.id, name: p.name, price: p.price, qty: 1, image: p.image })
                    }
                    className="mt-sm w-full h-12 bg-primary-container text-on-primary-container font-label-bold rounded-lg flex items-center justify-center gap-xs hover:bg-primary-fixed-dim transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Adicionar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}