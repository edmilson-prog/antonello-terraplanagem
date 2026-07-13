import { createFileRoute, Link } from "@tanstack/react-router";

const URL_PAGINA =
  "https://antonello-terraplanagem.lovable.app/blog/terraplanagem-ou-terraplenagem";

export const Route = createFileRoute("/blog/terraplanagem-ou-terraplenagem")({
  head: () => ({
    meta: [
      { title: "Terraplanagem ou Terraplenagem: qual o termo correto?" },
      {
        name: "description",
        content:
          "Terraplanagem ou terraplenagem? Entenda a diferença entre os dois termos, qual é o correto e como aparecem em contratos, propostas e obras de movimentação de terra.",
      },
      { property: "og:title", content: "Terraplanagem ou Terraplenagem: qual o termo correto?" },
      {
        property: "og:description",
        content:
          "Guia rápido sobre a grafia correta: terraplanagem ou terraplenagem? Diferença, uso técnico e qual termo usar em obras.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL_PAGINA },
    ],
    links: [{ rel: "canonical", href: URL_PAGINA }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Terraplanagem ou Terraplenagem: qual o termo correto?",
          description:
            "Guia rápido sobre a grafia correta — terraplanagem ou terraplenagem — e qual termo usar em contratos, propostas e obras.",
          author: { "@type": "Organization", name: "Antonello Terraplanagem" },
          publisher: { "@type": "Organization", name: "Antonello Terraplanagem" },
          mainEntityOfPage: URL_PAGINA,
          inLanguage: "pt-BR",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Terraplanagem ou terraplenagem: qual é o certo?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ambas as grafias estão registradas em dicionários da língua portuguesa, mas terraplenagem é considerada a forma preferencial no português culto. Terraplanagem é a variante mais usada no dia a dia das empresas do setor no Brasil, especialmente em contratos e nomes comerciais.",
              },
            },
            {
              "@type": "Question",
              name: "Existe diferença técnica entre terraplanagem e terraplenagem?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Não. Os dois termos descrevem o mesmo conjunto de serviços: escavação, transporte, espalhamento, nivelamento e compactação de solo. A escolha entre uma palavra e outra é estilística, não técnica.",
              },
            },
            {
              "@type": "Question",
              name: "Qual termo devo usar em contratos e propostas?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Use a forma que a sua empresa adota no nome fantasia e nos documentos. Se o nome registrado é 'Antonello Terraplanagem', mantenha 'terraplanagem' em todos os documentos para evitar inconsistência entre proposta, contrato e nota fiscal.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: ArtigoTerraplanagem,
});

function ArtigoTerraplanagem() {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <article className="mx-auto max-w-2xl space-y-6">
        <nav
          aria-label="Trilha"
          className="text-xs font-mono uppercase tracking-[0.15em] text-foreground-faint"
        >
          <Link to="/" className="hover:text-foreground">
            Antonello
          </Link>
          <span className="mx-2">/</span>
          <span>Guia</span>
        </nav>

        <header className="space-y-3">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Terraplanagem ou Terraplenagem: qual o termo correto?
          </h1>
          <p className="text-base text-muted-foreground">
            As duas grafias existem e aparecem em contratos, propostas e nomes comerciais — mas há
            uma forma preferida pelos dicionários e outra consagrada pelo uso do setor. Veja qual
            escolher.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">Resposta rápida</h2>
          <p className="text-base text-foreground">
            <strong>Terraplenagem</strong> é a forma preferencial nos dicionários de língua
            portuguesa. <strong>Terraplanagem</strong> é a variante mais usada no Brasil,
            especialmente nos nomes comerciais e contratos de empresas do setor. As duas estão
            corretas e descrevem exatamente o mesmo serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            De onde vem cada palavra
          </h2>
          <p className="text-base text-foreground">
            <em>Terraplenagem</em> vem de <em>terrapleno</em> — superfície de terra preparada e
            nivelada. É a construção mais antiga e a que aparece nos dicionários Aurélio, Houaiss e
            Michaelis como verbete principal.
          </p>
          <p className="text-base text-foreground">
            <em>Terraplanagem</em> é uma formação mais recente, derivada do verbo{" "}
            <em>terraplanar</em> (deixar a terra plana). Apesar de considerada por alguns gramáticos
            uma forma menos elegante, está dicionarizada, é amplamente usada e não constitui erro.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            O que o serviço abrange
          </h2>
          <p className="text-base text-foreground">
            Independente do nome, o serviço inclui as mesmas etapas:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-base text-foreground">
            <li>Limpeza do terreno e remoção da camada vegetal.</li>
            <li>Escavação e corte do solo nas cotas do projeto.</li>
            <li>Transporte do material para aterro ou bota-fora.</li>
            <li>Espalhamento, nivelamento e compactação por camadas.</li>
            <li>Acabamento da plataforma para receber pavimento ou fundação.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            Qual usar em contratos e propostas
          </h2>
          <p className="text-base text-foreground">
            Use a grafia que sua empresa adota no nome fantasia. Misturar "terraplenagem" no
            contrato e "terraplanagem" na nota fiscal cria ruído jurídico desnecessário. Na
            Antonello adotamos
            <strong> terraplanagem</strong> em todos os documentos — é a forma registrada na razão
            social e a mais reconhecida pelos clientes na região.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-card-foreground">Resumo</h2>
          <ul className="ml-5 list-disc space-y-1 text-base text-card-foreground">
            <li>As duas grafias existem e estão corretas.</li>
            <li>
              <strong>Terraplenagem</strong>: forma preferencial dos dicionários.
            </li>
            <li>
              <strong>Terraplanagem</strong>: forma mais comum no mercado brasileiro.
            </li>
            <li>Escolha uma e use de forma consistente em toda a documentação.</li>
          </ul>
        </section>

        <footer className="border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Precisa de uma proposta de terraplanagem no Paraná?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Fale com a equipe Antonello
            </Link>
            .
          </p>
        </footer>
      </article>
    </main>
  );
}
