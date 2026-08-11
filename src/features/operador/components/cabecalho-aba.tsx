import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

/*
 * Cabeçalho das abas do App de Campo (`.ac-head`). A aba "Hoje" usa a versão
 * completa (avatar + saudação + sino + selo de sincronização); as demais usam
 * só título e subtítulo, já dentro da área de rolagem.
 */

export function CabecalhoAba({
  titulo,
  subtitulo,
  avatar,
  acoes,
  className,
}: {
  titulo: string;
  subtitulo: string;
  avatar?: ReactNode;
  acoes?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-4 pb-1 pt-3.5", className)}>
      {avatar}
      <div className="min-w-0 flex-1">
        <strong className="block truncate font-display text-[19px] font-extrabold uppercase leading-[1.1] tracking-[0.01em] text-foreground">
          {titulo}
        </strong>
        <span className="block truncate text-xs text-foreground-faint">{subtitulo}</span>
      </div>
      {acoes}
    </div>
  );
}

export function SeloSincronizacao({
  pendentes,
  ultimaSincronizacao,
}: {
  pendentes: number;
  ultimaSincronizacao: string | null;
}) {
  const emDia = pendentes === 0;
  return (
    <Link
      to="/app/sincronizacao"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10.5px] font-semibold",
        emDia
          ? "border-success/30 bg-success/15 text-success-foreground"
          : "border-primary/28 bg-primary/12 text-primary",
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {emDia
        ? `Sincronizado${ultimaSincronizacao ? ` · ${ultimaSincronizacao}` : ""}`
        : `${pendentes} no aparelho`}
    </Link>
  );
}
