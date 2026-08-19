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

  useEffect(() => {
    const syncUser = () => {
      const currentUser = getCurrentFirebaseUser();
      setUser(currentUser);
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const navItems = [
    { label: t("home"), href: "/", icon: "home" },
    { label: t("market"), href: "/mercado", icon: "local_mall" },
    { label: "Sobre Nós", href: "/sobre", icon: "info" },
    { label: "Contactos", href: "/contactos", icon: "call" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm bg-surface-container-lowest">
      <div className="flex justify-between items-center px-container-margin py-md max-w-7xl mx-auto w-full">
        {/* Brand */}
        <Link href="/" className="font-h2 text-h2 text-primary shrink-0 flex items-center gap-xs">
          <img src="/kanda-logo-exact.svg" alt="Kanda" className="h-10 w-auto" />
          {tBrand("name")}
        </Link>

        {/* Search Bar */}
        {showSearch !== false && (
          <div className="hidden md:flex flex-1 max-w-2xl px-lg">
            <div className="relative flex items-center w-full h-12 rounded-full bg-surface-container border border-outline-variant focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 transition-all overflow-hidden shadow-[0px_2px_8px_rgba(26,43,76,0.06)]">
              <div className="pl-md text-secondary">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="w-full h-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md px-sm placeholder-secondary/70"
                placeholder={t("searchPlaceholder")}
                type="text"
              />
            </div>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-secondary font-body-md hover:bg-surface-container-low transition-colors px-md py-sm rounded-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-sm shrink-0">
          <LanguageSwitcher />

          {/* Cart */}
          <Link
            href="/carrinho"
            className="p-xs text-secondary hover:bg-surface-container-low transition-colors rounded-full relative"
            aria-label={t("cart")}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute top-1 right-1 bg-primary-container text-on-primary-container font-label-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            href={user ? "/perfil" : "/login"}
            className="p-xs text-secondary hover:bg-surface-container-low transition-colors rounded-full"
            aria-label={t("account")}
          >
            <span className="material-symbols-outlined">
              {user ? "account_circle" : "person"}
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-all"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-outline-variant/30 bg-surface-container-lowest px-container-margin pt-md pb-6 space-y-1 animate-fade-in shadow-md">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-surface-container-low hover:text-primary transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <Link
            href="/perguntas-frequentes"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-body-md hover:bg-surface-container-low hover:text-primary transition-all"
            onClick={() => setMobileOpen(false)}
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            Ajuda
          </Link>
          <Link
            href={user ? "/perfil" : "/login"}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-on-primary font-label-bold mt-2 hover:brightness-110 transition-all"
            onClick={() => setMobileOpen(false)}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            {user ? t("account") : t("login")}
          </Link>
        </nav>
      )}
    </header>
  );
}