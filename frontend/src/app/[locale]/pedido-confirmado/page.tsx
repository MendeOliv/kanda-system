"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const ORDER_ITEMS = [
  { name: "Arroz Tio Lucas 5kg", qty: 1, price: "12.500 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtFPyE5OPVx1Ujm3iu0YO2Wq9zhgWIXMwAbwAPexeiJo7rT296LfaW_F8H7hdv6ivMXrYGM_fJCrbYXBt2WEj8wfiEF31gHLShsfBQggW6445smM4xhR9wCqLi4IaMsGnVka8atGieXF5Raml9FLyt0o2XBY4csw00C3zf9b9-tg11bBejrs-uCIqGOwg-atOXqz6pSRRnBHRns41yG-hPVjTZtk5F5G4aIK6sd8zwUxl6HNAMW2Xh" },
  { name: "Óleo Fula 1L", qty: 2, price: "6.400 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLj5_tv0UTG9A7-aWKoY9G2NfRui-TPOjJgIcDJJzIK70wATlH1Tb05wvH6eXMsNKwA3TfzW02u5g9nIfjXYIjjbdfgFzqrgQLGS0zIChWjAGp-n_dPs2UyL3aZA7scwXYXcgmRBROn_32AdiGiW8qSL3IgQZ6hivzicxT70W95cToaxhq55YEaLZwsCZi5d9gcVKMMl7IcU1Tq-dm4O4ofGTl_j9SmPHwFs1g72r5DqU9Y6KBlSlP" },
  { name: "Feijão Manteiga 1kg", qty: 1, price: "1.800 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4ReJR6o7NAVGku0yxKRqYHa0SOAK2EgUhYvlhXNsZWT9hUuo8qZnxcXy3pnKLAQRcezhRuF5yu6hJxFwhEbuvPJFPfjCzViB6RSH74OMF_rZFaNr8AL1rPW4ffJtl-H47mD6FtzfqlKYz9TLKt5GVUOAnOD6McwQP1nwIAbLyGBFye1lxV9oHENgoJBke0lWRoCHkLb7xV16jv9LvJjFNv1DTitdnbs3e9hku0UoUU03DBejlKGp3" },
];

export default function PedidoConfirmadoPage() {
  const { locale } = useParams();

  return (
    <main className="flex-grow w-full max-w-lg mx-auto px-container-margin py-xl flex flex-col gap-lg pb-xl">
      {/* Success Header */}
      <header className="flex flex-col items-center text-center gap-sm mt-md">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-xs animate-pulse-soft">
          <span className="material-symbols-outlined icon-filled text-[64px] text-primary">check_circle</span>
        </div>
        <h1 className="font-h1-mobile text-h1-mobile text-on-background">Pedido Confirmado!</h1>
        <p className="font-body-md text-body-md text-secondary">
          A sua encomenda está a ser preparada pelo nosso armazém em Kilamba.
        </p>
        <div className="mt-xs inline-flex items-center gap-xs bg-surface-variant px-sm py-base rounded-full">
          <span className="font-label-bold text-label-bold text-on-surface-variant">Pedido #KL-1234</span>
        </div>
      </header>

      {/* Order Summary Card */}
      <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-md flex flex-col gap-md border border-outline-variant/30">
        <h2 className="font-h3 text-h3 text-on-background border-b border-surface-variant pb-sm">Resumo do Pedido</h2>
        <div className="flex flex-col gap-md">
          {ORDER_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center gap-sm">
              <div className="w-16 h-16 rounded-lg bg-surface flex-shrink-0 overflow-hidden border border-outline-variant/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
              </div>
              <div className="flex-grow flex flex-col justify-center">
                <span className="font-label-bold text-label-bold text-on-background line-clamp-1">{item.name}</span>
                <span className="font-body-sm text-body-sm text-secondary">Qtd: {item.qty}</span>
              </div>
              <span className="font-label-bold text-label-bold text-on-background whitespace-nowrap">{item.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Totals Card */}
      <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-md flex flex-col gap-sm border border-outline-variant/30">
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-body-sm text-secondary">Subtotal</span>
          <span className="font-body-md text-body-md text-on-background">20.700 Kz</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-sm text-body-sm text-secondary">Taxa de Entrega</span>
          <span className="font-body-md text-body-md text-on-background">1.500 Kz</span>
        </div>
        <div className="h-[1px] bg-surface-variant w-full my-xs"></div>
        <div className="flex justify-between items-center">
          <span className="font-label-bold text-label-bold text-on-background">Total Geral</span>
          <span className="font-price-display text-price-display text-primary">22.200 Kz</span>
        </div>
      </section>

      {/* Delivery & Payment Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-md border border-outline-variant/30 flex flex-col gap-xs">
          <div className="flex items-center gap-xs text-secondary">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
            <h3 className="font-label-bold text-label-bold">Endereço de Entrega</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-background mt-xs">
            Rua Agostinho Neto,<br />
            Bloco B, Apt 12,<br />
            Centralidade do Kilamba
          </p>
        </section>
        <section className="bg-surface-container-lowest rounded-xl shadow-level-1 p-md border border-outline-variant/30 flex flex-col gap-xs">
          <div className="flex items-center gap-xs text-secondary">
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <h3 className="font-label-bold text-label-bold">Método de Pagamento</h3>
          </div>
          <div className="flex items-center gap-sm mt-xs">
            <div className="w-10 h-10 bg-surface-container rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">credit_card</span>
            </div>
            <div className="flex flex-col">
              <span className="font-body-sm text-body-sm text-on-background">Multicaixa Express</span>
              <span className="font-body-sm text-body-sm text-secondary text-[12px]">Pagamento Concluído</span>
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-sm mt-sm">
        <Link
          href={`/${locale}/perfil`}
          className="w-full h-[48px] bg-primary text-on-primary font-label-bold text-label-bold rounded-lg flex items-center justify-center hover:bg-on-primary-container transition-colors active:scale-95 duration-150"
        >
          Acompanhar Pedido
        </Link>
        <Link
          href={`/${locale}/mercado`}
          className="w-full h-[48px] bg-transparent text-primary font-label-bold text-label-bold rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors active:scale-95 duration-150"
        >
          Continuar Comprando
        </Link>
      </div>
    </main>
  );
}