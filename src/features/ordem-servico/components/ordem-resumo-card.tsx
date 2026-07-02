import { StatusOSBadge, MODELO_LABEL } from "@/features/ordem-servico/labels";
import { statusEfetivoOS, totalHorasOS, totalMetragemOS } from "@/features/ordem-servico/derivacoes";
import { SyncBadge } from "@/shared/components/sync-badge";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { Apontamento, OrdemServico } from "@/shared/types";

export function OrdemResumoCard({
  ordem,
  apontamentos,
}: {
  ordem: OrdemServico;
  apontamentos: Apontamento[];
}) {
  const cliente = clientesStore.getById(ordem.cliente_id);
  const status = statusEfetivoOS(ordem, apontamentos);
  const total = totalHorasOS(ordem.id, apontamentos);
  const totalMetros = totalMetragemOS(ordem.id, apontamentos);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="font-mono text-sm font-semibold text-foreground">{ordem.numero}</div>
          <h2 className="font-display text-xl font-bold text-card-foreground">
            {cliente?.nome ?? "Cliente"}
          </h2>
          <p className="text-sm text-muted-foreground">{ordem.obra_nome}</p>
          {ordem.endereco ? (
            <p className="text-xs text-foreground-faint">{ordem.endereco}</p>
          ) : null}
        </div>
        <StatusOSBadge status={status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border bg-surface px-2.5 py-0.5 text-xs text-muted-foreground">
          {MODELO_LABEL[ordem.modelo_cobranca]}
        </span>
        {ordem.modelo_cobranca === "hora_maquina" ? (
          <span className="font-mono text-sm text-foreground">
            {formatHorimetro(total)} no total
          </span>
        ) : (
          <span className="font-mono text-sm text-foreground">
            {totalMetros > 0 ? `${totalMetros} m` : "metragem pendente"}
            {ordem.diametro_broca_mm != null ? ` · Ø${ordem.diametro_broca_mm}mm` : ""}
          </span>
        )}
        {ordem.pendente_sync ? <SyncBadge /> : null}
      </div>
    </div>
  );
}
