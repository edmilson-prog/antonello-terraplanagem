import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

export interface DocumentoHeroQuickfact {
  rotulo: string;
  valor: ReactNode; // string ou nó (ex.: <Link> da OS)
  mono?: boolean;
}

export interface DocumentoHeroProps {
  icone: string;
  numero: string;
  titulo?: string;
  badges?: ReactNode;
  quickfacts: DocumentoHeroQuickfact[];
  acoes?: ReactNode;
}

// Casca do hero para páginas de detalhe "documento" (OS, orçamento, faturamento,
// comprovante). Mesma estética do cliente-hero: card em gradiente, tile de ícone,
// número em mono, badges à direita, quickfacts e slot de ações.
export function DocumentoHero({ icone, numero, titulo, badges, quickfacts, acoes }: DocumentoHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-card to-surface p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          aria-hidden
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg"
        >
          <Icon icon={icone} className="h-9 w-9" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground sm:text-3xl">{numero}</h1>
            {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
          </div>
          {titulo ? (
            <p className="mt-1 font-display font-bold text-card-foreground">{titulo}</p>
          ) : null}

          {quickfacts.length > 0 ? (
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {quickfacts.map((q) => (
                <div key={q.rotulo} className="flex flex-col gap-1">
                  <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
                    {q.rotulo}
                  </dt>
                  <dd className={q.mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
                    {q.valor}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {acoes ? <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div> : null}
      </div>
    </section>
  );
}
