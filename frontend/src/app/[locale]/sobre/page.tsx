import Link from "next/link";

const VALUES = ["Confiança", "Rapidez", "Comunidade"];

const STATS = [
  { value: "5k+", label: "Clientes Felizes" },
  { value: "12k+", label: "Entregas" },
  { value: "24h", label: "Suporte" },
  { value: "100%", label: "Qualidade" },
];

export default function SobrePage() {
  return (
    <main className="flex-grow">
      <section className="w-full max-w-7xl mx-auto px-container-margin py-xl flex flex-col gap-xl">
        {/* Header */}
        <div className="text-center space-y-sm">
          <h1 className="font-h1 text-h1 md:text-5xl text-on-surface mb-md">Nossa História</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            O seu vizinho de confiança, enraizado no coração de Kilamba, entregando qualidade e hospitalidade angolana à sua porta.
          </p>
        </div>

        {/* Mission / Vision / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
            <span className="material-symbols-outlined text-primary text-[40px]">flag</span>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">Missão</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Facilitar a vida das famílias angolanas através de um serviço de entrega rápido, fiável e com um toque humano inigualável.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
            <span className="material-symbols-outlined text-secondary text-[40px]">visibility</span>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">Visão</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Ser a plataforma de comércio local líder em Luanda, reconhecida por conectar a comunidade à conveniência moderna.
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col gap-sm">
            <span className="material-symbols-outlined text-tertiary text-[40px]">favorite</span>
            <h3 className="font-h3 text-h3 text-on-surface mb-sm">Valores</h3>
            <ul className="font-body-md text-body-md text-on-surface-variant space-y-2 flex-grow">
              {VALUES.map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-primary">check_circle</span> {v}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-h1 text-h1 text-primary">{s.value}</p>
              <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mt-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-sm justify-center pt-md">
          <Link
            href="/mercado"
            className="bg-primary text-on-primary font-label-bold h-12 px-xl rounded-lg flex items-center justify-center gap-xs hover:bg-surface-tint transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">local_mall</span>
            Ver Produtos
          </Link>
          <Link
            href="/contactos"
            className="bg-primary-container text-on-primary-container font-label-bold h-12 px-xl rounded-lg flex items-center justify-center gap-xs hover:bg-primary-fixed-dim transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
            Fale Connosco
          </Link>
        </div>
      </section>
    </main>
  );
}