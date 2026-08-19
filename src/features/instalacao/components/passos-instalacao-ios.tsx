import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";

/*
 * Passo a passo do "Adicionar à Tela de Início" do iOS — o único caminho de
 * instalação no iPhone, já que o Safari não dispara `beforeinstallprompt`.
 *
 * Fonte única do texto: o convite (banner do Hoje e cartão do Perfil) e o
 * controle de avisos do PRD-020 mostram exatamente estes passos.
 */

const PASSOS = [
  {
    icone: "lucide:share",
    texto: (
      <>
        Toque em <b className="font-semibold text-foreground">Compartilhar</b>, na barra de baixo do
        Safari.
      </>
    ),
  },
  {
    icone: "lucide:square-plus",
    texto: (
      <>
        Role e escolha <b className="font-semibold text-foreground">Adicionar à Tela de Início</b>.
      </>
    ),
  },
  {
    icone: "lucide:smartphone",
    texto: (
      <>
        Abra o app pelo ícone novo. Você entra outra vez com o{" "}
        <b className="font-semibold text-foreground">seu PIN</b> — é a última.
      </>
    ),
  },
];

export function PassosInstalacaoIOS({ id, className }: { id?: string; className?: string }) {
  return (
    <ol
      id={id}
      className={cn(
        "mt-3 flex flex-col gap-2.5 border-t border-border-soft pt-3 text-[12px] leading-snug text-muted-foreground",
        className,
      )}
    >
      {PASSOS.map((passo, indice) => (
        <li key={passo.icone} className="flex items-start gap-2.5">
          <span
            aria-hidden
            className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-[11px] font-semibold text-primary"
          >
            {indice + 1}
          </span>
          <span className="min-w-0 flex-1 pt-0.5">{passo.texto}</span>
          <Icon icon={passo.icone} aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        </li>
      ))}
    </ol>
  );
}
