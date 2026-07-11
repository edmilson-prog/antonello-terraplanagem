import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import {
  planosParaEquipamento,
  statusPlano,
  type StatusPlanoResultado,
} from "@/features/manutencao/derivacoes";
import { formatHorimetro } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import type { Equipamento, PlanoManutencao, StatusManutencao } from "@/shared/types";

const HEALTH_LABEL: Record<StatusManutencao, string> = {
  em_dia: "Saudável",
  proxima: "Atenção",
  vencida: "Vencida",
};

const HEALTH_CLASSE: Record<StatusManutencao, string> = {
  em_dia: "border-steel/40 bg-steel/15",
  proxima: "border-primary/50 bg-primary/20",
  vencida: "border-destructive/40 bg-destructive/15 text-destructive",
};

interface CandidatoUrgente {
  plano: PlanoManutencao;
  resultado: StatusPlanoResultado;
}

// Health badge + barra de progresso do intervalo do plano de manutenção mais
// urgente (menor "horas restantes" entre os planos aplicáveis ao equipamento).
export function ProximaManutencaoCard({ equipamento }: { equipamento: Equipamento }) {
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const doEquip = planosParaEquipamento(equipamento, planos);

  const candidatos = doEquip.reduce<CandidatoUrgente[]>((acc, plano) => {
    const resultado = statusPlano(plano, equipamento, registros);
    if (resultado) acc.push({ plano, resultado });
    return acc;
  }, []);

  const maisUrgente = candidatos.reduce<CandidatoUrgente | null>((urgente, atual) => {
    if (!urgente) return atual;
    const restantesAtual =
      atual.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    const restantesUrgente =
      urgente.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    return restantesAtual < restantesUrgente ? atual : urgente;
  }, null);

  if (!maisUrgente) {
    return (
      <CardSecao titulo="Próxima manutenção" icone="lucide:calendar-clock">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:calendar-off" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Sem plano de manutenção</p>
        </div>
      </CardSecao>
    );
  }

  const { plano, resultado } = maisUrgente;
  const { status, registro } = resultado;
  const previsto = registro.horimetro_previsto;
  const intervalo = plano.intervalo_horas;
  const atual = equipamento.horimetro_atual;
  const base = previsto - intervalo;
  const restantes = previsto - atual;
  const progressoPct = Math.max(0, Math.min(100, ((atual - base) / intervalo) * 100));
  const vencida = status === "vencida";

  return (
    <CardSecao titulo="Próxima manutenção" icone="lucide:calendar-clock" bodyClassName="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{plano.descricao}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">A cada {intervalo} h</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            HEALTH_CLASSE[status],
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {HEALTH_LABEL[status]}
        </span>
      </div>

      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={cn("h-full rounded-full", vencida ? "bg-destructive" : "bg-primary")}
            style={{ width: `${progressoPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {restantes < 0
            ? `vencida há ${formatHorimetro(Math.abs(restantes))}`
            : `faltam ${formatHorimetro(Math.max(0, restantes))}`}
        </p>
      </div>

      <div className="flex justify-between font-mono text-xs text-foreground-faint">
        <span>Última {formatHorimetro(base)}</span>
        <span>Prevista {formatHorimetro(previsto)}</span>
      </div>
    </CardSecao>
  );
}
