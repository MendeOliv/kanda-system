import Link from "next/link";

const ORDERS = [
  { id: "KL-9402", date: "Hoje", day: "Hoje", status: "A caminho", statusType: "active", total: "42,50 Kz", items: 12, title: "Cesto Fresco Familiar", desc: "Pão de Mafra (2), Leite Mimosa (4), Ovos Caseiros (12), Fruta da Época, Café Angola...", link: "/pedidos/kl-9402" },
  { id: "KL-8821", date: "14 Out 2023", day: "Sábado", status: "Entregue com sucesso", statusType: "delivered", total: "15,700 Kz", items: 8, title: "Kit Churrasco Fim-de-Semana", desc: "Carne de Novilho, Carvão Vegetal, Salada Mista, Cerveja Cuca (12)...", link: "#" },
  { id: "KL-7540", date: "05 Out 2023", day: "Quinta", status: "Entregue com sucesso", statusType: "delivered", total: "8,400 Kz", items: 6, title: "Essenciais Diários", desc: "Arroz, Feijão, Óleo, Detergente da Loiça, Papel Higiénico...", link: "#" },
  { id: "KL-6211", date: "28 Set 2023", day: "Quinta", status: "Pedido Cancelado", statusType: "cancelled", total: "1,200 Kz", items: 1, title: "Mercearia Semanal", desc: "Sacos de compras personalizados (2)...", link: "#" },
];

export default function PedidosPage() {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="font-label-sm text-label-sm">A minha conta</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-label-sm text-label-sm font-bold text-primary">Histórico de Pedidos</span>
          </nav>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Os Meus Pedidos</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md">
        {ORDERS.map((order) => (
          <Link
            key={order.id}
            href={order.link}
            className={`bg-white border rounded-xl p-md ambient-shadow flex flex-col md:flex-row gap-lg items-center relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
              order.statusType === "cancelled" ? "border-outline-variant/30 bg-surface-container/30 opacity-70" : "border-outline-variant"
            }`}
          >
            {order.statusType === "active" && (
              <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container px-6 py-2 rounded-bl-xl font-label-md text-label-md flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                {order.status}
              </div>
            )}
            <div className="w-full md:w-1/4">
              <div className={`rounded-lg p-base flex flex-col items-center justify-center text-center ${order.statusType === "cancelled" ? "bg-surface-container-low" : "bg-surface-container"}`}>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">{order.date}</span>
                <span className="font-headline-md text-headline-md text-on-surface">{order.day}</span>
                <span className="font-label-md text-label-md text-primary">ID #{order.id}</span>
              </div>
            </div>
            <div className="flex-grow">
              {order.statusType === "delivered" && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
                  <span className="font-label-md text-label-md text-green-700">Entregue com sucesso</span>
                </div>
              )}
              {order.statusType === "cancelled" && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-error text-base">cancel</span>
                  <span className="font-label-md text-label-md text-error">Pedido Cancelado</span>
                </div>
              )}
              <h3 className="font-headline-md text-headline-md mb-1">{order.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{order.desc}</p>
              <div className="mt-4 flex items-center gap-md">
                <span className="font-headline-lg text-headline-lg text-on-surface">{order.total}</span>
                <span className="text-on-surface-variant font-label-md text-label-md">• {order.items} itens</span>
              </div>
            </div>
            <div className="flex flex-col gap-sm w-full md:w-auto">
              {order.statusType === "active" && (
                <span className="bg-primary text-white font-label-md px-8 py-3 rounded-lg text-center font-bold uppercase tracking-wide shadow-md">
                  Rastrear Pedido
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
