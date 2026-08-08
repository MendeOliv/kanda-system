"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { getCurrentFirebaseUser } from "@/lib/firebase";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch }: HeaderProps) {
  const t = useTranslations("header");
  const tBrand = useTranslations("brand");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { count } = useCart();

  const navItems = [
    { label: t("home"), href: "/" },
    { label: t("market"), href: "/mercado" },
    { label: t("orders"), href: "/pedidos" },
  ];

  useEffect(() => {
    const syncUser = () => {
      const currentUser = getCurrentFirebaseUser();
      setUser(currentUser);
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  return (
    <header className="bg-surface w-full top-0 sticky z-50">
      <div className="flex justify-between items-center px-gutter py-base max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-base">
          <span className="material-symbols-outlined text-primary text-headline-lg">storefront</span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary">{tBrand("name")}</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 px-3 py-2 rounded-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-md">
          <LanguageSwitcher />
          <Link
            href="/carrinho"
            className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 text-primary"
            aria-label={t("cart")}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/" : "/login"}
            className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-surface-container-low active:scale-95 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm font-medium">{user ? t("account") : t("login")}</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="md:hidden border-t border-outline-variant/30 bg-surface px-gutter py-md space-y-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block font-label-md text-label-md text-on-surface-variant py-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={user ? "/" : "/login"}
            className="block font-label-md text-label-md text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            {user ? t("account") : t("login")}
          </Link>
        </nav>
      )}
    </header>
  );
}
