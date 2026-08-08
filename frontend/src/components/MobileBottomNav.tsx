"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = [
    { label: t("home"), icon: "home", href: "/" },
    { label: t("market"), icon: "local_mall", href: "/mercado" },
    { label: t("orders"), icon: "receipt_long", href: "/pedidos" },
    { label: t("profile"), icon: "person", href: "/login" },
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-6 bg-surface shadow-md rounded-t-xl border-t border-outline-variant/20">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-transform ${
              isActive
                ? "bg-primary-container text-on-primary-container rounded-full"
                : "text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-sm text-label-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
