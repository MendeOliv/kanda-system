"use client";

import { useState } from "react";

export default function ContactosPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-container-margin py-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="text-center space-y-sm">
        <h1 className="font-h1 text-h1 text-on-surface md:font-h1-mobile md:text-h1-mobile">Fale Connosco</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Estamos aqui para ajudar. Preencha o formulário ou visite a nossa loja em Kilamba.
        </p>
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Form */}
        <div className="glass-card rounded-xl p-lg flex flex-col gap-md bg-surface-container-lowest">
          <h2 className="font-h2 text-h2 text-on-surface mb-sm">Envie uma Mensagem</h2>
          {submitted ? (
            <div className="bg-primary-fixed text-on-primary-fixed rounded-lg p-md flex flex-col items-center gap-sm text-center">
              <span className="material-symbols-outlined icon-filled text-[40px] text-primary">check_circle</span>
              <p className="font-body-md text-body-md">Obrigado! A sua mensagem foi enviada. Responderemos em breve.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-xs text-primary font-label-bold hover:underline"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form
              className="flex flex-col gap-md"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="flex flex-col gap-base">
                <label className="font-label-bold text-label-bold text-on-surface-variant" htmlFor="name">Nome Completo</label>
                <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" id="name" placeholder="O seu nome" type="text" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface-variant" htmlFor="email">E-mail</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" id="email" placeholder="O seu e-mail" type="email" required />
                </div>
                <div className="flex flex-col gap-base">
                  <label className="font-label-bold text-label-bold text-on-surface-variant" htmlFor="phone">Telefone</label>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" id="phone" placeholder="O seu telefone" type="tel" />
                </div>
              </div>
              <div className="flex flex-col gap-base">
                <label className="font-label-bold text-label-bold text-on-surface-variant" htmlFor="subject">Assunto</label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow" id="subject">
                  <option>Dúvida sobre produto</option>
                  <option>Reclamação</option>
                  <option>Parceria</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="flex flex-col gap-base">
                <label className="font-label-bold text-label-bold text-on-surface-variant" htmlFor="message">Mensagem</label>
                <textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-sm font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none" id="message" placeholder="Escreva aqui a sua mensagem..." rows={5} required></textarea>
              </div>
              <button type="submit" className="mt-xs bg-primary text-on-primary font-label-bold text-label-bold h-12 rounded-lg flex items-center justify-center gap-xs hover:bg-surface-tint transition-colors active:scale-95">
                <span>Enviar Mensagem</span>
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col gap-sm">
              <div className="bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center mb-xs">
                <span className="material-symbols-outlined">call</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface">Telefone</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">+244 923 123 456</p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col gap-sm">
              <div className="bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center mb-xs">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface">E-mail</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">geral@kandamercearia.ao</p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col gap-sm md:col-span-2">
              <div className="bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center mb-xs">
                <span className="material-symbols-outlined">location_city</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface">Endereço Físico</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Rua Principal, Bloco 4, Loja 12<br />Centralidade do Kilamba, Luanda
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col gap-sm md:col-span-2">
              <div className="bg-primary-container text-on-primary-container w-10 h-10 rounded-full flex items-center justify-center mb-xs">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <h3 className="font-label-bold text-label-bold text-on-surface">Horário de Funcionamento</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Segunda a Sábado: 08:00 - 20:00<br />Domingos e Feriados: 08:00 - 14:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}