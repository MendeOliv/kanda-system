import Link from "next/link";

const SECTIONS = [
  {
    id: "introducao",
    title: "1. Introdução",
    body: [
      "Bem-vindo à Kanda Mercearia. Estes Termos e Condições regem a utilização do nosso website e serviços de entrega de produtos alimentares na Centralidade do Kilamba e arredores de Luanda.",
      "Ao aceder ou utilizar os nossos serviços, aceita cumprir estes termos. Se não concordar com algum ponto, pedimos que não utilize os nossos serviços.",
    ],
  },
  {
    id: "conta",
    title: "2. Conta de Utilizador",
    body: [
      "Para realizar encomendas necessita de criar uma conta. É responsável pela confidencialidade das suas credenciais e por todas as atividades realizadas na sua conta.",
    ],
    list: [
      "As informações fornecidas devem ser precisas, atuais e completas.",
      "O utilizador deve notificar-nos imediatamente de qualquer uso não autorizado da sua conta.",
      "Reservamo-nos o direito de suspender ou cancelar contas que violem estes termos.",
    ],
  },
  {
    id: "precos",
    title: "3. Preços e Produtos",
    body: [
      "Os preços são apresentados em Kwanzas (Kz) e incluem IVA à taxa legal em vigor. Reservamo-nos o direito de alterar preços sem aviso prévio.",
      "Embora nos esforcemos por manter a precisão, podem ocorrer erros na descrição ou imagem dos produtos. As imagens são meramente ilustrativas.",
    ],
    note: "Todos os preços apresentados estão sujeitos a alterações sem aviso prévio e incluem IVA à taxa legal em vigor, salvo indicação em contrário.",
  },
  {
    id: "pagamentos",
    title: "4. Pagamentos",
    body: [
      "Aceitamos pagamento na entrega (em dinheiro), Multicaixa Express e via AppyPay. O pagamento é devido no momento da encomenda ou na entrega, conforme o método escolhido.",
      "Todos os pagamentos são processados de forma segura e os dados bancários nunca são armazenados nos nossos sistemas.",
    ],
  },
  {
    id: "entregas",
    title: "5. Entregas",
    body: [
      "As entregas são realizadas na Centralidade do Kilamba e arredores. Os prazos de entrega variam consoante a zona e o tipo de serviço (Standard ou Express).",
      "Consulte a nossa Política de Entregas para informações detalhadas sobre prazos, zonas e taxas.",
    ],
  },
  {
    id: "responsabilidade",
    title: "6. Limitação de Responsabilidade",
    body: [
      "A Kanda Mercearia não será responsável por quaisquer danos indiretos resultantes da utilização do serviço, salvo nos casos previstos por lei.",
      "A nossa responsabilidade está limitada ao valor da encomenda em questão.",
    ],
  },
];

export default function TermosPage() {
  return (
    <main className="max-w-4xl mx-auto px-container-margin py-xl md:py-16">
      <Link href="/" className="inline-flex items-center text-primary hover:text-primary-container transition-colors font-label-bold text-label-bold mb-lg group">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] mr-xs group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Voltar ao Início
      </Link>

      <h1 className="font-h1 text-h1 md:text-[40px] text-on-background mb-xs">Termos e Condições</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">Última atualização: 15 de Novembro de 2024</p>

      {/* Índice */}
      <div className="mt-lg bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
        <h3 className="font-h3 text-h3 text-on-background mb-sm pb-xs border-b border-outline-variant">Índice</h3>
        <ul className="flex flex-col gap-xs font-body-sm text-body-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-on-surface-variant hover:text-primary transition-colors block py-xs px-xs rounded hover:bg-surface-container">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-lg space-y-md">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-outline-variant/30">
            <h2 className="font-h2 text-h2 text-on-background mb-sm">{s.title}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mb-sm text-on-surface-variant leading-relaxed">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="list-disc pl-lg space-y-xs">
                {s.list.map((li, i) => (
                  <li key={i} className="text-on-surface-variant leading-relaxed">{li}</li>
                ))}
              </ul>
            )}
            {s.note && (
              <p className="font-label-bold text-label-bold text-on-background mb-base flex items-center gap-xs mt-md">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">info</span>
              </p>
            )}
            {s.note && (
              <p className="text-on-surface-variant text-body-sm font-body-sm">{s.note}</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}