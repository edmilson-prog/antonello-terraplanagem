import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardPill, CardSecao } from "@/shared/components/card-secao";
import { StatusOrcamentoBadge } from "@/features/orcamentos/labels";
import { formatBRL } from "@/features/retaguarda/format";
import type { Orcamento } from "@/shared/types";

export function OrcamentosClienteCard({ orcamentos }: { orcamentos: Orcamento[] }) {
  return (
    <CardSecao
      titulo="Orçamentos"
      icone="lucide:file-spreadsheet"
      acessorio={<CardPill>{orcamentos.length} no total</CardPill>}
      bodyClassName="p-2"
    >
      {orcamentos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:file-x" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">
            Nenhum orçamento registrado para este cliente.
          </p>
        </div>
      ) : (
        <ul>
          {orcamentos.map((o) => (
            <li key={o.id} className="not-first:border-t not-first:border-border">
              <Link
                to="/admin/orcamentos/$orcamentoId"
                params={{ orcamentoId: o.id }}
                className="flex items-center gap-3.5 rounded-lg px-3 py-3 hover:bg-surface/50 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="w-24 shrink-0 font-mono text-[13px] font-bold text-foreground">
                  {o.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {o.descricao_obra}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-foreground-faint">
                    {formatBRL(o.valor_total)}
                  </div>
                </div>
                <StatusOrcamentoBadge status={o.status} className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
