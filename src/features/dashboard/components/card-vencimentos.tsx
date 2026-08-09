import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDiaMes } from "@/features/dashboard/format";
import { cn } from "@/lib/utils";
import type { VencimentoProximo } from "@/features/dashboard/derivacoes";
import type { Cliente } from "@/shared/types";

export interface CardVencimentosProps {
  itens: VencimentoProximo[]; // já ordenados por vencimento
  clientes: Cliente[];
}

// Contas a receber em aberto mais próximas do vencimento (vencidas no topo).
export function CardVencimentos({ itens, clientes }: CardVencimentosProps) {
  const total = itens.reduce((soma, i) => soma + i.conta.valor, 0);

  return (
    <CardSecao
      titulo="Vencimentos próximos"
      icone="lucide:wallet"
      acessorio={itens.length > 0 ? <CardPill>{formatBRL(total)}</CardPill> : null}
      bodyClassName="p-2"
    >
      {itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma conta a receber em aberto.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {itens.map(({ conta, documento, vencida }) => (
            <li key={conta.id}>
              <Link
                to="/admin/financeiro"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                    vencida ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
                  )}
                >
                  <Icon
                    icon={vencida ? "lucide:circle-alert" : "lucide:file-check"}
                    className="h-4 w-4"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold text-foreground">
                    {documento} — {clientes.find((c) => c.id === conta.cliente_id)?.nome ?? "—"}
                  </div>
                  <div className="text-[11.5px] text-foreground-faint">
                    {vencida ? "venceu" : "vence"} {formatDiaMes(conta.vencimento)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {formatBRL(conta.valor)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                      vencida
                        ? "border-destructive/40 bg-destructive/15 text-destructive"
                        : "border-primary/50 bg-primary/20 text-foreground",
                    )}
                  >
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {vencida ? "Vencido" : "A vencer"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
