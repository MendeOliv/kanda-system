"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
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
            <h2 className="font-headline-md text-headline-md font-bold text-primary">Kanda Luanda</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            O seu vizinho de confiança em Luanda, trazendo o melhor do campo para a sua mesa.
          </p>
        </div>
        <div className="space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Apoio ao Cliente</h3>
          <ul className="space-y-base font-body-md text-body-md text-on-surface-variant">
            <li><Link href="#" className="hover:text-primary transition-colors">Perguntas Frequentes</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Entregas e Prazos</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Devoluções</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Contactos</Link></li>
          </ul>
        </div>
        <div className="space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Sobre Nós</h3>
          <ul className="space-y-base font-body-md text-body-md text-on-surface-variant">
            <li><Link href="#" className="hover:text-primary transition-colors">Nossa História</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Sustentabilidade</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Trabalhe Connosco</Link></li>
            <li><Link href="/moradas" className="hover:text-primary transition-colors">As Nossas Lojas</Link></li>
          </ul>
        </div>
        <div className="space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Newsletter</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Receba as melhores ofertas diretamente no seu email.</p>
          <form onSubmit={handleSubscribe} className="flex gap-base">
            <input
              className="flex-1 bg-white border-none rounded-lg focus:ring-primary px-4 py-2"
              placeholder="O seu email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md">
              {subscribed ? "Inscrito!" : "Ok"}
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-gutter mt-xl pt-md border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
        <p className="font-label-sm text-label-sm text-outline">© 2024 Kanda Supermercado. Todos os direitos reservados.</p>
        <div className="flex gap-md font-label-sm text-label-sm text-outline">
          <Link href="#" className="hover:text-primary">Termos e Condições</Link>
          <Link href="#" className="hover:text-primary">Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
