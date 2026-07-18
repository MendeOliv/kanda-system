"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPhoneOTP } from "@/lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setMessage({ type: "error", text: "Por favor, insira um número de telefone válido." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const fullPhone = "+244" + phone;
      await sendPhoneOTP(fullPhone, "recaptcha-container");
      setMessage({ type: "success", text: "Código enviado com sucesso para " + fullPhone });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Erro ao enviar código. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="decoration-blob bg-primary-fixed w-[500px] h-[500px] -top-64 -left-32 fixed rounded-full opacity-40 blur-[80px]" />
      <div className="decoration-blob bg-secondary-fixed w-[400px] h-[400px] -bottom-32 -right-32 fixed rounded-full opacity-40 blur-[80px]" />

      <main className="w-full max-w-md px-6 py-lg relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden bg-white p-2 shadow-lg">
            <img className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEMiO-tHVWuWTn0nKdCCH9Muc80ysPPVKaNb2V1fPgCHS4IobGxeN57qJq24tsnTSQxJlpA-7t8C-ugYrbQGf51i-3KzI2EWu4MHLqiqLycCnuTKBFCIISV_WJJOY5C8vWMSjoK0pDnd1NLt3RNXH0u30Rtf3ZBZDM31BnZ2uUwZhqxnMOoVY0rrzWr35OQRuGkjozze_rnk6MFTOOyJO3XWbZNAUvMic8p79hyCwrPGLuZ4vsTavqRHoLODB_Dmz19A" alt="Logo" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Bem-vindo à Kanda</h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            A sua mercearia de bairro, sempre fresca e próxima de si.
          </p>
        </div>

        <div className="bg-white p-xl rounded-xl shadow-lg border border-surface-container-highest">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-base" htmlFor="phone">
                Número de Telemóvel
              </label>
              <div className="flex items-center border-2 border-surface-container-highest rounded-lg transition-all bg-white focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(144,77,0,0.05)]">
                <div className="flex items-center px-4 py-3 border-r border-surface-container-highest text-on-surface font-semibold bg-surface-container-low rounded-l-lg">
                  <span className="mr-2">🇦🇴</span>
                  <span>+244</span>
                </div>
                <input
                  className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder-outline-variant"
                  id="phone"
                  maxLength={9}
                  placeholder="9XX XXX XXX"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                />
              </div>
            </div>
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}>
                {message.text}
              </div>
            )}
            <div id="recaptcha-container" />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-transform active:scale-95 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "A enviar..." : "Pedir Código"}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-container-highest">
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
              Ao continuar, concorda com os nossos{" "}
              <a href="#" className="text-primary hover:underline font-semibold">Termos de Serviço</a> e{" "}
              <a href="#" className="text-primary hover:underline font-semibold">Privacidade</a>.
            </p>
          </div>
        </div>

        <div className="mt-lg text-center">
          <Link href="/" className="font-label-md text-label-md text-secondary flex items-center justify-center mx-auto gap-2 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Voltar para o início
          </Link>
        </div>
      </main>
    </div>
  );
}
