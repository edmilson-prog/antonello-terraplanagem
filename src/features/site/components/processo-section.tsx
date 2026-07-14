interface Passo {
  numero: string;
  titulo: string;
  descricao: string;
}

const PASSOS: Passo[] = [
  {
    numero: "01",
    titulo: "Visita e orçamento",
    descricao: "Levantamento no local e proposta detalhada em até 48 horas.",
  },
  {
    numero: "02",
    titulo: "OS aberta e planejada",
    descricao: "Equipamentos, operadores e cronograma definidos na Ordem de Serviço.",
  },
  {
    numero: "03",
    titulo: "Execução apontada",
    descricao: "Horas registradas por horímetro no app de campo, dia a dia.",
  },
  {
    numero: "04",
    titulo: "Medição e NF",
    descricao: "Medição por etapa concluída e nota fiscal vinculada à OS.",
  },
];

export function ProcessoSection() {
  return (
    <section id="processo" className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Como trabalhamos
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold uppercase leading-tight text-foreground sm:text-4xl">
            Obra gerenciada, não improvisada
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Cada obra vira uma Ordem de Serviço no nosso sistema — você acompanha horas, medições
            e faturamento sem surpresa.
          </p>
        </div>

        <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((passo) => (
            <div key={passo.numero} className="rounded-xl border border-border bg-card p-5">
              <div className="font-mono text-[13px] font-semibold text-primary">
                {passo.numero}
              </div>
              <div className="my-3.5 h-[3px] overflow-hidden rounded-full bg-primary/15">
                <div className="h-full w-full rounded-full bg-primary" />
              </div>
              <h3 className="font-display text-[14.5px] font-bold uppercase tracking-wide text-foreground">
                {passo.titulo}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {passo.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
