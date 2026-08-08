const DELIVERY_OPTIONS = [
  {
    icon: "local_shipping",
    iconFrom: "bg-primary-container/20 text-primary",
    title: "Entrega Standard",
    body: "A nossa opção económica para as suas compras do dia-a-dia. Planeie com antecedência e receba as suas compras confortavelmente.",
    timeIcon: "schedule",
    time: "Até 48 horas",
    price: "Desde 1.500 Kz",
    featured: false,
  },
  {
    icon: "bolt",
    iconFrom: "bg-primary/10 text-primary",
    title: "Entrega Express",
    body: "Precisa urgente? Nós tratamos. Prioridade máxima na preparação e envio da sua encomenda diretamente para a sua porta.",
    timeIcon: "timer",
    time: "Até 2 horas (Kilamba)",
    price: "Desde 3.000 Kz",
    featured: true,
  },
];

const ZONES = [
  { zone: "Zona 1", areas: "Centralidade do Kilamba, KK5000, Vila Flor", standard: "1.500 Kz", express: "3.000 Kz" },
  { zone: "Zona 2", areas: "Talatona, Camama, Nova Vida, Benfica", standard: "2.500 Kz", express: "4.500 Kz" },
  { zone: "Zona 3", areas: "Mutamba, Maculusso, Alvalade, Ingombota", standard: "3.500 Kz", express: "Não Disponível" },
  { zone: "Zona 4", areas: "Viana, Cacuaco, Cazenga", standard: "4.500 Kz", express: "Não Disponível" },
];

const SUPPORT = [
  { icon: "my_location", title: "Rastreio em Tempo Real", body: "Acompanhe a sua encomenda desde a nossa loja até à sua porta, diretamente na app ou site." },
  { icon: "support_agent", title: "Apoio ao Cliente", body: "Dúvidas sobre a sua entrega? A nossa equipa está pronta para ajudar via WhatsApp ou chamada." },
];

export default function EntregasPage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg flex flex-col gap-lg min-h-screen">
      <section className="text-center md:text-left max-w-3xl">
        <h1 className="font-headline-xl text-headline-xl text-primary mb-md">Política de Entregas</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Rápidas, seguras e de confiança. Saiba tudo sobre como os seus produtos chegam até si, com a qualidade que o seu vizinho de confiança garante.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-md">
          {DELIVERY_OPTIONS.map((option) => (
            <div
              key={option.title}
              className={`bg-surface-container-lowest rounded-lg p-lg ambient-shadow flex flex-col justify-between ${option.featured ? "border-2 border-primary/20 relative overflow-hidden" : "border border-outline-variant/30"}`}
            >
              {option.featured && (
                <div className="absolute top-0 right-0 bg-primary-container text-on-primary-container font-label-md text-label-md px-sm py-xs rounded-bl-lg">
                  Recomendado
                </div>
              )}
              <div>
                <div className={`w-12 h-12 ${option.iconFrom} rounded-full flex items-center justify-center mb-sm`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{option.icon}</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">{option.title}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">{option.body}</p>
              </div>
              <div>
                <div className="flex items-center gap-xs font-label-md text-label-md text-on-surface mb-base">
                  <span className="material-symbols-outlined text-[20px]">{option.timeIcon}</span> {option.time}
                </div>
                <div className="font-headline-md text-headline-md text-primary">{option.price}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-4 bg-primary rounded-lg p-lg ambient-shadow text-on-primary flex flex-col justify-center items-center text-center relative overflow-hidden">
          <span className="material-symbols-outlined text-[48px] mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
          <h3 className="font-headline-md text-headline-md mb-xs">Entregas Grátis</h3>
          <p className="font-body-md text-body-md mb-md">Para compras superiores a</p>
          <div className="font-headline-xl text-headline-xl font-bold mb-md">25.000 Kz</div>
          <p className="font-body-md text-body-md opacity-90">*Válido apenas para a Zona 1 (Kilamba e arredores próximos).</p>
        </div>

        <div className="md:col-span-12 bg-surface-container-lowest rounded-lg ambient-shadow overflow-hidden border border-outline-variant/30 mt-sm">
          <div className="p-lg border-b border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">map</span>
              Zonas e Tarifas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/50">
                  <th className="p-md font-label-md text-label-md text-on-surface-variant">Zona</th>
                  <th className="p-md font-label-md text-label-md text-on-surface-variant">Áreas Abrangidas</th>
                  <th className="p-md font-label-md text-label-md text-on-surface-variant">Standard</th>
                  <th className="p-md font-label-md text-label-md text-on-surface-variant">Express</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md text-on-surface">
                {ZONES.map((row) => (
                  <tr key={row.zone} className="border-b border-outline-variant/20 hover:bg-surface-container/50 transition-colors">
                    <td className="p-md font-bold">{row.zone}</td>
                    <td className="p-md">{row.areas}</td>
                    <td className="p-md">{row.standard}</td>
                    <td className="p-md">{row.express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-lg mt-sm">
          {SUPPORT.map((item) => (
            <div key={item.title} className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-base">{item.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}