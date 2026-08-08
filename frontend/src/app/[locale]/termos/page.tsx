const SECTIONS = [
  {
    id: "introducao",
    title: "1. Introdução",
    body: [
      "Bem-vindo à Kanda. Estes Termos e Condições regulam o acesso e a utilização do nosso website e dos serviços de entrega na zona do Kilamba e arredores. Ao utilizar os nossos serviços, o utilizador concorda em ficar vinculado a estes termos na sua totalidade.",
      "A Kanda reserva-se o direito de alterar, modificar ou atualizar estes termos a qualquer momento, sem aviso prévio. Recomendamos a revisão periódica desta página.",
    ],
  },
  {
    id: "conta",
    title: "2. Conta de Utilizador",
    body: [
      "Para realizar encomendas, poderá ser necessário criar uma conta. O utilizador é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades que ocorram na sua conta.",
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
      "Esforçamo-nos por garantir que as informações, descrições e preços dos produtos estejam corretos. No entanto, podem ocorrer erros. Se descobrirmos um erro no preço de um produto que encomendou, informá-lo-emos o mais rapidamente possível.",
    ],
    note: "Todos os preços apresentados estão sujeitos a alterações sem aviso prévio e incluem IVA à taxa legal em vigor, salvo indicação em contrário.",
  },
  {
    id: "pagamentos",
    title: "4. Pagamentos",
    body: [
      "Aceitamos várias formas de pagamento para sua conveniência. O pagamento deve ser efetuado no momento da confirmação da encomenda ou no ato da entrega, dependendo da modalidade escolhida.",
      "Em caso de suspeita de fraude, a Kanda reserva-se o direito de cancelar a transação e notificar as autoridades competentes.",
    ],
  },
];

const INDEX = [
  { id: "introducao", label: "1. Introdução" },
  { id: "conta", label: "2. Conta de Utilizador" },
  { id: "precos", label: "3. Preços e Produtos" },
  { id: "pagamentos", label: "4. Pagamentos" },
  { id: "entregas", label: "5. Entregas" },
  { id: "responsabilidade", label: "6. Limitação de Responsabilidade" },
];

export default function TermosPage() {
  return (
    <main className="max-w-[56rem] mx-auto px-gutter py-lg md:py-16 min-h-screen">
      <header className="mb-lg border-b border-outline-variant pb-md">
        <a href="/" className="inline-flex items-center text-primary hover:text-primary-container transition-colors font-label-md text-label-md mb-lg group">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px] mr-xs group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Voltar à página inicial
        </a>
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs">Termos e Condições</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Última atualização: 15 de Novembro de 2024</p>
      </header>

      <div className="flex flex-col md:flex-row gap-lg relative">
        <aside className="w-full md:w-1/3 hidden md:block">
          <nav className="sticky top-lg bg-surface-container-lowest rounded-lg border border-outline-variant p-md ambient-shadow">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm pb-xs border-b border-outline-variant">Índice</h3>
            <ul className="flex flex-col gap-xs font-body-md text-body-md">
              {INDEX.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-on-surface-variant hover:text-primary transition-colors block py-xs px-xs rounded hover:bg-surface-container">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="w-full md:w-2/3">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="mb-lg scroll-mt-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">{section.title}</h2>
              {Array.isArray(section.body) ? (
                section.body.map((paragraph) => (
                  <p key={paragraph} className="mb-sm text-on-surface-variant leading-relaxed">{paragraph}</p>
                ))
              ) : (
                <p className="mb-sm text-on-surface-variant leading-relaxed">{section.body}</p>
              )}
              {section.list && (
                <ul className="list-disc pl-md mb-sm text-on-surface-variant space-y-base marker:text-primary">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.note && (
                <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant mb-sm">
                  <p className="font-label-md text-label-md text-on-surface mb-base flex items-center gap-xs">
                    <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">info</span>
                    Nota Importante sobre Preços
                  </p>
                  <p className="text-on-surface-variant text-body-md font-body-md">{section.note}</p>
                </div>
              )}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}