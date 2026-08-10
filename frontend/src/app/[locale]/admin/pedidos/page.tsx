"use client";

import { useState } from "react";

type OrderStatus = "Novo" | "Em Processamento" | "Concluído";

interface Order {
  id: string;
  client: string;
  initials: string;
  time: string;
  total: string;
  status: OrderStatus;
}

const ORDERS: Order[] = [
  { id: "KND-8042", client: "Maria Almeida", initials: "MA", time: "Hoje, 14:30", total: "12.500 Kz", status: "Novo" },
  { id: "KND-8041", client: "João Carlos", initials: "JC", time: "Hoje, 13:15", total: "34.200 Kz", status: "Em Processamento" },
  { id: "KND-8040", client: "Ana Paula", initials: "AP", time: "Ontem, 18:45", total: "8.900 Kz", status: "Concluído" },
  { id: "KND-8039", client: "Pedro Lucas", initials: "PL", time: "Ontem, 16:20", total: "45.000 Kz", status: "Concluído" },
];

const STATUS_FILTERS = ["Todos", "Novos", "Em Processamento", "Concluídos"];

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Novo: "bg-error-container text-on-error-container",
    "Em Processamento": "bg-primary-fixed text-on-primary-fixed",
    Concluído: "bg-[#d1fad4] text-[#0a5214]",
  };
  const dotMap: Record<OrderStatus, string> = {
    Novo: "bg-error",
    "Em Processamento": "bg-primary",
    Concluído: "bg-[#1b8a2a]",
  };
  return (
    <span className={`inline-flex items-center gap-xs px-sm py-1 rounded-full font-label-bold text-[12px] ${map[status]}`}>
      <span className={`w-2 h-2 rounded-full ${dotMap[status]}`}></span> {status}
    </span>
  );
}

export default function AdminPedidosPage() {
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");

  const filtered = ORDERS.filter((o) => {
    const matchesStatus =
      filter === "Todos" ||
      (filter === "Novos" && o.status === "Novo") ||
      (filter === "Em Processamento" && o.status === "Em Processamento") ||
      (filter === "Concluídos" && o.status === "Concluído");
    const matchesQuery =
      query === "" ||
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.client.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <>
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-xl gap-md">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Gestão de Pedidos</h1>
          <p className="font-body-md text-body-md text-secondary mt-base">Acompanhe e gira as encomendas recebidas.</p>
        </div>
        <div className="flex gap-sm">
          <button className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest text-primary border border-outline-variant rounded-lg font-label-bold hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Exportar
          </button>
          <button className="flex items-center gap-xs px-md py-[11px] bg-primary-container text-on-primary-container rounded-lg font-label-bold hover:bg-primary hover:text-on-primary transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Pedido
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-surface-container-lowest p-md rounded-lg shadow-sm border border-outline-variant/30 mb-lg flex flex-col md:flex-row gap-md items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-secondary">search</span>
          <input
            className="w-full pl-xl pr-md py-sm bg-surface text-on-surface border border-outline-variant rounded-lg font-body-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
            placeholder="Procurar por ID, Cliente..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-md py-xs rounded-full font-label-bold whitespace-nowrap ${
                filter === f
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface text-secondary border border-outline-variant hover:bg-surface-container-low transition-colors"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container text-secondary font-label-bold border-b border-outline-variant/50">
                <th className="p-md font-label-bold">ID Pedido</th>
                <th className="p-md font-label-bold">Cliente</th>
                <th className="p-md font-label-bold">Data / Hora</th>
                <th className="p-md font-label-bold">Valor Total</th>
                <th className="p-md font-label-bold">Estado</th>
                <th className="p-md font-label-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="font-body-sm">
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors group">
                  <td className="p-md font-label-bold text-primary">{o.id}</td>
                  <td className="p-md text-on-surface flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-label-bold">{o.initials}</div>
                    {o.client}
                  </td>
                  <td className="p-md text-secondary">{o.time}</td>
                  <td className="p-md font-price-display text-[16px] text-on-surface">{o.total}</td>
                  <td className="p-md">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-md text-right">
                    <button className="p-sm text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Ver Detalhes">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-md text-center text-secondary" colSpan={6}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-md border-t border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between mt-auto">
          <span className="font-body-sm text-secondary">A mostrar 1 a {filtered.length} de 24 pedidos</span>
          <div className="flex gap-base">
            <button disabled className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary-container text-on-primary-container font-label-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container font-body-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}