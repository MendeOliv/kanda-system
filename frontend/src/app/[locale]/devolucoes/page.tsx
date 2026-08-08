const CARDS = [
  {
    icon: "calendar_month",
    iconBg: "bg-primary-container text-on-primary-container",
    title: "Prazo de 7 Dias",
    body: "Tem 7 dias a partir da data de receção para solicitar a devolução de qualquer produto não perecível, sem necessidade de justificação complexa.",
    span: "col-span-1",
  },
  {
    icon: "inventory_2",
    iconBg: "bg-secondary-container text-on-secondary-container",
    title: "Condições de Devolução",
    span: "lg:col-span-2",
    list: [
      "O artigo deve estar na embalagem original, intacta e não utilizada.",
      "Os selos de segurança ou garantias de higiene não podem ter sido quebrados.",
      "O recibo ou comprovativo de compra é obrigatório.",
      "Produtos frescos ou perecíveis não são elegíveis, salvo defeito de qualidade detetado no ato da entrega.",
    ],
  },
];

const STEPS = [
  { number: "1", title: "Solicitar", body: "Contacte-nos via WhatsApp ou App em 7 dias.", active: true },
  { number: "2", title: "Recolha", body: "O nosso estafeta recolhe no mesmo local da entrega.", active: false },
  { number: "3", title: "Reembolso", body: "Processado em até 48h após aprovação técnica.", active: false },
];

export default function DevolucoesPage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg flex flex-col gap-lg min-h-screen">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-md">Política de Devoluções</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Comprar na Kanda é simples e seguro. Se não ficar satisfeito, oferecemos um processo fácil e transparente.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {CARDS.map((card) => (
          <div key={card.title} className={`bg-surface-container-lowest rounded-lg p-lg ambient-shadow flex flex-col items-start gap-md ${card.span}`}>
            <div className={`${card.iconBg} p-sm rounded-full flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[32px]">{card.icon}</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{card.title}</h3>
              {card.body && <p className="font-body-md text-body-md text-on-surface-variant">{card.body}</p>}
              {card.list && (
                <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-lg space-y-xs">
                  {card.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-low rounded-xl p-lg md:p-lg mt-md">
        <h2 className="font-headline-md text-headline-md text-center text-on-surface mb-lg">Como Funciona o Processo</h2>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-lg md:gap-sm">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -translate-y-1/2 z-0" />
          {STEPS.map((step) => (
            <div key={step.title} className="relative z-10 flex flex-row md:flex-col items-center gap-md w-full md:w-1/3">
              <div
                className={`w-12 h-12 rounded-full font-headline-md text-headline-md flex items-center justify-center shadow-lg shrink-0 ${step.active ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface border-2 border-outline-variant"}`}
              >
                {step.number}
              </div>
              <div className="md:text-center">
                <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wide mb-xs">{step.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center justify-center py-lg gap-md text-center">
        <h2 className="font-headline-md text-headline-md text-on-surface">Precisa de ajuda com uma devolução?</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-sm">A nossa equipa de apoio ao cliente está pronta para o ajudar no processo, de forma rápida e simpática.</p>
        <a href="/contactos" className="bg-primary text-on-primary rounded-lg h-12 px-lg font-label-md text-label-md flex items-center gap-xs ambient-shadow hover:bg-on-primary-fixed-variant transition-colors active:scale-95">
          <span className="material-symbols-outlined">support_agent</span>
          Contactar Suporte
        </a>
      </section>
    </main>
  );
}
