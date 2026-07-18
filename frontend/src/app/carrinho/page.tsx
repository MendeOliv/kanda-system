"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

function formatCurrency(amount: number) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " Kz";
}

export default function CarrinhoPage() {
  const { items, updateQty, removeItem, clearCart, subtotal } = useCart();

  const deliveryFee = 1500;
  const discount = 300;
  const total = subtotal + deliveryFee - discount;

  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg">
      <nav className="flex items-center gap-xs mb-md text-on-surface-variant font-label-sm text-label-sm">
        <Link href="/" className="hover:text-primary transition-colors">Início</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Carrinho de Compras</span>
      </nav>

      <h2 className="font-headline-xl text-headline-xl mb-xl text-on-background">O Seu Carrinho</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        <div className="lg:col-span-8 space-y-md">
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden">
            <div className="p-md bg-surface-container border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">Itens Selecionados ({items.length})</h3>
              {items.length > 0 && (
                <button type="button" onClick={() => clearCart()} className="text-error font-label-md text-label-md hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                  Limpar Tudo
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="p-xl text-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">shopping_cart</span>
                <p className="font-headline-md text-headline-md text-on-surface-variant">O seu carrinho está vazio</p>
                <Link href="/mercado" className="mt-4 inline-block bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md">Ver Produtos</Link>
              </div>
            ) : (
              <div className="divide-y divide-surface-container">
                {items.map((item) => (
                  <div key={item.id} className="p-md flex items-center gap-md group">
                    <div className="w-24 h-24 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden">
                      <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-headline-md text-headline-md text-on-surface truncate">{item.name}</h4>
                      <p className="text-on-surface-variant font-body-md text-body-md">{item.category}</p>
                      <div className="flex items-center gap-md mt-2">
                        <div className="flex items-center border border-outline rounded-lg px-2 py-1 bg-surface-container-lowest">
                          <button type="button" onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container transition-colors rounded-full">
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <span className="w-12 text-center font-bold text-on-surface">{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-surface-container transition-colors rounded-full">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-headline-md text-headline-md text-primary">{formatCurrency(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 sticky top-[100px]">
          <div className="bg-surface-container-lowest rounded-xl ambient-shadow p-md border border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Resumo do Pedido</h3>
            <div className="space-y-sm mb-md">
              <div className="flex justify-between text-on-surface-variant font-body-md text-body-md">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-body-md text-body-md">
                <span>Taxa de Entrega</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-secondary font-body-md text-body-md">
                <span>Descontos</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-outline-variant py-md mb-md">
              <div className="flex justify-between items-baseline">
                <span className="font-headline-md text-headline-md text-on-surface">Total</span>
                <span className="font-headline-xl text-headline-xl text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-primary-container text-on-primary-container font-headline-md text-headline-md py-4 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-md shadow-md"
            >
              Finalizar Compra
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
