"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tBrand = useTranslations("brand");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-surface-container-highest py-xl mt-xl">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-4 gap-xl">
        <div className="space-y-md">
          <div className="flex items-center gap-base">
            <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">{tBrand("name")}</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">{tBrand("tagline")}</p>
        </div>
        <div className="space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">{t("customerSupport")}</h3>
          <ul className="space-y-base font-body-md text-body-md text-on-surface-variant">
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.faq")}</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.delivery")}</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.returns")}</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.contact")}</Link></li>
          </ul>
        </div>
        <div className="space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">{t("aboutUs")}</h3>
          <ul className="space-y-base font-body-md text-body-md text-on-surface-variant">
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.story")}</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.sustainability")}</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">{t("links.careers")}</Link></li>
            <li><Link href="/moradas" className="hover:text-primary transition-colors">{t("links.stores")}</Link></li>
          </ul>
        </div>
        <div className="space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">{t("newsletter")}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{t("newsletterHint")}</p>
          <form onSubmit={handleSubscribe} className="flex gap-base">
            <input
              className="flex-1 bg-white border-none rounded-lg focus:ring-primary px-4 py-2"
              placeholder={t("emailPlaceholder")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md">
              {subscribed ? t("subscribed") : t("ok")}
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-gutter mt-xl pt-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
        <p className="font-label-sm text-label-sm text-outline">{t("copyright", { year: new Date().getFullYear() })}</p>
        <div className="flex gap-md font-label-sm text-label-sm text-outline">
          <Link href="#" className="hover:text-primary">{t("links.terms")}</Link>
          <Link href="#" className="hover:text-primary">{t("links.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}
