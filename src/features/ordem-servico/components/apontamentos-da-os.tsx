import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { Apontamento } from "@/shared/types";

export function ApontamentosDaOS({ apontamentos }: { apontamentos: Apontamento[] }) {
  if (apontamentos.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem apontamentos ainda.</p>;
  }
  return (
    <ul className="space-y-2">
      {apontamentos.map((a) => {
        const equip = equipamentosStore.getById(a.equipamento_id);
        const op = operadoresStore.getById(a.operador_id);
        return (
          <li key={a.id} className="rounded-lg border bg-surface/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {op?.nome ?? "Operador"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {equip?.nome ?? "Equipamento"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusApontamentoBadge status={a.status} />
                {a.horas_trabalhadas != null ? (
                  <span className="font-mono text-xs text-foreground">
                    {formatHorimetro(a.horas_trabalhadas)}
                  </span>
                ) : null}
              </div>
            </div>
            {a.pendente_sync ? (
              <div className="mt-2">
                <SyncBadge />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
