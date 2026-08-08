const CARDS = [
  {
    icon: "flag",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
    title: "Missão",
    body: "Facilitar a vida das famílias angolanas através de um serviço de entrega rápido, fiável e com um toque humano inigualável.",
  },
  {
    icon: "visibility",
    iconBg: "bg-secondary-container/30",
    iconColor: "text-secondary",
    title: "Visão",
    body: "Ser a plataforma de comércio local líder em Luanda, reconhecida por conectar a comunidade à conveniência moderna.",
  },
  {
    icon: "favorite",
    iconBg: "bg-tertiary-container/30",
    iconColor: "text-tertiary",
    title: "Valores",
    body: null,
    values: ["Confiança", "Rapidez", "Comunidade"],
  },
];

const STATS = [
  { value: "5k+", label: "Clientes Felizes" },
  { value: "12k+", label: "Entregas" },
  { value: "24h", label: "Suporte" },
  { value: "100%", label: "Qualidade" },
];

export default function SobrePage() {
  return (
    <main className="min-h-screen">
      <section
        className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center bg-surface-container-highest"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80 mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMiabp0uMtPu4mWvQUM73VgydwLP5TpgN6_un7b3MCx32eA-2lbGcadCbUF4Bdki6YgshMO3SlnTAEZEBl_2b14xBvsvlbPrfegEPm4K4GW1fyoJKvQCqjsFtyhpGJEgpgjDJVos3h2slaHbBMRbN0WJKQyCTcmP-xjXVD1kv_q3iA1145RQIcfFFtvIXTNW2TrVu0kA8wsJbu9hD0UjkspJhG18douRKYG8XTM9r8LWqzNST-n6f')",
          }}
        />
        <div className="relative z-10 text-center px-gutter max-w-3xl mx-auto">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-md">Nossa História</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            O seu vizinho de confiança, enraizado no coração de Kilamba, entregando qualidade e hospitalidade angolana à sua porta.
          </p>
        </div>
      </section>

      <section className="py-lg px-gutter max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-surface-container-lowest rounded-xl ambient-shadow p-lg flex flex-col h-full border border-outline-variant/30">
              <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center mb-md`}>
                <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">{card.title}</h3>
              {card.body && <p className="font-body-md text-body-md text-on-surface-variant flex-grow">{card.body}</p>}
              {card.values && (
                <ul className="font-body-md text-body-md text-on-surface-variant space-y-2 flex-grow">
                  {card.values.map((v) => (
                    <li key={v} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">check_circle</span>{v}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="py-lg px-gutter max-w-container-max mx-auto relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-low mb-lg">
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-lg text-center py-lg">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-headline-lg text-headline-lg text-primary">{stat.value}</p>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}