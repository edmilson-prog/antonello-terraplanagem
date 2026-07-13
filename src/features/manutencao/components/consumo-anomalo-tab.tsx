import { Icon } from "@iconify/react";
import { EmptyState } from "@/shared/components/empty-state";
import type { AlertaConsumoAnomalo } from "@/features/ia/types";
import type { Equipamento } from "@/shared/types";

interface ConsumoAnomaloTabProps {
  alertas: AlertaConsumoAnomalo[];
  equipamentos: Equipamento[];
}

export function ConsumoAnomaloTab({ alertas, equipamentos }: ConsumoAnomaloTabProps) {
  if (alertas.length === 0) {
    return (
      <EmptyState
        icon="lucide:circle-check"
        titulo="Nenhum consumo fora da curva"
        descricao="Nenhum equipamento com consumo de diesel 30% acima da média da frota — ou dados insuficientes para comparar."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {alertas.map((alerta) => {
        const equipamento = equipamentos.find((e) => e.id === alerta.equipamento_id);
        return (
          <li
            key={alerta.equipamento_id}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-card-foreground">
                  {equipamento?.nome ?? "Equipamento"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                  <Icon icon="lucide:sparkles" className="h-3 w-3" />
                  IA
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Consumo anômalo — possível problema mecânico (distinto do alerta preventivo por
                horas).
              </p>
            </div>
            <div className="shrink-0 text-right font-mono text-xs text-foreground">
              {alerta.consumo_medio_l_h} l/h
              <div className="text-foreground-faint">
                +{alerta.percentual_acima}% vs. {alerta.media_frota_l_h} l/h da frota
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
