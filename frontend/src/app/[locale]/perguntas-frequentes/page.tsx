"use client";

import Link from "next/link";
import { useState } from "react";

const FAQ_DATA = [
  {
    category: "Encomendas",
    items: [
      { q: "Como faço uma encomenda?", a: "Basta navegar pelo catálogo, adicionar os produtos ao carrinho e finalizar a compra. Pode pagar na entrega, via Multicaixa Express ou AppyPay." },
      { q: "Posso alterar uma encomenda depois de a fazer?", a: "Sim, desde que a encomenda ainda não tenha sido preparada. Contacte-nos via WhatsApp o mais rápido possível." },
      { q: "Como acompanho o estado da minha encomenda?", a: "Pode acompanhar o estado na página 'Meus Pedidos' do seu perfil, ou via link de rastreio enviado por SMS." },
    ],
  },
  {
    category: "Pagamentos",
    items: [
      { q: "Quais são os métodos de pagamento aceites?", a: "Aceitamos dinheiro na entrega, Multicaixa Express e pagamento via AppyPay." },
      { q: "O pagamento é seguro?", a: "Sim. Todos os pagamentos eletrónicos são processados por gateways certificados e nunca armazenamos os seus dados bancários." },
    ],
  },
  {
    category: "Entregas",
    items: [
      { q: "Em quanto tempo recebo a minha encomenda?", a: "Na Zona 1 (Kilamba) em até 2 horas com entrega Express, ou até 48 horas com entrega Standard em todas as zonas." },
      { q: "A partir de que valor tenho entrega grátis?", a: "Entregas grátis para compras acima de 10.000 Kz na Zona 1 (Kilamba e arredores próximos)." },
    ],
  },
  {
    category: "Devoluções",
    items: [
      { q: "Posso devolver um produto?", a: "Sim, tem 7 dias a partir da receção para solicitar a devolução de produtos não perecíveis. Consulte a nossa Política de Devoluções." },
      { q: "Quanto tempo demora o reembolso?", a: "O reembolso é processado em até 48 horas após a aprovação técnica do produto devolvido." },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-container-margin py-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-h1 text-h1 text-on-background">Como podemos ajudar?</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-sm">
          Encontre respostas rápidas para as perguntas mais frequentes sobre as suas compras na Kanda Mercearia.
        </p>
      </div>

      {/* Search */}
      <div className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-xl pr-md py-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors font-body-md flex items-center">
        <span className="material-symbols-outlined text-on-surface-variant/60 mr-sm">search</span>
        <input className="w-full bg-transparent border-none focus:ring-0" placeholder="Pesquisar por encomendas, pagamentos, etc..." type="text" />
      </div>

      {/* Category chips */}
      <div className="flex gap-sm overflow-x-auto hide-scrollbar">
        {["Todas", ...FAQ_DATA.map((d) => d.category)].map((c, i) => (
          <button
            key={c}
            onClick={() => setOpen(i === 0 ? 0 : FAQ_DATA.slice(0, i - 1).reduce((n, d) => n + d.items.length, 0))}
            className={`px-lg py-xs rounded-full shadow-sm whitespace-nowrap transition-colors ${
              i === 0 ? "bg-primary-container text-on-primary-container font-label-bold" : "bg-surface-container-lowest border border-outline-variant text-on-surface font-label-bold hover:bg-surface-container-low"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-lg">
        {FAQ_DATA.map((section, si) => (
          <section key={section.category}>
            <h2 className="font-h2 text-h2 text-on-background mb-xs">{section.category}</h2>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
              {section.items.map((item, ii) => {
                const idx = FAQ_DATA.slice(0, si).reduce((n, d) => n + d.items.length, 0) + ii;
                const isOpen = open === idx;
                return (
                  <div key={item.q} className={isOpen ? "accordion-item open" : "accordion-item"}>
                    <button
                      onClick={() => setOpen(isOpen ? null : idx)}
                      className="w-full text-left px-md py-sm flex justify-between items-center hover:bg-surface-container-low transition-colors font-h3 text-h3 text-on-surface"
                    >
                      {item.q}
                      <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </button>
                    <div className="accordion-content px-md text-on-surface-variant font-body-md border-t border-outline-variant/50">
                      <p className="py-sm">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 text-center">
        <h3 className="font-h2 text-h2 text-on-background">Ainda tem dúvidas?</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
          A nossa equipa está pronta para ajudar. Contacte-nos directamente.
        </p>
        <Link
          href="/contactos"
          className="mt-md inline-flex items-center gap-xs bg-primary text-on-primary font-label-bold px-lg py-sm rounded-lg h-[48px] shadow-sm hover:bg-primary-fixed-dim transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
          Contactar Apoio
        </Link>
      </div>
    </main>
  );
}