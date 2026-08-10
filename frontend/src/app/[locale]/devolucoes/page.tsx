import Link from "next/link";

const STEPS = [
  { num: 1, title: "Solicitar", desc: "Contacte-nos via WhatsApp ou App em 7 dias." },
  { num: 2, title: "Recolha", desc: "O nosso estafeta recolhe no mesmo local da entrega." },
  { num: 3, title: "Reembolso", desc: "Processado em até 48h após aprovação técnica." },
];

export default function DevolucoesPage() {
  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-xl md:py-[48px] flex flex-col gap-xl">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-primary mb-md">Política de Devoluções</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Comprar na Kanda Luanda é simples e seguro. Se não ficar satisfeito, oferecemos um processo fácil e transparente.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
          <span className="material-symbols-outlined text-[32px] text-primary">calendar_month</span>
          <h3 className="font-h3 text-h3 text-on-background mb-xs">Prazo de 7 Dias</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Tem 7 dias a partir da data de receção para solicitar a devolução de qualquer produto não perecível, sem necessidade de justificação complexa.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
          <span className="material-symbols-outlined text-[32px] text-primary">inventory_2</span>
          <h3 className="font-h3 text-h3 text-on-background mb-xs">Condições de Devolução</h3>
          <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-lg space-y-xs">
            <li>O artigo deve estar na embalagem original, intacta e não utilizada.</li>
            <li>Os selos de segurança ou garantias de higiene não podem ter sido quebrados.</li>
            <li>O recibo ou comprovativo de compra é obrigatório.</li>
            <li>Produtos frescos ou perecíveis não são elegíveis, salvo defeito de qualidade detetado no ato da entrega.</li>
          </ul>
        </div>
      </div>

      {/* Process */}
      <section>
        <h2 className="font-h2 text-h2 text-center text-on-background mb-xl">Como Funciona o Processo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {STEPS.map((s) => (
            <div key={s.num} className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col items-start gap-sm">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-h2 text-h2 shrink-0 ${
                s.num === 1 ? "bg-primary text-on-primary shadow-[0px_8px_24px_rgba(26,43,76,0.12)]" : "bg-surface-container-highest text-on-surface border-2 border-outline-variant"
              }`}>
                {s.num}
              </div>
              <h3 className="font-label-bold text-label-bold text-on-background uppercase tracking-wide mb-xs">{s.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center mt-md">
        <h2 className="font-h3 text-h3 text-on-background">Precisa de ajuda com uma devolução?</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto mb-sm">
          A nossa equipa de apoio ao cliente está pronta para o ajudar no processo, de forma rápida e simpática.
        </p>
        <Link
          href="/contactos"
          className="inline-flex items-center gap-xs bg-primary text-on-primary rounded-lg h-[48px] px-xl font-label-bold text-label-bold shadow-[0px_2px_8px_rgba(26,43,76,0.06)] hover:bg-on-primary-fixed-variant transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">support_agent</span>
          Contactar Apoio
        </Link>
      </section>
    </main>
  );
}