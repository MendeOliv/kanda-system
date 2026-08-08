import Link from "next/link";

export default function EstadoPedidoPage({ params }: { params: { id: string } }) {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl">
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 mb-md">
          <nav className="flex items-center gap-xs text-on-surface-variant mb-base">
            <Link href="/pedidos" className="text-label-sm font-label-sm hover:text-primary">Meus Pedidos</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-label-sm font-label-sm text-primary font-bold">Pedido #{params.id.toUpperCase()}</span>
          </nav>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Acompanhar Pedido</h2>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-container">
            <div className="flex justify-between items-start mb-xl">
              <div>
                <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Status Atual</p>
                <h3 className="text-headline-md font-headline-md text-primary mt-xs">Pedido em Rota de Entrega</h3>
              </div>
              <div className="text-right">
                <p className="text-label-md font-label-md text-on-surface-variant">Previsão de Chegada</p>
                <p className="text-headline-md font-headline-md text-on-surface">14:45 - 15:15</p>
              </div>
            </div>
            <div className="relative flex justify-between items-start pt-base">
              <div className="absolute top-[18px] left-0 w-full h-[2px] bg-surface-container-highest z-0" />
              <div className="absolute top-[18px] left-0 w-[80%] h-[2px] bg-primary z-0 transition-all" />
              {[
                { icon: "check_circle", label: "Recebido", active: true },
                { icon: "payments", label: "Pagamento", active: true },
                { icon: "inventory_2", label: "Preparação", active: true },
                { icon: "box", label: "Pronto", active: true },
                { icon: "delivery_dining", label: "Em Rota", active: true, pulse: true },
                { icon: "task_alt", label: "Entregue", active: false },
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center w-1/6">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-sm shadow-md ${
                    step.active ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"
                  } ${step.pulse ? "ring-4 ring-primary-fixed/30 animate-pulse" : ""}`}>
                    <span className="material-symbols-outlined text-[20px]" style={step.active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {step.icon}
                    </span>
                  </div>
                  <span className={`text-label-sm font-label-sm text-center ${step.active ? "font-bold text-primary" : "text-on-surface-variant"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-container">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Histórico do Pedido</h3>
            <div className="space-y-md">
              {[
                { text: "Entregador em trânsito para o seu endereço", time: "Hoje, 14:32", active: true },
                { text: "Pedido embalado e pronto para entrega", time: "Hoje, 14:15", active: false },
                { text: "Pedido recebido na loja Kanda - Benfica", time: "Hoje, 13:45", active: false },
              ].map((entry, i) => (
                <div key={i} className="flex gap-md">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${entry.active ? "bg-primary" : "bg-outline-variant"} mt-1.5`} />
                    {i < 2 && <div className="w-[1px] h-full bg-outline-variant my-1" />}
                  </div>
                  <div className={i < 2 ? "pb-md" : ""}>
                    <p className="font-label-md text-label-md text-on-surface">{entry.text}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-container sticky top-32">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Resumo do Pedido</h3>
            <div className="space-y-md mb-lg">
              <div className="flex gap-md">
                <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjNuYihXKBCbfvKCz5y0UrqYIczikQSqq-wvnf85249JVwcSK9pswIKWvtT8bqW7R45m2IqFx0HDYEu5JCFz1iJGsDHylRgbvONgpNqnH8UYzC1yB3IpzKYenYbBJxEYu1wzF1hgpbwgaxEA5zPo9IXL7yb0CWLlGd8SXpnpygYcjHc2MBhprxBCa6T2cOPbBLZ86rxWn__HAgNO-kdS-Av15fVnQ8LFr-x8staKPC5KdjJYTMbEdG" alt="" />
                </div>
                <div className="flex-grow">
                  <p className="font-label-md text-label-md text-on-surface">Cesto de Frutas Tropicais (G)</p>
                  <p className="text-label-sm text-on-surface-variant">1 un. • 12.500 Kz</p>
                </div>
              </div>
              <div className="flex gap-md">
                <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsj_jlNli6_rSI4IslOacupkC189d0kqtvO4nqL4YbhoIjbpLhpNuflTmVs6biQBS5VY2FZ-Nkahk1tShwfDsu8P5hctZ8qN9CHVRkotG8J2Yh2cMujLEWenCHYps19brCKNV4L5C7pQ7oz9XB4h0Ijv6iU-ZPqBkegfE2MYqLrrfsd_TcwXPCUTtPOLtOz6q-LaLJBtFZjxMSOVQqdhp3lY71FAO6Fjcz9n1PrLVEc2ZG9l4-1XVy" alt="" />
                </div>
                <div className="flex-grow">
                  <p className="font-label-md text-label-md text-on-surface">Pão de Luanda Artesanal</p>
                  <p className="text-label-sm text-on-surface-variant">4 un. • 2.400 Kz</p>
                </div>
              </div>
            </div>
            <div className="border-t border-surface-container py-md space-y-xs">
              <div className="flex justify-between text-body-md font-body-md text-on-surface-variant">
                <span>Subtotal</span><span>14.900 Kz</span>
              </div>
              <div className="flex justify-between text-body-md font-body-md text-on-surface-variant">
                <span>Taxa de Entrega</span><span>1.500 Kz</span>
              </div>
              <div className="flex justify-between text-headline-md font-headline-md text-on-surface pt-sm">
                <span>Total</span><span className="text-primary">16.400 Kz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
