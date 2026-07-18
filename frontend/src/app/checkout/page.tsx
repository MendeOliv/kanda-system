"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Pedido finalizado com sucesso!");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg">
      <nav className="flex items-center gap-xs font-label-md text-label-md text-outline mb-gutter">
        <Link href="/carrinho" className="hover:text-primary cursor-pointer transition-colors">Carrinho</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-bold">Finalizar Pedido</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <section className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-container">
            <div className="flex justify-between items-center mb-md">
              <div className="flex items-center gap-sm">
                <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Endereço de Entrega</h2>
              </div>
              <button type="button" className="text-primary font-label-md hover:underline">Adicionar Novo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <div className="p-md rounded-lg border-2 border-primary bg-primary-container/5 cursor-pointer relative">
                <div className="absolute top-4 right-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <p className="font-label-md text-primary mb-1">Principal</p>
                <h3 className="font-bold text-on-surface">Minha Casa</h3>
                <p className="font-body-md text-on-surface-variant mt-1">Rua Comandante Gika, Edifício 14</p>
                <p className="font-body-md text-on-surface-variant">Alvalade, Luanda</p>
                <p className="font-body-md text-on-surface-variant mt-2 font-medium">+244 923 000 000</p>
              </div>
              <div className="p-md rounded-lg border border-outline-variant hover:border-primary/50 transition-colors cursor-pointer">
                <p className="font-label-md text-on-surface-variant mb-1">Trabalho</p>
                <h3 className="font-bold text-on-surface">Escritório Kanda</h3>
                <p className="font-body-md text-on-surface-variant mt-1">Av. Talatona, Via S10</p>
                <p className="font-body-md text-on-surface-variant">Belas, Luanda</p>
                <p className="font-body-md text-on-surface-variant mt-2">+244 912 111 222</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-container">
            <div className="flex items-center gap-sm mb-md">
              <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Método de Pagamento</h2>
            </div>
            <div className="space-y-sm">
              {[
                { name: "Multicaixa Express", desc: "Pagamento seguro via telemóvel", icon: "payments" },
                { name: "Pagamento na Entrega", desc: "TPA ou Dinheiro (Apenas Luanda)", icon: "point_of_sale" },
                { name: "Transferência Bancária", desc: "Envie o comprovativo via WhatsApp", icon: "account_balance" },
              ].map((method, i) => (
                <label key={method.name} className={`flex items-center justify-between p-md rounded-lg border cursor-pointer ${i === 0 ? "border-primary bg-primary-container/5" : "border-outline-variant hover:border-primary/50 transition-colors"}`}>
                  <div className="flex items-center gap-md">
                    <input defaultChecked={i === 0} className="w-5 h-5 text-primary focus:ring-primary border-outline" name="payment" type="radio" />
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[32px] text-primary">{method.icon}</span>
                      <div>
                        <p className="font-bold text-on-surface">{method.name}</p>
                        <p className="font-label-sm text-on-surface-variant">{method.desc}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-container">
            <div className="flex items-center gap-sm mb-md">
              <span className="bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Opções de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <div className="p-md rounded-lg border-2 border-primary bg-primary-container/5 flex flex-col gap-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-on-surface">Entrega Padrão</h3>
                  <p className="font-bold text-primary">1.500 Kz</p>
                </div>
                <p className="font-body-md text-on-surface-variant">Entrega em até 24 horas úteis.</p>
                <div className="mt-2 flex items-center gap-xs text-primary font-label-md">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Previsão: Amanhã, 09:00 - 18:00</span>
                </div>
              </div>
              <div className="p-md rounded-lg border border-outline-variant hover:border-primary/50 transition-colors flex flex-col gap-xs cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-on-surface">Entrega Express</h3>
                  <p className="font-bold text-on-surface-variant">3.000 Kz</p>
                </div>
                <p className="font-body-md text-on-surface-variant">Entrega em até 2 horas úteis.</p>
                <div className="mt-2 flex items-center gap-xs text-on-surface-variant font-label-md">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Disponível agora</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 sticky top-[100px] flex flex-col gap-md">
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-md border border-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Resumo do Pedido</h2>
            <div className="space-y-sm mb-gutter">
              <div className="flex gap-sm">
                <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWs99wUf-Cc_D1lH2D_8xOdNiuHdJWsRYlyNbT0Bj2z1Yym1LtsszsZLDlow5yy79yLMa0AdTFCzWP7MYwQnNT1rM4-9uGFBx7GrhPCgCo4VCZevhT1tvFFw545BX-yO8peLWyV450bQ81Xm_SQa3cd7cpMzFFoFeHTcET4Nc_Dqq2GvCTVrRYMqcVk8c_mOVI13NoBE-0vG7wH5FLOBsl3H-fGduTAYBpDMNUKo56ypuXU4_v1WBx" alt="" />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <p className="font-bold text-on-surface line-clamp-1">Cesto de Legumes Frescos</p>
                  <p className="text-label-sm text-on-surface-variant">Qtd: 1 • 4.500 Kz</p>
                </div>
              </div>
              <div className="flex gap-sm">
                <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnpAu1Q5_QKLxvryXSvFSlOLzX-h0vIjvyTQ5tqndRyA_tXgmyBEV_dnJiqXZwanQmJ0pYNnBfb44AM-p1zGTZCz1Tx639NSR13gfsefUXWulwUYdmlpebFC4AiIddf4rOREKWnaPDIZiw_SPDvMQIexjif3vl4LUITgcmhMsar4cH_OgaZhCvcHTJ4DIjfrfrLcu7-0nlMcPBwjiloB4hXyAeUnfP9_neobUdpNjrwlq02HeAmq9O" alt="" />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <p className="font-bold text-on-surface line-clamp-1">Pão Caseiro (Pack 4)</p>
                  <p className="text-label-sm text-on-surface-variant">Qtd: 2 • 1.200 Kz</p>
                </div>
              </div>
            </div>
            <div className="space-y-sm border-t border-surface-container pt-md">
              <div className="flex justify-between font-body-md text-on-surface-variant"><span>Subtotal</span><span>6.900 Kz</span></div>
              <div className="flex justify-between font-body-md text-on-surface-variant"><span>Entrega</span><span>1.500 Kz</span></div>
              <div className="flex justify-between font-body-md text-on-surface-variant"><span>Taxas (IVA)</span><span>483 Kz</span></div>
              <div className="flex justify-between font-headline-md text-headline-md text-on-surface border-t border-surface-container pt-sm mt-sm">
                <span>Total</span>
                <span className="text-primary">8.883 Kz</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-gutter bg-primary text-on-primary py-md rounded-lg font-headline-md active:scale-95 transition-all shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "A processar..." : "Finalizar Compra"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
