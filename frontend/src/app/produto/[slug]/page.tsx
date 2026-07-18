import Link from "next/link";

const RELATED = [
  { name: "Croissant de Manteiga", price: "600,00 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNzC8DnCO1dat42-gRKWjFlC3rBntWEdtNKTGtI7Up_Ynry2yMz9TRoDiLnDY82jOLhWL2Nsz81mFPO1jMfTbST72yxjLtWKB-jYOtp_s322Yp34g_sLeLqkgXg7-5R1yKnM9FkK8_7ytUQzwN_yMoVD1zrVhXhsJn6qpsZ9fsnMq3Hk4mFjjwPPJUvMtVMsyw6nH7m2PEu0PUah0aQlJgEjCRbXwXT8m__guS_NkO11g0iTxp4Yas" },
  { name: "Bolo de Milho Caseiro", price: "1.200,00 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrQf7z5FhZeVNtQWfBkWdHG4AtB_sfH4_w3fO8VO0I6i9Czuie8wkaKO_nNDA520Nku0vPpu8rJqh6HFynUJEdearquUk1_ajRqkueTaVrq0BJiSonIAznwi5AIAFTBMnsFtQb5rrwLA9-9HuESqFbJNGFECyt6tr1fLFRviiZUv03_yMXNvgedsd6M-UNj7PAoK08ifGfcW55BlQbOAaetHNk2GeT-qTxvRh-V8p1QEHmplbPmj8t" },
  { name: "Mel Orgânico do Planalto", price: "3.500,00 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQth3T-rsdbZRpWajH_SXLRRsdol8zo-5n2mQrF4i7Eb1_pzkJkZPsjaSjN4PXxjm1r9TXfe-p-M12soOUtw3kXHR4a3l4_n-aFWwJey-p9dkK1lCDFjra5JVUMttL6gWOAUPcZ9rveBEFvRPKmTlefShzzYI1gDB-qeIoZ7IZu8YW5dGdvAcqjjmJsP86wcjRtLsnaTwHETBp0cvpHghNDwTtczA0VULDg5aouLQtfPQDVGlAGeX_" },
  { name: "Doce de Manga 250g", price: "1.800,00 Kz", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyZ8sGU8KPgXGeIJenR3NcvC4X8tZSEiXKLbeTCudp3OsKsJn_4PS7SWEZ4te5TwxHBdBR3FB-U-LX62zpf8BNPGfaajqOUL3Duyo1FFKRdUNI57fIQJ4lHwoaLmGh3ijSq5LGtAjuOevlcJCyFHq5AtAJvvBrt9HIjQnJ0Y3YuQvwbvtIiHS-T6QhwA2_u9tuwDVe4xvKWo1HI5YbglYmyvclAIeQeHj1iXHVUb0iysuvywFE9YEn" },
];

export default function ProdutoPage({ params }: { params: { slug: string } }) {
  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg">
      <nav className="flex items-center gap-2 mb-md text-on-surface-variant text-label-md">
        <Link href="/mercado" className="hover:text-primary">Mercado</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/mercado" className="hover:text-primary">Padaria & Pastelaria</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface">{params.slug.replace(/-/g, " ")}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-start">
        <div className="space-y-base">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white ambient-shadow">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhiF36XMJZOCmL_K0DJAt8T8onhY1eTeCZ3GOxeZnZyupMen09kmRNlVdPPNP4G1lSiKsRLkdaxyXFWfGLE-V1bxSMG0Mu3-LLI93XV-I_owySxMwzEImZsRub-cLQ2OqL49WA7ZQl7hazUyf3IAg2x1n3ZGtcssc_W6GZ4ZznUaMAxVLtgHmPIGnbZ1qfqqb2KT-8LIYZIYcXxG3y07DmGibciAltsW8U-JxoRlOtbvOpyWnDSz2r" alt="" />
          </div>
          <div className="grid grid-cols-4 gap-base">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`aspect-square rounded-lg overflow-hidden border-2 ${i === 1 ? "border-primary" : "border-outline-variant"} cursor-pointer hover:border-primary transition-colors`}>
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnViq6Rs1XfUmg1W4ljs2-1Cy9DOPczAVmoXdOctSNfwJvS-iL05tfIMt16c-cRYM6YSBeln4E29ZbnXQn_6cQ50H3tBo9WwELpuYM5YpkJRKrsrUEbsHE6OV9b057nVl62jtP95wgbim193xz59fvuH4wZ8dQg8BxWaGOzmtF7bFno30_UBI-HNQaV0m5AufGOwqqgKbQr50zG2CqexhWl79riLO9dslc5baZ62s-saVDQO0KrEQe" alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-md">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm mb-base">Produção Local</span>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs">Pão de Água Artesanal</h1>
            <p className="text-on-surface-variant font-label-md">Categoria: Padaria & Pastelaria</p>
          </div>
          <div className="flex items-center gap-md py-base border-y border-outline-variant/30">
            <span className="text-headline-lg font-bold text-primary">350,00 Kz</span>
            <span className="text-on-surface-variant line-through text-body-md">450,00 Kz</span>
            <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-label-sm">-22%</span>
          </div>
          <div className="space-y-sm">
            <h3 className="font-label-md text-on-surface uppercase tracking-wider">Descrição</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              O nosso autêntico Pão de Água é produzido diariamente segundo métodos tradicionais. Com uma crosta estaladiça e um miolo leve e aerado.
            </p>
            <ul className="space-y-xs">
              <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Fornada fresca a cada 4 horas
              </li>
              <li className="flex items-center gap-2 text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                Ingredientes 100% naturais
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-md p-md bg-surface-container-low rounded-xl">
            <Link href="/carrinho" className="flex-1 bg-primary-container text-on-primary-container font-label-md py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all ambient-shadow">
              <span className="material-symbols-outlined">shopping_cart</span>
              Adicionar ao Carrinho
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-xl">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Produtos Relacionados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {RELATED.map((p) => (
            <div key={p.name} className="group bg-white rounded-xl overflow-hidden ambient-shadow hover:-translate-y-1 transition-all">
              <div className="aspect-square relative">
                <img className="w-full h-full object-cover" src={p.image} alt={p.name} />
              </div>
              <div className="p-sm">
                <h3 className="font-label-md text-on-surface truncate">{p.name}</h3>
                <p className="text-primary font-bold mt-1">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
