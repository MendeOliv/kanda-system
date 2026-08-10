import Link from "next/link";

const RIGHTS = [
  { icon: "visibility", title: "Acesso", desc: "Direito de solicitar cópia dos seus dados." },
  { icon: "edit", title: "Retificação", desc: "Direito de corrigir dados inexatos." },
  { icon: "delete", title: "Apagamento", desc: 'Direito ao "esquecimento" dos dados.' },
];

export default function PrivacidadePage() {
  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-container-margin py-xl flex flex-col gap-xl">
      <div className="text-center">
        <h1 className="font-h1 text-h1 text-primary">Política de Privacidade</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-sm">
          A sua privacidade é importante para nós. Explicamos aqui como recolhemos, utilizamos e protegemos os seus dados pessoais.
        </p>
        <div className="mt-md flex justify-center">
          <Link href="/" className="inline-flex items-center gap-xs bg-secondary text-on-secondary px-lg py-sm rounded-lg hover:bg-on-secondary-container transition-colors shadow-sm font-label-bold text-label-bold">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Voltar
          </Link>
        </div>
      </div>

      {/* Proteção de Dados */}
      <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex gap-md">
        <span className="material-symbols-outlined text-3xl text-primary shrink-0">security</span>
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-sm">Proteção de Dados</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Utilizamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </div>
      </section>

      {/* Dados Recolhidos */}
      <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex gap-md">
        <span className="material-symbols-outlined text-3xl text-primary shrink-0">database</span>
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-sm">Dados Recolhidos</h2>
          <ul className="font-body-md text-body-md text-on-surface-variant list-disc list-inside space-y-2">
            <li>Informações de contacto (nome, email, telefone).</li>
            <li>Dados de entrega (morada).</li>
            <li>Histórico de compras e preferências.</li>
          </ul>
        </div>
      </section>

      {/* Direitos */}
      <section>
        <h2 className="font-h2 text-h2 text-primary border-b border-outline-variant/30 pb-xs mb-md">Os Seus Direitos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {RIGHTS.map((r) => (
            <div key={r.title} className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
              <span className="material-symbols-outlined text-secondary mt-1" style={{ fontSize: "28px" }}>{r.icon}</span>
              <h3 className="font-label-bold text-label-bold text-on-surface">{r.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cookies */}
      <section className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
        <h2 className="font-h2 text-h2 text-primary mb-sm">Cookies e Rastreio</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar a sua experiência. Pode gerir as preferências de cookies no seu navegador a qualquer momento.
        </p>
      </section>

      {/* DPO */}
      <section className="bg-primary-fixed rounded-xl p-lg border border-primary-fixed-dim">
        <h2 className="font-h3 text-h3 text-on-primary-container">Contacto do Encarregado de Proteção de Dados (DPO)</h2>
        <p className="font-body-md text-body-md text-on-primary-container mt-sm">
          Para questões relacionadas com a proteção dos seus dados pessoais, contacte-nos.
        </p>
        <a className="mt-md inline-flex items-center gap-xs font-label-bold text-label-bold text-primary hover:underline" href="mailto:dpo@kandaluanda.ao">
          <span className="material-symbols-outlined text-primary">mail</span>
          dpo@kandaluanda.ao
        </a>
      </section>
    </main>
  );
}