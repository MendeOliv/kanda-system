"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "shopping_bag", label: "Pedidos", href: "/admin/pedidos" },
  { icon: "inventory_2", label: "Stock", href: "#" },
  { icon: "group", label: "Clientes", href: "#" },
  { icon: "settings", label: "Definições", href: "#" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      {/* SideNavBar */}
      <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col p-md space-y-md z-40 hidden md:flex">
        <div className="flex items-center gap-sm mb-lg px-xs">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <div>
            <h2 className="font-h3 text-h3 text-primary">Gestão Kanda</h2>
            <p className="font-body-sm text-body-sm text-secondary">Painel de Controlo</p>
          </div>
        </div>

        <div className="flex-1 space-y-base">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-sm px-md py-sm rounded-lg cursor-pointer transition-transform active:scale-95 duration-150 ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-label-bold"
                    : "text-secondary hover:bg-surface-container-high rounded-lg font-body-md"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-base pt-md border-t border-outline-variant">
          <Link href="/" className="flex items-center gap-sm px-md py-sm text-secondary hover:bg-surface-container-high rounded-lg font-body-md transition-all cursor-pointer active:scale-95 duration-150">
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Voltar à Loja</span>
          </Link>
          <Link href="/login" className="flex items-center gap-sm px-md py-sm text-secondary hover:bg-surface-container-high rounded-lg font-body-md transition-all cursor-pointer active:scale-95 duration-150">
            <span className="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </Link>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden w-full sticky top-0 z-50 bg-surface-container-lowest shadow-sm px-container-margin py-md flex items-center justify-between">
        <h2 className="font-h3 text-h3 text-primary">Gestão Kanda</h2>
        <Link href="/" className="text-secondary">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </div>

      <main className="flex-1 ml-0 md:ml-64 md:p-lg p-container-margin flex flex-col min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}