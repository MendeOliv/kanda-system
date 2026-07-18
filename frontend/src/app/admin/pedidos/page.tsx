import Link from "next/link";

const STATS = [
  { icon: "pending_actions", label: "Pendentes", value: "124", color: "text-primary" },
  { icon: "local_shipping", label: "Em Trânsito", value: "45", color: "text-secondary" },
  { icon: "task_alt", label: "Concluídos", value: "1,082", color: "text-tertiary" },
  { icon: "monetization_on", label: "Receita Hoje", value: "450.000 Kz", color: "text-on-primary-container", highlight: true },
];

const ORDERS = [
  { id: "KD-9021", client: "Manuel Afonso", initials: "MA", time: "Hoje, 10:45", total: "12.500 Kz", status: "Em Preparação", statusStyle: "bg-primary-fixed text-on-primary-fixed-variant" },
  { id: "KD-9018", client: "Elena Santos", initials: "ES", time: "Hoje, 09:12", total: "24.800 Kz", status: "Enviado", statusStyle: "bg-secondary-container text-on-secondary-container" },
  { id: "KD-8995", client: "João Pedro", initials: "JP", time: "Ontem, 18:30", total: "8.250 Kz", status: "Entregue", statusStyle: "bg-surface-container text-on-surface-variant opacity-60" },
  { id: "KD-8992", client: "Bela Tati", initials: "BT", time: "Ontem, 17:15", total: "41.000 Kz", status: "Cancelado", statusStyle: "bg-error-container text-on-error-container" },
];

export default function AdminPedidosPage() {
  return (
    <>
      <header className="flex justify-between items-end gap-md mb-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-background mb-xs">Gestão de Pedidos</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Visualize e controle as transações em tempo real.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl">
        {STATS.map((stat) => (
          <div key={stat.label} className={`p-md rounded-xl border border-surface-container shadow-sm ${stat.highlight ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>
            <span className={`material-symbols-outlined mb-sm ${stat.highlight ? "text-on-primary-container" : stat.color}`}>{stat.icon}</span>
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">{stat.label}</p>
              <h3 className={`font-headline-md text-headline-md ${stat.highlight ? "text-on-primary-container" : "text-on-surface"}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-surface-container">
              <tr>
                <th className="px-md py-md font-label-md text-label-md text-on-surface-variant uppercase">ID Pedido</th>
                <th className="px-md py-md font-label-md text-label-md text-on-surface-variant uppercase">Cliente</th>
                <th className="px-md py-md font-label-md text-label-md text-on-surface-variant uppercase">Data & Hora</th>
                <th className="px-md py-md font-label-md text-label-md text-on-surface-variant uppercase">Total</th>
                <th className="px-md py-md font-label-md text-label-md text-on-surface-variant uppercase">Status</th>
                <th className="px-md py-md font-label-md text-label-md text-on-surface-variant uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-md py-md font-body-md text-body-md text-primary font-bold">
                    <Link href={`/admin/pedidos/${order.id.toLowerCase()}`}>#{order.id}</Link>
                  </td>
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-xs">{order.initials}</div>
                      <span className="font-body-md text-body-md text-on-surface">{order.client}</span>
                    </div>
                  </td>
                  <td className="px-md py-md font-body-md text-body-md text-on-surface-variant">{order.time}</td>
                  <td className="px-md py-md font-body-md text-body-md text-on-surface font-semibold">{order.total}</td>
                  <td className="px-md py-md">
                    <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm ${order.statusStyle}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-md py-md text-right">
                    <Link href={`/admin/pedidos/${order.id.toLowerCase()}`} className="material-symbols-outlined p-xs hover:bg-white rounded-full transition-colors text-outline">visibility</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
