import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { Faturamento } from "@/shared/types";

export function AFaturarCard({ rascunhos }: { rascunhos: Faturamento[] }) {
  const total = rascunhos.reduce((s, f) => s + f.valor_total, 0);
  return (
    <CardSecao
      titulo="A faturar"
      icone="lucide:clipboard-list"
      acessorio={<CardPill>{formatBRL(total)}</CardPill>}
    >
      {rascunhos.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Nenhum rascunho aguardando emissão.</p>
      ) : (
        <div className="space-y-2 p-4">
          {rascunhos.map((f) => {
            const os = ordensStore.obter(f.os_id);
            return (
              <div
                key={f.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span className="font-mono text-xs font-semibold text-foreground">
                  {os?.numero ?? "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-card-foreground">
                    {os?.obra_nome ?? "—"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {clientesStore.getById(f.cliente_id)?.nome ?? "—"}
                  </div>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {formatBRL(f.valor_total)}
                </span>
                <Link
                  to="/admin/faturamento/$faturamentoId"
                  params={{ faturamentoId: f.id }}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface"
                >
                  <Icon icon="lucide:file-check" className="h-3.5 w-3.5" aria-hidden />
                  Emitir
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </CardSecao>
  );
}
