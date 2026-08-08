const TABS = ["Meus Dados", "Minhas Moradas", "Meus Pedidos", "Definições"];

const PROFILE_FIELDS = [
  { label: "Nome Completo", value: "Ana Maria Silva" },
  { label: "Email", value: "ana.silva@exemplo.ao" },
  { label: "Telefone", value: "+244 923 456 789" },
  { label: "Data de Nascimento", value: "15 / 08 / 1990" },
];

export default function PerfilPage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg min-h-screen">
      <h2 className="font-headline-xl text-headline-xl text-on-surface mb-lg">Meu Perfil</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-4 space-y-lg">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-md">
              <div
                className="w-full h-full rounded-full border-4 border-surface-container-lowest shadow-sm bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXRjZQU12M_gLBPVwwX6pyIQ8ipIBuAEP02hs02EQK3e5WS0IjtfjCqI-z_3qYveQZelM094g5FCFV-hc-l-gbc5op2ENgbfa82JGHPO6Xn3sFTvmdDln4exYGbXVn2uQD15wHpSCwHZsrkGocwXNhSyMNFebbsiiAaaPfj9OP_KGlZ63uJugaKXT6Xt4fkgSWFW5YtxQFpoDMp8Ecgc19sqilWJB1Tb6B6qd7-LFxPiaMg0t0w2-m')",
                }}
              />
              <button type="button" className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-2 rounded-full shadow-md hover:bg-primary-fixed-dim transition-colors">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Ana Silva</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">Cliente VIP • Membro desde 2023</p>
            <button type="button" className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg shadow-sm hover:bg-on-primary-container transition-colors active:scale-[0.98]">
              Editar Perfil
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-lg">
          <div className="flex overflow-x-auto pb-sm gap-sm border-b border-outline-variant/50">
            {TABS.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={
                  index === 0
                    ? "px-md py-sm whitespace-nowrap border-b-2 border-primary text-primary font-label-md text-label-md"
                    : "px-md py-sm whitespace-nowrap border-b-2 border-transparent text-secondary hover:text-primary transition-colors font-body-md text-body-md"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
            <h4 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">person</span>
              Informações Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {PROFILE_FIELDS.map((field) => (
                <div key={field.label}>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-base">{field.label}</label>
                  <div className="p-sm bg-surface rounded-lg border border-outline-variant/50 font-body-md text-body-md text-on-surface">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
            <h4 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">lock</span>
              Segurança
            </h4>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface mb-1">Palavra-passe</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Última alteração: há 3 meses</p>
              </div>
              <button type="button" className="border border-primary text-primary font-label-md text-label-md py-xs px-md rounded-lg hover:bg-primary-container/10 transition-colors">
                Alterar Palavra-passe
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
