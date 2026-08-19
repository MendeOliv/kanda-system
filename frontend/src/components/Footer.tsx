"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tBrand = useTranslations("brand");

  return (
    <footer className="w-full bg-secondary mt-xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg px-container-margin py-xl max-w-7xl mx-auto w-full text-on-secondary">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-sm">
          <img src="/kanda-logo-exact.svg" alt="Kanda" className="h-10 w-auto" />
          <p className="font-body-sm text-body-sm opacity-80 mt-sm">{tBrand("tagline")}</p>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-sm">
          <span className="font-label-bold text-label-bold mb-xs">Empresa</span>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/sobre">
            Sobre Nós
          </Link>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/contactos">
            Contactos
          </Link>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/mercado">
            Categorias
          </Link>
        </div>

        {/* Apoio */}
        <div className="flex flex-col gap-sm">
          <span className="font-label-bold text-label-bold mb-xs">Apoio</span>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/perguntas-frequentes">
            Ajuda / FAQ
          </Link>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/entregas">
            Entregas
          </Link>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/devolucoes">
            Devoluções
          </Link>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-sm">
          <span className="font-label-bold text-label-bold mb-xs">Legal</span>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/termos">
            Termos e Condições
          </Link>
          <Link className="font-body-sm text-body-sm text-on-secondary opacity-80 hover:text-primary-fixed transition-colors" href="/privacidade">
            Privacidade
          </Link>
          <span className="font-body-sm text-body-sm text-on-secondary opacity-80 bg-on-secondary/10 px-sm py-xs rounded mt-xs">
            Pagamento: Multicaixa Express
          </span>
        </div>
      </div>
      <div className="w-full border-t border-on-secondary/20 py-md px-container-margin text-center">
        <p className="font-body-sm text-body-sm text-on-secondary opacity-60">
          © {new Date().getFullYear()} Kanda Mercearia. O seu vizinho de confiança em Kilamba.
        </p>
      </div>
    </footer>
  );
}