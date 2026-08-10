import Link from "next/link";

const ZONES = [
  { zone: "Zona 1", area: "Kilamba e arredores", fee: "1.500 Kz", grátis: "A partir de 10.000 Kz" },
  { zone: "Zona 2", area: "KK5000 e Talatona", fee: "2.500 Kz", grátis: "A partir de 15.000 Kz" },
  { zone: "Zona 3", area: "Outras zonas de Luanda", fee: "4.000 Kz", grátis: "A partir de 25.000 Kz" },
];

export default function EntregasPage() {
  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="md:text-center">
        <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-primary mb-md">Política de Entregas</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Rápidas, seguras e de confiança. Saiba tudo sobre como os seus produtos chegam até si, com a qualidade que o seu vizinho de confiança garante.
        </p>
      </div>

      {/* Delivery types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
          <h2 className="font-h3 text-h3 text-on-surface mb-sm">Entrega Standard</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
            A nossa opção económica para as suas compras do dia-a-dia. Planeie com antecedência e receba as suas compras confortavelmente.
          </p>
          <span className="inline-flex items-center gap-xs bg-surface-container px-sm py-xs rounded-full font-label-bold text-label-bold text-on-surface">
            <span className="material-symbols-outlined text-[20px]">schedule</span> Até 48 horas
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
          <h2 className="font-h3 text-h3 text-on-surface mb-sm">Entrega Express</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
            Precisa urgente? Nós tratamos. Prioridade máxima na preparação e envio da sua encomenda diretamente para a sua porta.
          </p>
          <span className="inline-flex items-center gap-xs bg-primary-container text-on-primary-container px-sm py-xs rounded-full font-label-bold text-label-bold">
            <span className="material-symbols-outlined text-[20px]">timer</span> Até 2 horas (Kilamba)
          </span>
        </div>
      </div>

      {/* Free delivery banner */}
      <div className="bg-primary rounded-xl p-lg flex flex-col md:flex-row items-center gap-md shadow-sm">
        <span className="material-symbols-outlined text-[48px] text-white mb-sm">redeem</span>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-h2 text-h2 text-white mb-xs">Entregas Grátis</h3>
          <p className="font-body-md text-body-md text-white/90 mb-md">Para compras superiores a <strong>10.000 Kz</strong></p>
          <p className="font-body-sm text-body-sm text-white/70">*Válido apenas para a Zona 1 (Kilamba e arredores próximos).</p>
        </div>
      </div>

      {/* Zones table */}
      <section>
        <h2 className="font-h3 text-h3 text-on-surface flex items-center gap-sm mb-md">
          <span className="material-symbols-outlined text-primary">map</span>
          Zonas de Entrega e Taxas
        </h2>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container text-secondary font-label-bold border-b border-outline-variant/50">
                <th className="p-md font-label-bold">Zona</th>
                <th className="p-md font-label-bold">Área de Cobertura</th>
                <th className="p-md font-label-bold">Taxa</th>
                <th className="p-md font-label-bold">Entrega Grátis</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {ZONES.map((z) => (
                <tr key={z.zone} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                  <td className="p-md font-label-bold">{z.zone}</td>
                  <td className="p-md text-on-surface-variant">{z.area}</td>
                  <td className="p-md">{z.fee}</td>
                  <td className="p-md text-primary font-medium">{z.grátis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Extra features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
          <div className="flex items-center gap-xs text-primary">
            <span className="material-symbols-outlined text-[28px]">my_location</span>
          </div>
          <h3 className="font-label-bold text-label-bold text-on-surface mb-base">Rastreio em Tempo Real</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Acompanhe a sua encomenda desde a nossa loja até à sua porta, diretamente na app ou site.</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
          <div className="flex items-center gap-xs text-primary">
            <span className="material-symbols-outlined text-[28px]">support_agent</span>
          </div>
          <h3 className="font-label-bold text-label-bold text-on-surface mb-base">Apoio ao Cliente</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Dúvidas sobre a sua entrega? A nossa equipa está pronta para ajudar via WhatsApp ou chamada.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-sm justify-center pt-md">
        <Link href="/mercado" className="bg-primary text-on-primary font-label-bold h-12 px-xl rounded-lg flex items-center justify-center gap-xs hover:bg-surface-tint transition-colors">
          <span className="material-symbols-outlined text-[20px]">local_mall</span>
          Começar a Comprar
        </Link>
        <Link href="/perguntas-frequentes" className="bg-primary-container text-on-primary-container font-label-bold h-12 px-xl rounded-lg flex items-center justify-center gap-xs hover:bg-primary-fixed-dim transition-colors">
          <span className="material-symbols-outlined text-[20px]">help</span>
          Ver FAQ
        </Link>
      </div>
    </main>
  );
}