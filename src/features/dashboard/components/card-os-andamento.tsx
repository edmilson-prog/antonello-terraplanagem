import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import { StatusOSBadge } from "@/features/ordem-servico/labels";
import { formatHorimetro } from "@/shared/lib/format";
import { formatDiaMes } from "@/features/dashboard/format";
import type { OSAtiva } from "@/features/dashboard/derivacoes";
import type { Cliente } from "@/shared/types";

export interface CardOsAndamentoProps {
  itens: OSAtiva[];
  clientes: Cliente[];
}

// Lista das OS ainda na rua (em andamento + abertas), no formato de linha do
// UI kit: número · obra · meta (cliente/horas/desde) · status.
export function CardOsAndamento({ itens, clientes }: CardOsAndamentoProps) {
  return (
    <CardSecao
      titulo="OS em andamento"
      icone="lucide:clipboard-list"
      acessorio={
        <Link
          to="/admin/ordens"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver todas
          <Icon icon="lucide:chevron-right" className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="p-2"
    >
      {itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma OS em aberto no momento.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {itens.map(({ os, status, horas }) => (
            <li key={os.id}>
              <Link
                to="/admin/ordens/$ordemId"
                params={{ ordemId: os.id }}
                className="flex items-center gap-3.5 rounded-lg px-3 py-3 transition-colors hover:bg-surface"
              >
                <span className="w-[74px] shrink-0 font-mono text-[13px] font-bold text-foreground">
                  {os.numero}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {os.obra_nome}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-faint">
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:user" className="h-3 w-3" aria-hidden />
                      {clientes.find((c) => c.id === os.cliente_id)?.nome ??
                        "Cliente não encontrado"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:clock" className="h-3 w-3" aria-hidden />
                      {formatHorimetro(horas)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:calendar" className="h-3 w-3" aria-hidden />
                      desde {formatDiaMes(os.aberta_em)}
                    </span>
                  </div>
                </div>
                <StatusOSBadge status={status} className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CardSecao>
  );
}
