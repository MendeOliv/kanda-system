const CONTACT_INFO = [
  {
    icon: "call",
    label: "Telefone",
    value: "+244 923 123 456",
    span: false,
  },
  {
    icon: "mail",
    label: "E-mail",
    value: "geral@kandamercearia.ao",
    span: false,
  },
  {
    icon: "location_city",
    label: "Endereço Físico",
    value: (
      <>
        Rua Principal, Bloco 4, Loja 12
        <br />
        Centralidade do Kilamba, Luanda
      </>
    ),
    span: true,
  },
  {
    icon: "schedule",
    label: "Horário de Funcionamento",
    value: (
      <>
        Segunda a Sábado: 08:00 - 20:00
        <br />
        Domingos e Feriados: 08:00 - 14:00
      </>
    ),
    span: true,
  },
];

export default function ContactosPage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg flex flex-col gap-lg min-h-screen">
      <div className="text-center space-y-sm">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Fale Connosco</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Estamos aqui para ajudar. Preencha o formulário ou visite a nossa loja em Kilamba.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface-container-lowest rounded-xl p-lg flex flex-col gap-md ambient-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Envie uma Mensagem</h2>
          <form className="flex flex-col gap-md">
            <div className="flex flex-col gap-base">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="name">Nome Completo</label>
              <input
                id="name"
                type="text"
                placeholder="O seu nome"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-base">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="O seu e-mail"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-base">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="phone">Telefone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="O seu telefone"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                />
              </div>
            </div>
            <div className="flex flex-col gap-base">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="subject">Assunto</label>
              <select
                id="subject"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
              >
                <option>Dúvida sobre produto</option>
                <option>Reclamação</option>
                <option>Parceria</option>
                <option>Outros</option>
              </select>
            </div>
            <div className="flex flex-col gap-base">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="message">Mensagem</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Escreva aqui a sua mensagem..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
              />
            </div>
            <button
              type="button"
              className="mt-xs bg-primary text-on-primary font-label-md text-label-md h-12 rounded-lg flex items-center justify-center gap-xs hover:bg-surface-tint transition-colors active:scale-95"
            >
              <span>Enviar Mensagem</span>
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {CONTACT_INFO.map((item) => (
              <div
                key={item.label}
                className={`bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col gap-sm ${item.span ? "md:col-span-2" : ""}`}
              >
                <div className="bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center mb-xs">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface">{item.label}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-sm border border-surface-variant bg-surface-container">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYC_P9f3wd1RiSTXkeJ1xplfp2VmrG1-JTb9jIcrE1MGAQn7x_P9zYUCJTXsL2lUH6C1rC2qm9mezlbz05MR0gdoefZSmrerACzrCrlZ3vQr4ishjoKAgHVsXiKyNUCeutjInnP75zne1OPOfDsA4LRes4sKRiPkvcXfinAp5xsTreWFlPtKwQVGAfQ3e4ALKPaxlUEUTtp9ziKETv8zd2aHOS3n80JHlY9IiGd88S7YDTu0oa44Gw')",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-primary text-on-primary p-xs rounded-full shadow-lg">
                <span className="material-symbols-outlined text-[32px]">storefront</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-md">
            <p className="font-label-md text-label-md text-on-surface-variant mr-sm">Siga-nos:</p>
            <button type="button" className="bg-surface-container-low p-xs rounded-full text-secondary hover:bg-surface-container-high hover:text-primary transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button type="button" className="bg-surface-container-low p-xs rounded-full text-secondary hover:bg-surface-container-high hover:text-primary transition-colors">
              <span className="material-symbols-outlined">forum</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
