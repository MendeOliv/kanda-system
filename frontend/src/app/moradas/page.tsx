import Link from "next/link";

const ADDRESSES = [
  { label: "Casa", neighborhood: "Kilamba", icon: "home", badge: "Principal", address: "Edifício Q24, Apartamento 302, Bloco B", note: "Próximo ao Kero Kilamba, entrada pela via principal." },
  { label: "Trabalho", neighborhood: "Talatona", icon: "work", badge: null, address: "Condomínio Belas Business Park, Torre Luanda, Piso 5", note: "Entregar na recepção principal." },
  { label: "Casa de Férias", neighborhood: "Ilha do Cabo", icon: "beach_access", badge: null, address: "Avenida Murtala Mohammed, Casa nº 142", note: "Depois do restaurante Lookal, portão azul." },
];

export default function MoradasPage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-4">
            <span className="font-label-sm text-label-sm">A Minha Conta</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-label-sm text-label-sm text-primary font-bold">Gerir Moradas</span>
          </nav>
          <h2 className="font-headline-xl text-headline-xl text-on-background">As Minhas Moradas</h2>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md active:scale-95 transition-all ambient-shadow hover:bg-surface-tint">
          <span className="material-symbols-outlined">add_location_alt</span>
          Adicionar Nova Morada
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {ADDRESSES.map((addr) => (
          <div key={addr.label} className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container-highest/50 hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{addr.icon}</span>
                </div>
                {addr.badge && (
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm">{addr.badge}</span>
                )}
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background mb-1">{addr.label}</h3>
              <p className="font-label-md text-label-md text-primary mb-4">{addr.neighborhood}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant mt-1 text-[20px]">location_on</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">{addr.address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant mt-1 text-[20px]">info</span>
                  <p className="font-body-md text-body-md text-on-surface-variant italic">{addr.note}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-surface-container-highest/30">
              <button className="flex-1 py-2 flex items-center justify-center gap-2 text-on-surface-variant font-label-md hover:bg-surface-container-low rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Editar
              </button>
              <button className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        ))}

        <button className="bg-surface-container/50 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 hover:bg-surface-container hover:border-primary transition-all group min-h-[320px]">
          <div className="h-16 w-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-outline text-[32px] group-hover:text-primary">add</span>
          </div>
          <p className="font-headline-md text-headline-md text-on-surface-variant group-hover:text-primary">Nova Morada</p>
        </button>
      </div>
    </main>
  );
}
