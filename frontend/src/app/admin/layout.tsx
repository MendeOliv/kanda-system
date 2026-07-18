"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Painel", href: "#" },
  { icon: "receipt_long", label: "Pedidos", href: "/admin/pedidos" },
  { icon: "inventory_2", label: "Stock", href: "#" },
  { icon: "group", label: "Clientes", href: "#" },
  { icon: "settings", label: "Configurações", href: "#" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="fixed left-0 top-0 h-full z-[60] flex flex-col p-md bg-surface w-72 rounded-r-xl shadow-xl">
        <div className="mb-xl flex items-center gap-sm px-sm">
          <span className="material-symbols-outlined text-primary text-4xl">storefront</span>
          <span className="font-headline-md text-headline-md text-primary font-bold">Kanda Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-md p-md rounded-lg transition-colors ${
                  isActive ? "text-primary font-bold bg-primary-container/10" : "text-on-surface-variant hover:bg-secondary-container/20"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-body-md text-body-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-lg border-t border-outline-variant">
          <Link href="/" className="flex items-center gap-md p-md rounded-lg text-on-surface-variant hover:bg-secondary-container/20 transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-body-md text-body-md">Voltar à Loja</span>
          </Link>
        </div>
      </aside>

      <main className="ml-72 flex-1 min-h-screen p-gutter lg:p-xl max-w-container-max mx-auto">
        {children}
      </main>
    </div>
  );
}
