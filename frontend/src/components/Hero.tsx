"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag, Truck, Shield } from "lucide-react";

const FEATURES = [
  { icon: ShoppingBag, titleKey: "easyShopping", descKey: "easyShoppingDesc" },
  { icon: Truck, titleKey: "fastDelivery", descKey: "fastDeliveryDesc" },
  { icon: Shield, titleKey: "securePayment", descKey: "securePaymentDesc" },
];

export function Hero() {
  const t = useTranslations("home.hero");
  const tFeatures = useTranslations("home.features");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-container/10 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {t("badge")}
          </div>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
            {t.rich("title", {
              span: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/mercado" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md shadow-lg hover:brightness-110 active:scale-95 transition-all">
              {t("ctaPrimary")}
            </Link>
            <Link href="/#zonas" className="bg-surface-container-low text-on-surface-variant px-8 py-4 rounded-xl font-label-md hover:bg-surface-container transition-all">
              {t("ctaSecondary")}
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((item) => (
              <div
                key={item.titleKey}
                className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-surface-container-high"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-on-surface">{tFeatures(item.titleKey)}</h3>
                <p className="text-sm text-on-surface-variant">{tFeatures(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
