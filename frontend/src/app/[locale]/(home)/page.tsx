"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const CATEGORIES = [
  { name: "Alimentares", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6aES_es26rB9FTlqKHm81GJ2PLOfU3ASjelKdpGpA0iGXSI-IQEtR01IlppeBDI1n3mYt9_mkZhq8uPbBdLy5nBrKWzaKpjGec626L9NfHNXLHq__-bk8JNf53dIcLYnOYdFj83X2aWNehLUJhtGdYU6gNMzn_BbdNfQiLRXjMwvQ5VgmbB4OijZWTOZ5J6LaW8S6C6xgKszN5vaD3DWMtZRnVZz0FpUsEv_YNMuoByKhZ7Aq2cAV" },
  { name: "Higiene", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7TAsFG4JAxwXjeQTV3gTCvdBbX2YJtFX0r5gyuymdicXtpmHXhY-HrIer7VRNJQ6ue-iyP_k5RSeebhvm2l9oeAIKeOZ3dvjnC-eAZWP8qe9Qt4pAW4xeb3Z4Gp-ZJE8nTT8EzmAmFJpnGicM0ZksWfU4El9xkSCT0he0UQYZ7F9EOY8KkbSbR0PlplVZiYA_r2MBmMKJ0qnVMSGrUQ70_3tNdQxRw0OyhXyktVgpRC-iMfyQn5fs" },
  { name: "Bebidas", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOYPn1_ONCcRNcEKQAMn9ZkBWyRbeSe1b2QSneB9q82bLY8dUBGkmCpmGEo9zhRshGVM4wt_rTbWZXfKwljCQMIxHO4vh-P2_VO_nudFla-ZQL7zGChDGnYt_0Tk8QuMUOOuG7ivrxhcjsQ9cXzv7vsBBrFsclNaIUbE20IRYvxKB7PM8FwJhggQwsaEZTLHuhtRUG2ctyCjLdAsnm_FUkcgjFCbb75xo5i-c4XkMfCnjZGb-G9sK6" },
  { name: "Casa", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhPITmMrjs4ZNHbURMd9jukAy1aJ4Y89Wgtp4WPJIKcKu6jionfC0NeywWIfw2CUmERTxZednjHqq-WMkKJ_DfX-3DyWSIAzsZZAgY5-PgWanJA0CoytUJ2F3ooF3J5AyQOY8yctQNQBrHzvTdf7xkdjSm9y9FcXvtYgv4iXSQ2Su8VTze6fqeYWsuI-TkMvjqje4VPHhOUwllQQulqIs4-d7MRkT6cyK5MBjo0QA8yaNzpPA_k1gw" },
];

const PRODUCTS = [
  { name: "Leite Gordo Selecionado Kanda 1L", category: "Laticínios", price: "1.250 Kz", oldPrice: "1.470 Kz", discount: "-15%", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8dlw_mc5FK1P6gORr1EqKKpPegMpEFV27jZJ0wNnPvcgfo_DQgSxao9lpuiTbUb65KnLoOC3lOyNR66TMgJ-HR5pHUpqIGDgTuV2orMjG2_pQD43KGaQOTCWxJTC27tN2t38k69zC6LRGPtSC2uiCujJiscvnVFgC-zbU4pF0WzCbFxrExgWNpdpqMHeRSl_TEETkW62GSEehm1hcd2sICGoD2Ilb1IkUGuXwNG7xeLtSYJyDbqyE" },
  { name: "Pack Frutas Tropicais Frescas (2kg)", category: "Frutas e Legumes", price: "3.400 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxWtfV82l7Ath5r2E05Vuk0NrAn7iZxQSUhqYEGRzxTrkNrrZzHIAxUQwtc4VTvIR0zRboHV7bpzenFDyB3Nm4PsRqPEzQzOZYsGf5Ce7riEPHBZg6nuJ8HGcC-UN2iU2uE--OQTsYjVcdGgcV-fRCghLDwp8UPg-dHBBwLYE_dk-114jN1KBxjsC3XZrOQD-7tQ4mbWJyIzg2zRzfKMV_iqoW23xTt3EI_3t64dqVgblqxivBU84f" },
  { name: "Café de Angola Torrado em Grão 500g", category: "Despensa", price: "2.100 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXUwBgkKt0mKjuVo2WEeZOHd4KRkjwWvvWEREKOUBJmqo-whs_hh4NHuq9gaXX_1IpskXxmplzhHYj66IKkX9p0BZf80DIRmiDgjwHqJHT6u6418W354_S__Vqc_QbF53nma2dthJ0nU-b2i-i0zeUDAgeV3n0MjIoC3eMW3GTkNyPw4yJZNiTmctidfooTtZ_8Y6FrUMWV-bdtmXVDhFCugFCBQAUMyLtWFQkqP-vgSd_5OlT9z1O" },
  { name: "Queijo Fresco Artesanal da Huíla", category: "Charcutaria", price: "1.850 Kz", badge: "Novo", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7zkhy6N9FrKq5BX4agBKQ50mVr31d2g4ePNCFEtk3mYsXRNroGfwh5Zxb3mpM6ZVIALTjoodiCqTtDo9pG4P6Y7H3MAEo_dHLrLA304Eh7mM8CkQHWZbTsZ_TCYasJmFA-ISc5WMLmk0lqdRbbj2D0PVtX30GFH80m8HdJcFVh8VbNFpL0aEhHUGFUOU4YteyHtE1SVaQfov1o40hVqUAQaTbisR2_cZbzAia6uAOWuy1neJU_-5e" },
];

export default function HomePage() {
  const t = useTranslations("home");
  const { locale } = useParams();

  return (
    <main className="max-w-container-max mx-auto px-gutter py-md space-y-xl pb-xl">
      <section className="relative h-[480px] rounded-xl overflow-hidden ambient-shadow">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA00XbNtWqv-_KPdDrpAi4mDzUY9PYUlRy9aXOnrjsEgkdslyKsehwLVxV0R_X7-e3kNxAbrNs1uesuMC_r2YCiDs8S6uo9r-c03_BSVUYhaI5n-mRslOtm7pz0rCXhokxWSMH0-q7FmBGrjjFkEf-nEJWfsJPQPM2OM4Kjpp41_agNXUhhEiwkhsA2zuMelZd6TrmYcJcay1IzetbCOcsJRxwGMEuG5FgxNeW0YeHxFPS_WZ7loWh-')" }} />
        <div className="relative z-20 h-full flex flex-col justify-center px-xl space-y-md">
          <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full font-label-md text-label-md self-start">{t("hero.badge")}</span>
          <h2 className="font-headline-xl text-headline-xl text-white max-w-xl">{t("hero.title")}</h2>
          <p className="font-body-lg text-body-lg text-white/90 max-w-lg">{t("hero.subtitle")}</p>
          <Link href={`/${locale}/mercado`} className="bg-primary-container text-on-primary-container px-xl py-md rounded-lg font-label-md text-label-md w-fit hover:brightness-110 active:scale-95 transition-all inline-block">
            {t("hero.cta")}
          </Link>
        </div>
      </section>

      <section className="space-y-md">
        <div className="flex justify-between items-end">
          <h3 className="font-headline-md text-headline-md text-on-surface">{t("categories.title")}</h3>
          <Link href={`/${locale}/mercado`} className="text-primary font-label-md text-label-md hover:underline">
            {t("categories.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/${locale}/mercado?categoria=${cat.name.toLowerCase()}`}
              className="group cursor-pointer space-y-base text-center"
            >
              <div className="aspect-square bg-surface-container rounded-xl overflow-hidden ambient-shadow transition-transform group-hover:scale-[1.02]">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${cat.image}')` }} />
              </div>
              <p className="font-label-md text-label-md text-on-surface">{t(`categoriesNames.${cat.name}`)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-md h-[500px]">
        <div className="md:col-span-2 relative rounded-xl overflow-hidden ambient-shadow group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAm67ydUnwRsV8u6Q8Rh_sedD3nkDyHPeSw_-8h7xSktm-tMSTnCFWSdLZsRSG9p-fYb39UTKocqwdthIv6eHIX0Cbg8WMwNnHAn8pSYRYlxlFrfqzg5EAw4lU4ohCl-g4UdPbYZS5yEwo2kGow7Vaj4eIBEkwyB9_UX90kp7z16CM5pKVwBvIa1nW-LABDZ_g29fvTLQIBdl6z9XNZr3vV2E8WC1obcHOkM-E8s3938yRN3El7AmUq')" }} />
          <div className="absolute bottom-0 left-0 p-md z-20 space-y-xs">
            <h4 className="font-headline-md text-headline-md text-white">{t("banners.bakery")}</h4>
            <p className="text-white/80 font-body-md text-body-md">{t("banners.bakeryDesc")}</p>
          </div>
        </div>
        <div className="flex flex-col gap-md">
          <div className="flex-1 relative rounded-xl overflow-hidden ambient-shadow bg-secondary-container p-md flex flex-col justify-center">
            <h4 className="font-headline-md text-headline-md text-on-secondary-container">{t("banners.fastDelivery")}</h4>
            <p className="text-on-secondary-container/80 font-body-md text-body-md">{t("banners.fastDeliveryDesc")}</p>
            <span className="material-symbols-outlined text-on-secondary-container text-[64px] absolute -bottom-4 -right-4 opacity-20">local_shipping</span>
          </div>
          <div className="flex-1 relative rounded-xl overflow-hidden ambient-shadow group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10" />
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4a7nI2jodyKXoO31D3pFJpMVg4dR6NutKrkQ35UHd7aJrgMhZiZbeCHzyqEmQbmUo1A1-gOAWZyYKsx03Rj4f2Y8Z3hvWwcK_a03dw4XMl9MGJKYqdjlU9MDapAKG2hVInHTAwoMHao3ruXbDjbKm02VrLrkdNkcsTOQkFxg03a11dQLUPzjMtF2_X4tcm-8aD6IwiQdlP5M9EpQEhMITnaBglrfBOcUrR1pSomOHx-l0d2M2iIx6')" }} />
            <div className="absolute bottom-0 left-0 p-md z-20">
              <h4 className="font-headline-md text-headline-md text-white">{t("banners.wineCellar")}</h4>
              <p className="text-white/80 font-label-md text-label-md">{t("banners.wineCellarDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <div className="flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">{t("featured.title")}</h3>
          <Link href={`/${locale}/mercado`} className="text-primary font-label-md text-label-md hover:underline">
            {t("featured.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
          {PRODUCTS.map((p) => (
            <Link
              key={p.name}
              href={`/${locale}/produto/pao-de-agua-artesanal`}
              className="bg-white rounded-xl p-md ambient-shadow product-card space-y-sm flex flex-col group hover:-translate-y-1 transition-all"
            >
              <div className="relative h-48 bg-surface-container-low rounded-lg overflow-hidden mb-sm">
                <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${p.image}')` }} />
                {p.discount && <span className="absolute top-2 left-2 bg-error text-white font-label-sm text-label-sm px-2 py-0.5 rounded">{p.discount}</span>}
                {p.badge && <span className="absolute top-2 left-2 bg-secondary text-white font-label-sm text-label-sm px-2 py-0.5 rounded">{p.badge}</span>}
              </div>
              <h5 className="font-label-md text-label-md text-on-surface line-clamp-2">{p.name}</h5>
              <p className="font-body-md text-body-md text-on-surface-variant flex-grow">{p.category}</p>
              <div className="flex justify-between items-center pt-base">
                <div>
                  <p className="text-primary font-headline-md text-headline-md">{p.price}</p>
                  {p.oldPrice && <p className="text-outline line-through text-label-sm">{p.oldPrice}</p>}
                </div>
                <button
                  type="button"
                  className="bg-primary text-on-primary p-2 rounded-full hover:shadow-lg active:scale-90 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}