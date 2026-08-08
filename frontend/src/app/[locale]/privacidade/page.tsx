const INFORMATIVE = [
  {
    icon: "security",
    title: "Proteção de Dados",
    body: "Implementamos medidas de segurança técnicas e organizativas para proteger os seus dados contra acesso não autorizado, alteração, divulgação ou destruição acidental.",
  },
  {
    icon: "database",
    title: "Dados Recolhidos",
    list: [
      "Informações de contacto (nome, email, telefone).",
      "Dados de entrega (morada).",
      "Histórico de compras e preferências.",
    ],
  },
];

const RIGHTS = [
  { icon: "visibility", title: "Acesso", body: "Direito de solicitar cópia dos seus dados." },
  { icon: "edit", title: "Retificação", body: "Direito de corrigir dados inexatos." },
  { icon: "delete", title: "Apagamento", body: "Direito ao 'esquecimento' dos dados." },
];

export default function PrivacidadePage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg flex flex-col gap-lg min-h-screen">
      <header className="text-center flex flex-col gap-sm pb-lg border-b border-outline-variant/30">
        <h1 className="font-headline-xl text-headline-xl text-primary">Política de Privacidade</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Na Kanda, valorizamos a sua confiança. Esta página explica como recolhemos, usamos e protegemos os seus dados pessoais.
        </p>
        <div className="mt-md">
          <button type="button" className="inline-flex items-center gap-xs bg-secondary text-on-secondary px-lg py-sm rounded-lg hover:bg-on-secondary-container transition-colors shadow-sm">
            <span className="material-symbols-outlined">download</span>
            <span className="font-label-md text-label-md">Download PDF</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {INFORMATIVE.map((item) => (
          <div key={item.title} className="bg-surface-container-lowest p-lg rounded-xl ambient-shadow border border-outline-variant/20 flex flex-col gap-md">
            <div className="flex items-center gap-sm text-primary">
              <span className="material-symbols-outlined text-3xl">{item.icon}</span>
              <h2 className="font-headline-md text-headline-md">{item.title}</h2>
            </div>
            {item.body && <p className="font-body-md text-body-md text-on-surface-variant">{item.body}</p>}
            {item.list && (
              <ul className="font-body-md text-body-md text-on-surface-variant list-disc list-inside space-y-2">
                {item.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="bg-surface-container p-lg rounded-xl flex flex-col gap-md">
        <h2 className="font-headline-md text-headline-md text-primary border-b border-outline-variant/30 pb-xs">Os Seus Direitos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mt-sm">
          {RIGHTS.map((right) => (
            <div key={right.title} className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary mt-1">{right.icon}</span>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface">{right.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{right.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="font-headline-md text-headline-md text-primary">Cookies e Rastreio</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Utilizamos cookies para melhorar a sua experiência, personalizar conteúdo e analisar o nosso tráfego. Pode gerir as suas preferências de cookies a qualquer momento nas definições do seu navegador.
        </p>
      </section>

      <section className="bg-primary-container/10 p-lg rounded-xl border border-primary-container/30 flex flex-col gap-md">
        <h2 className="font-headline-md text-headline-md text-on-primary-container">Contacto do Encarregado de Proteção de Dados (DPO)</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Se tiver dúvidas sobre esta política ou sobre como tratamos os seus dados, contacte o nosso DPO:
        </p>
        <div className="flex items-center gap-sm mt-xs">
          <span className="material-symbols-outlined text-primary">mail</span>
          <a className="font-label-md text-label-md text-primary hover:underline" href="mailto:dpo@kandaluanda.ao">dpo@kandaluanda.ao</a>
        </div>
      </section>
    </main>
  );
}