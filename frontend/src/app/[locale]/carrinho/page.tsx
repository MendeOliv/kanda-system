"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const formatKz = (n: number) => n.toLocaleString("pt-PT") + " Kz";

export default function CarrinhoPage() {
  const { locale } = useParams();
  const router = useRouter();
  const { items, count, updateQty, removeItem, subtotal, clearCart } = useCart();

  const deliveryFee = subtotal > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    clearCart();
    router.push(`/${locale}/pedido-confirmado`);
  };

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-xl relative">
      {/* Page Header */}
      <div className="mb-lg">
        <h1 className="font-h1 text-h1 text-on-surface">O Seu Carrinho</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-base">
          Revise os seus itens antes de finalizar a encomenda.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-xl gap-md bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl">
          <span className="material-symbols-outlined text-[64px] text-outline">shopping_cart</span>
          <h2 className="font-h2 text-h2 text-on-surface">O seu carrinho está vazio</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Explore a nossa seleção de produtos frescos e de qualidade.
          </p>
          <Link
            href={`/${locale}/mercado`}
            className="bg-primary text-on-primary font-label-bold h-12 px-xl rounded-lg flex items-center justify-center gap-xs hover:bg-surface-tint transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">local_mall</span>
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Left Column: Product List */}
          <div className="lg:col-span-8 flex flex-col gap-md">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-lg shadow-[0px_2px_8px_rgba(26,43,76,0.06)] border border-outline-variant/30 p-md flex flex-col sm:flex-row items-start sm:items-center gap-md group hover:shadow-[0px_8px_24px_rgba(26,43,76,0.08)] transition-shadow duration-300"
              >
                <div className="w-full sm:w-28 h-28 shrink-0 bg-surface-container rounded-lg overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 flex flex-col gap-base min-w-0">
                  <div className="flex justify-between items-start gap-sm">
                    <h3 className="font-h3 text-h3 text-on-surface truncate">{item.name}</h3>
                    <button
                      aria-label="Remover item"
                      onClick={() => removeItem(item.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container shrink-0"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary">Preço/Kg: {formatKz(item.price)}</p>
                  <div className="flex items-center justify-between mt-sm">
                    <span className="font-price-display text-price-display text-primary">{formatKz(item.price * item.qty)}</span>
                    <div className="flex items-center bg-surface border border-outline-variant rounded-full h-[36px] overflow-hidden">
                      <button
                        className="w-8 h-full flex items-center justify-center text-secondary hover:bg-surface-variant hover:text-primary transition-colors active:bg-surface-dim"
                        onClick={() => updateQty(item.id, -1)}
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <span className="w-10 text-center font-label-bold text-label-bold text-on-surface">{item.qty}</span>
                      <button
                        className="w-8 h-full flex items-center justify-center text-secondary hover:bg-surface-variant hover:text-primary transition-colors active:bg-surface-dim"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href={`/${locale}/mercado`}
              className="inline-flex items-center gap-xs text-primary font-label-bold text-label-bold hover:text-primary-fixed-dim transition-colors self-start"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Continuar a comprar
            </Link>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_8px_24px_rgba(26,43,76,0.06)] border border-outline-variant/40 p-lg lg:sticky lg:top-[100px] flex flex-col gap-md relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-fixed/20 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="font-h2 text-h2 text-on-surface mb-sm">Resumo do Pedido</h2>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Subtotal ({count} itens)</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">{formatKz(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Taxa de Entrega</span>
                  <span className="font-body-md text-body-md text-primary font-medium">{formatKz(deliveryFee)}</span>
                </div>
              </div>

              <hr className="border-outline-variant/40 my-xs" />

              <div className="flex justify-between items-end mb-sm">
                <span className="font-h3 text-h3 text-on-surface">Total</span>
                <div className="text-right">
                  <span className="font-body-sm text-body-sm text-secondary block mb-1">C/ IVA incluído</span>
                  <span className="font-h1 text-h1 text-primary">{formatKz(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-on-primary rounded-lg py-[16px] mt-md font-label-bold text-label-bold flex items-center justify-center gap-xs hover:bg-on-primary-fixed-variant hover:shadow-[0px_8px_24px_rgba(139,80,0,0.2)] transition-all active:scale-[0.98]"
              >
                Finalizar Encomenda
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <div className="flex items-center justify-center gap-sm mt-sm text-secondary opacity-80">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span className="font-body-sm text-body-sm">Pagamento Seguro</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}