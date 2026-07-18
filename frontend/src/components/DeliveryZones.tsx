import { MapPin, Building } from "lucide-react";

const ZONES = [
  {
    name: "KK5000",
    fee: "700 Kz",
    time: "2-4 horas",
    icon: Building,
    areas: "Toda a urbanização KK5000",
  },
  {
    name: "Kilamba",
    fee: "500 Kz",
    time: "2-4 horas",
    icon: MapPin,
    areas: "Toda a centralidade do Kilamba",
  },
];

export function DeliveryZones() {
  return (
    <section id="zonas" className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-primary">Zonas de Entrega</h2>
          <p className="mt-2 text-on-primary/80">
            Entregamos onde você está. Taxas acessíveis e entrega rápida.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {ZONES.map((zone) => (
            <div
              key={zone.name}
              className="rounded-2xl border border-surface/20 bg-surface/10 p-8 backdrop-blur"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface/20">
                <zone.icon className="h-7 w-7 text-on-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-primary">{zone.name}</h3>
              <p className="mt-1 text-sm text-on-primary/80">{zone.areas}</p>
              <div className="mt-6 flex items-center gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-on-primary/70">
                    Taxa
                  </p>
                  <p className="text-2xl font-bold text-on-primary">{zone.fee}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-on-primary/70">
                    Entrega
                  </p>
                  <p className="text-2xl font-bold text-on-primary">{zone.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
