import Link from "next/link";

export default function AdminDetalhePedidoPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <nav className="flex items-center text-label-sm text-on-surface-variant mb-2 gap-2">
            <Link href="/admin/pedidos" className="hover:text-primary cursor-pointer">Pedidos</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Detalhes do Pedido #{params.id.toUpperCase()}</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Pedido #{params.id.toUpperCase()}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Realizado em 24 de Outubro, 2023 • 14:35</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        <div className="lg:col-span-8 flex flex-col gap-md">
          <section className="bg-surface-container-lowest p-md rounded-xl ambient-shadow">
            <div className="flex items-center gap-4 mb-md">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed">person</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Dados do Cliente</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Informações para contacto e faturação</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {[
                { label: "Nome Completo", value: "António Manuel Gouveia" },
                { label: "Telefone", value: "+244 923 456 789" },
                { label: "Email", value: "antonio.gouveia@email.ao" },
                { label: "Total de Pedidos", value: "12 Pedidos (Membro Premium)" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{item.label}</span>
                  <span className="font-body-lg text-body-lg text-on-surface font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface-container-lowest p-md rounded-xl ambient-shadow">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Resumo da Encomenda</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant">
                  <tr>
                    <th className="py-4 font-label-md text-on-surface-variant">Produto</th>
                    <th className="py-4 font-label-md text-on-surface-variant text-center">Quant.</th>
                    <th className="py-4 font-label-md text-on-surface-variant text-right">Preço Unit.</th>
                    <th className="py-4 font-label-md text-on-surface-variant text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {[
                    { name: "Pão de Luanda Artesanal", qty: "02", unit: "1.200 Kz", total: "2.400 Kz" },
                    { name: "Cesto de Frutas Tropicais (M)", qty: "01", unit: "8.500 Kz", total: "8.500 Kz" },
                    { name: "Café de Angola Premium 500g", qty: "01", unit: "4.800 Kz", total: "4.800 Kz" },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="py-4 font-body-md text-body-md font-semibold text-on-surface">{item.name}</td>
                      <td className="py-4 text-center font-body-md">{item.qty}</td>
                      <td className="py-4 text-right font-body-md">{item.unit}</td>
                      <td className="py-4 text-right font-body-md font-semibold text-primary">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-md pt-md border-t border-outline flex flex-col items-end gap-2">
              <div className="flex justify-between w-64 text-on-surface-variant font-body-md"><span>Subtotal</span><span>15.700 Kz</span></div>
              <div className="flex justify-between w-64 text-on-surface-variant font-body-md"><span>Taxa de Entrega</span><span>1.500 Kz</span></div>
              <div className="flex justify-between w-64 font-headline-md text-headline-md text-primary mt-2"><span>Total</span><span>17.200 Kz</span></div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-md">
          <section className="bg-surface-container-lowest p-md rounded-xl ambient-shadow">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Historico de Estados</h3>
            <div className="flex flex-col gap-md">
              {[
                { label: "Pedido Confirmado", time: "Hoje, 14:38", active: true },
                { label: "Em Preparação", time: "Aguardando início...", active: false },
                { label: "Saiu para Entrega", time: "--:--", active: false },
              ].map((step, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i < 2 && <div className="w-0.5 bg-primary absolute left-2.5 top-6 bottom-[-16px]" />}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${step.active ? "bg-primary" : "bg-outline-variant"}`}>
                    {step.active && <span className="material-symbols-outlined text-[12px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                  </div>
                  <div>
                    <p className={`text-label-md ${step.active ? "font-bold" : "text-on-surface-variant"}`}>{step.label}</p>
                    <p className="text-label-sm text-on-surface-variant">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
