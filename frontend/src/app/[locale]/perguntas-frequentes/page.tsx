"use client";

import { useState } from "react";

const CATEGORIES = ["Todas", "Encomendas", "Pagamentos", "Entregas", "Devoluções"];

const FAQ = [
  {
    category: "Encomendas",
    question: "Como faço para cancelar uma encomenda?",
    answer:
      "Para cancelar uma encomenda, vá à secção 'Minhas Encomendas' na sua conta, seleccione a encomenda desejada e clique em 'Cancelar'. Note que o cancelamento só é possível antes da encomenda entrar em preparação para envio.",
  },
  {
    category: "Encomendas",
    question: "Posso alterar os itens da minha encomenda depois de paga?",
    answer:
      "Após o pagamento ser confirmado, não é possível adicionar ou remover itens directamente. Recomendamos cancelar a encomenda (se aplicável) e fazer uma nova, ou contactar o nosso suporte rapidamente.",
  },
  {
    category: "Pagamentos",
    question: "Quais são os métodos de pagamento aceites?",
    answer:
      "Aceitamos Multicaixa Express, Transferência Bancária directa e pagamentos via cartão de débito/crédito na entrega (sujeito à disponibilidade do terminal).",
  },
  {
    category: "Entregas",
    question: "Qual é a área de cobertura das entregas?",
    answer:
      "Actualmente fazemos entregas em toda a zona do Kilamba, KK5000, Camama e Talatona. Consulte a página de áreas de entrega para detalhes específicos sobre taxas.",
  },
];

export default function PerguntasFrequentesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filtered =
    activeCategory === "Todas"
      ? FAQ
      : FAQ.filter((item) => item.category === activeCategory);

  const categories = [...new Set(filtered.map((item) => item.category))];

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg flex flex-col gap-lg min-h-screen">
      <section className="text-center flex flex-col items-center gap-md">
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Como podemos ajudar?</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Encontre respostas rápidas para as perguntas mais frequentes sobre as suas compras na Kanda.
        </p>
        <div className="relative w-full max-w-xl mt-sm shadow-sm rounded-lg overflow-hidden">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Pesquisar por encomendas, pagamentos, etc..."
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg pl-xl pr-md py-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md placeholder:text-on-surface-variant/60"
          />
        </div>
      </section>

      <nav className="flex flex-wrap justify-center gap-sm mt-lg">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={
              activeCategory === category
                ? "bg-primary-container text-on-primary-container font-label-md px-lg py-xs rounded-full shadow-sm hover:opacity-90 transition-opacity"
                : "bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md px-lg py-xs rounded-full shadow-sm hover:bg-surface-container-low transition-colors"
            }
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="w-full flex flex-col gap-lg">
        {categories.map((category) => (
          <div key={category} className="flex flex-col gap-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">{category}</h2>
            {filtered
              .filter((item) => item.category === category)
              .map((item) => {
                const index = FAQ.indexOf(item);
                return (
                  <div key={item.question} className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggle(index)}
                      className="w-full text-left px-md py-sm flex justify-between items-center hover:bg-surface-container-low transition-colors font-headline-md text-headline-md text-on-surface"
                    >
                      {item.question}
                      <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${openIndex === index ? "rotate-180" : ""}`}>
                        expand_more
                      </span>
                    </button>
                    {openIndex === index && (
                      <div className="px-md py-md text-on-surface-variant font-body-md border-t border-outline-variant/50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </section>

      <section className="mt-lg p-lg bg-surface-container-low rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col gap-xs z-10 text-center md:text-left">
          <h3 className="font-headline-md text-headline-md text-on-surface">Ainda tem dúvidas?</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">A nossa equipa está pronta para ajudar. Contacte-nos directamente.</p>
        </div>
        <a href="/contactos" className="z-10 bg-primary text-on-primary font-label-md px-lg py-sm rounded-lg h-12 flex items-center justify-center gap-xs shadow-sm hover:bg-primary-fixed-dim transition-colors w-full md:w-auto shrink-0">
          <span className="material-symbols-outlined">support_agent</span>
          Fale Connosco
        </a>
      </section>
    </main>
  );
}
