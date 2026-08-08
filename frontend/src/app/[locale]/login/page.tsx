"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { userApi } from "@/lib/api";
import { confirmPhoneOTP, sendPhoneOTP, setFirebaseAuthInstance } from "@/lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const t = useTranslations("auth");
  const tBrand = useTranslations("brand");

  const createUserAccount = async (uid: string, phoneNumber: string) => {
    try {
      await userApi.create({
        firebaseUid: uid,
        phone: phoneNumber,
      });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        return;
      }
      if (error?.message?.includes("Network") || error?.code === "ERR_NETWORK") {
        console.warn("Backend indisponível no momento; o login continuará localmente.", error);
        return;
      }
      throw error;
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setMessage({ type: "error", text: t("phone.invalidPhone") });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const fullPhone = "+244" + phone;
      const result = await sendPhoneOTP(fullPhone, "recaptcha-container");
      setConfirmationResult(result);
      setStep("otp");
      setMessage({ type: "success", text: t("phone.codeSent") + fullPhone });
    } catch (err: any) {
      const errorMessage = err?.message || t("phone.sendError");
      console.error("Firebase OTP send failed", err);
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setMessage({ type: "error", text: t("phone.sendCodeFirst") });
      return;
    }

    if (code.length < 6) {
      setMessage({ type: "error", text: t("phone.enterCode") });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const fullPhone = "+244" + phone;
      const authResult = await confirmPhoneOTP(confirmationResult, code);
      if (authResult?.token) {
        localStorage.setItem("firebase_token", authResult.token);
      }

      if (!authResult?.user?.uid) {
        throw new Error(t("phone.verifyError"));
      }

      setFirebaseAuthInstance({ currentUser: authResult.user });
      await createUserAccount(authResult.user.uid, fullPhone);

      setMessage({ type: "success", text: t("phone.authSuccess") });
      window.location.href = "/";
    } catch (err: any) {
      const errorMessage = err?.message || t("phone.invalidCode");
      console.error("Firebase OTP confirmation failed", err);
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,204,153,0.45)_0%,_transparent_45%)]" />
      <div className="absolute -left-10 top-0 h-64 w-64 rounded-full bg-primary-fixed/40 blur-3xl" />
      <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-secondary-fixed/50 blur-3xl" />

      <main className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/70 bg-white/90 p-3 shadow-[0_20px_60px_rgba(144,77,0,0.18)] backdrop-blur">
            <img className="h-full w-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEMiO-tHVWuWTn0nKdCCH9Muc80ysPPVKaNb2V1fPgCHS4IobGxeN57qJq24tsnTSQxJlpA-7t8C-ugYrbQGf51i-3KzI2EWu4MHLqiqLycCnuTKBFCIISV_WJJOY5C8vWMSjoK0pDnd1NLt3RNXH0u30Rtf3ZBZDM31BnZ2uUwZhqxnMOoVY0rrzWr35OQRuGkjozze_rnk6MFTOOyJO3XWbZNAUvMic8p79hyCwrPGLuZ4vsTavqRHoLODB_Dmz19A" alt="Logo" />
          </div>
          <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">{t("phone.welcome")}</h1>
          <p className="max-w-sm font-body-md text-body-md text-on-surface-variant">
            {t("phone.subtitle")}
          </p>
        </div>

        <div className="rounded-[28px] border border-surface-container-highest bg-white/95 p-8 shadow-[0_24px_90px_rgba(144,77,0,0.16)] backdrop-blur">
          <form className="space-y-6" onSubmit={step === "phone" ? handleSendCode : handleVerifyCode}>
            {step === "phone" ? (
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-base" htmlFor="phone">
                  {t("phone.phoneLabel")}
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
                    placeholder={t("phone.phonePlaceholder")}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-base" htmlFor="code">
                  {t("phone.codeLabel")}
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-surface-container-highest rounded-lg bg-white focus:border-primary focus:ring-0 font-body-md text-on-surface"
                  id="code"
                  maxLength={6}
                  placeholder={t("phone.codePlaceholder")}
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <button
                  type="button"
                  className="mt-3 text-sm text-primary hover:underline"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setConfirmationResult(null);
                    setMessage(null);
                  }}
                >
                  {t("phone.changeNumber")}
                </button>
              </div>
            )}
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary shadow-[0_12px_30px_rgba(144,77,0,0.18)] transition-transform duration-200 active:scale-95 hover:brightness-110 disabled:opacity-50"
            >
              {loading ? (step === "phone" ? t("phone.sending") : t("phone.verifying")) : step === "phone" ? t("phone.sendCode") : t("phone.verifyCode")}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 border-t border-surface-container-highest pt-8">
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
              {t("phone.agreeTerms")}{" "}
              <a href="#" className="text-primary hover:underline font-semibold">{t("phone.termsOfService")}</a> e{" "}
              <a href="#" className="text-primary hover:underline font-semibold">{t("phone.privacy")}</a>.
            </p>
          </div>
        </div>

        <div className="mt-lg text-center">
          <Link href="/" className="font-label-md text-label-md text-secondary flex items-center justify-center mx-auto gap-2 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            {t("phone.backToHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
