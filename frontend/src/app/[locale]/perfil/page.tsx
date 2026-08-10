"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const TABS = [
  { id: "dados", label: "Meus Dados", icon: "person" },
  { id: "moradas", label: "Minhas Moradas", icon: "location_on" },
  { id: "pedidos", label: "Meus Pedidos", icon: "receipt_long" },
  { id: "definicoes", label: "Definições", icon: "settings" },
];

export default function PerfilPage() {
  const { locale } = useParams();
  const [activeTab, setActiveTab] = useState("dados");

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto p-container-margin md:p-xl">
      <h2 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-background mb-lg">Meu Perfil</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Profile Overview */}
        <div className="lg:col-span-4 space-y-lg">
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-md">
              <div className="w-full h-full rounded-full border-4 border-surface-container-lowest shadow-sm bg-primary-container flex items-center justify-center text-on-primary-container text-4xl font-bold">
                A
              </div>
              <button className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-2 rounded-full shadow-md hover:bg-primary-fixed-dim transition-colors">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
            <h3 className="font-h2 text-h2 text-on-surface mb-1">Ana Silva</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Cliente VIP • Membro desde 2023</p>
            <button className="w-full bg-primary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-lg shadow-sm hover:bg-on-primary-container transition-colors active:scale-[0.98]">
              Editar Perfil
            </button>
            <Link
              href={`/${locale}/admin/pedidos`}
              className="w-full mt-sm bg-secondary-container text-on-secondary-container font-label-bold text-label-bold py-sm px-md rounded-lg hover:bg-secondary-fixed-dim transition-colors"
            >
              Painel de Gestão
            </Link>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-8 space-y-lg">
          {/* Tabs */}
          <div className="flex overflow-x-auto pb-sm gap-sm no-scrollbar border-b border-outline-variant/50">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-md py-sm whitespace-nowrap flex items-center gap-xs transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary font-label-bold text-label-bold"
                    : "border-b-2 border-transparent text-secondary hover:text-primary font-body-md text-body-md"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "dados" && (
            <>
              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
                <h4 className="font-h3 text-h3 text-on-surface mb-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Informações Pessoais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {[
                    { label: "Nome Completo", value: "Ana Maria Silva" },
                    { label: "Email", value: "ana.silva@exemplo.ao" },
                    { label: "Telefone", value: "+244 923 456 789" },
                    { label: "Data de Nascimento", value: "15 / 08 / 1990" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block font-label-bold text-label-bold text-on-surface-variant mb-base">{f.label}</label>
                      <div className="p-sm bg-surface rounded-lg border border-outline-variant/50 font-body-md text-body-md text-on-surface">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
                <h4 className="font-h3 text-h3 text-on-surface mb-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  Segurança
                </h4>
                <button className="w-full sm:w-auto bg-primary-container text-on-primary-container font-label-bold text-label-bold py-sm px-lg rounded-lg hover:bg-primary-fixed-dim transition-colors">
                  Alterar Palavra-passe
                </button>
              </div>
            </>
          )}

          {activeTab === "moradas" && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
              <h4 className="font-h3 text-h3 text-on-surface mb-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">location_on</span>
                As suas moradas
              </h4>
              <div className="bg-surface rounded-lg border border-outline-variant/50 p-md flex flex-col gap-xs">
                <span className="font-label-bold text-label-bold text-on-surface">Casa</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Rua Agostinho Neto, Bloco B, Apt 12<br />Centralidade do Kilamba
                </p>
                <span className="mt-xs self-start bg-primary-container text-on-primary-container font-label-bold text-[10px] px-sm py-xs rounded-full">Padrão</span>
              </div>
              <Link
                href={`/${locale}/mercado`}
                className="mt-md inline-flex items-center gap-xs text-primary font-label-bold text-label-bold hover:text-primary-fixed-dim transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Adicionar nova morada
              </Link>
            </div>
          )}

          {activeTab === "pedidos" && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
              <h4 className="font-h3 text-h3 text-on-surface mb-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Meus Pedidos
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                Acompanhe o estado das suas encomendas.
              </p>
              <Link
                href={`/${locale}/admin/pedidos`}
                className="inline-flex items-center gap-xs text-primary font-label-bold text-label-bold hover:text-primary-fixed-dim transition-colors"
              >
                Ver pedidos
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          )}

          {activeTab === "definicoes" && (
            <div className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
              <h4 className="font-h3 text-h3 text-on-surface mb-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">settings</span>
                Definições
              </h4>
              <div className="space-y-md">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-body-md text-body-md text-on-surface">Notificações por email</span>
                  <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-body-md text-body-md text-on-surface">Notificações por SMS</span>
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" />
                </label>
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-xs text-error font-label-bold text-label-bold hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Terminar sessão
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}