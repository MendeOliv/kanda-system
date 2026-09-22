"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Store, ShoppingCart, UserRound } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = [
    { label: t("home"), icon: Home, href: "/" },
    { label: t("market"), icon: Store, href: "/mercado" },
    { label: "Carrinho", icon: ShoppingCart, href: "/carrinho" },
    { label: t("profile"), icon: UserRound, href: "/perfil" },
  ];

  if (pathname.startsWith("/admin")) return null;
  if (pathname.includes("/login")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-4 bg-surface-container-lowest shadow-[0px_-4px_24px_rgba(26,43,76,0.08)] border-t border-outline-variant/30"
      aria-label="Navegação principal"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-transform ${
              isActive
                ? "text-primary"
                : "text-on-surface-variant"
            }`}
          >
            <Icon
              className="h-6 w-6"
              strokeWidth={isActive ? 2.5 : 2}
              aria-hidden="true"
            />
            <span className="font-label-bold text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
