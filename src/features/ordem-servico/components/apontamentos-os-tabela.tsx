import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { formatHorimetro } from "@/shared/lib/format";
import { BadgeAnomalia } from "@/features/ia/components/badge-anomalia";
import { detectarAnomalias } from "@/features/ia/mock/analitico";
import { anomaliaRevisoesStore } from "@/features/ia/anomalia-revisoes-store";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import type { Apontamento } from "@/shared/types";

function formatDiaMes(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function horimetroRange(a: Apontamento): string {
  const inicial = formatHorimetro(a.horimetro_inicial);
  if (a.horimetro_final == null) return `${inicial} → em andamento`;
  return `${inicial} → ${formatHorimetro(a.horimetro_final)}`;
}

// Tabela de apontamentos da OS para a retaguarda (Data/Operador/Equipamento/
// Horímetro/Horas, fiel ao mock OSDetail.jsx). Distinta da `ApontamentosDaOS`
// compartilhada com o app do operador (lista mobile-first) — layouts
// suficientemente diferentes (tabela desktop vs. cards touch) para não valer
// a pena unificar; a lógica de anomalia/sync é reaproveitada aqui também.
export function ApontamentosOSTabela({ apontamentos }: { apontamentos: Apontamento[] }) {
  const confirmadas = anomaliaRevisoesStore.useConfirmadas();
  const anomalias = detectarAnomalias(apontamentos);

  if (apontamentos.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Sem apontamentos ainda.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-wide text-foreground-faint">
            <th className="px-4 py-2 font-medium">Data</th>
            <th className="px-4 py-2 font-medium">Operador</th>
            <th className="px-4 py-2 font-medium">Equipamento</th>
            <th className="px-4 py-2 font-medium">Horímetro</th>
            <th className="px-4 py-2 text-right font-medium">Horas</th>
          </tr>
        </thead>
        <tbody>
          {apontamentos.map((a) => {
            const equip = equipamentosStore.getById(a.equipamento_id);
            const op = operadoresStore.getById(a.operador_id);
            const anomalia = anomalias.find((x) => x.apontamento_id === a.id);
            const mostrarAnomalia = anomalia && !confirmadas.has(a.id);
            return (
              <tr key={a.id} className="border-b last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {formatDiaMes(a.iniciado_em)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {op?.nome ?? "Operador"}
                    <StatusApontamentoBadge status={a.status} />
                    {a.pendente_sync ? <SyncBadge /> : null}
                  </div>
                  {mostrarAnomalia ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <BadgeAnomalia motivo={anomalia.motivo} severidade={anomalia.severidade} />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => anomaliaRevisoesStore.confirmarOk(a.id)}
                      >
                        Confirmar ok
                      </Button>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                      <Icon
                        icon={equip ? TIPO_ICONE[equip.tipo] : "lucide:truck"}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <span className="truncate text-muted-foreground">
                      {equip?.nome ?? "Equipamento"}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {horimetroRange(a)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono font-semibold text-foreground">
                  {a.horas_trabalhadas != null ? formatHorimetro(a.horas_trabalhadas) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
