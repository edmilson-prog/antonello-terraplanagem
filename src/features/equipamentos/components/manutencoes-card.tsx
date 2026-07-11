import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import {
  planosParaEquipamento,
  statusPlano,
  type StatusPlanoResultado,
} from "@/features/manutencao/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData, formatHorimetro } from "@/shared/lib/format";
import { CardPill, CardSecao } from "@/shared/components/card-secao";
import type { Equipamento, PlanoManutencao, StatusManutencao } from "@/shared/types";

const STATUS_LABEL: Record<StatusManutencao, string> = {
  em_dia: "Em dia",
  proxima: "Agendada",
  vencida: "Vencida",
};

const STATUS_CLASSE: Record<StatusManutencao, string> = {
  em_dia: "border-steel/40 bg-steel/15",
  proxima: "border-primary/50 bg-primary/20",
  vencida: "border-destructive/40 bg-destructive/15 text-destructive",
};

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium";

interface CandidatoUrgente {
  plano: PlanoManutencao;
  resultado: StatusPlanoResultado;
}

export function ManutencoesCard({ equipamento }: { equipamento: Equipamento }) {
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const doEquip = planosParaEquipamento(equipamento, planos);

  if (doEquip.length === 0) {
    return (
      <CardSecao titulo="Manutenções" icone="lucide:wrench">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
          <Icon icon="lucide:calendar-off" className="h-6 w-6 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">Sem plano de manutenção</p>
        </div>
      </CardSecao>
    );
  }

  const candidatos = doEquip.reduce<CandidatoUrgente[]>((acc, plano) => {
    const resultado = statusPlano(plano, equipamento, registros);
    if (resultado) acc.push({ plano, resultado });
    return acc;
  }, []);

  const proxima = candidatos.reduce<CandidatoUrgente | null>((maisUrgente, atual) => {
    if (!maisUrgente) return atual;
    const restantesAtual =
      atual.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    const restantesMaisUrgente =
      maisUrgente.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    return restantesAtual < restantesMaisUrgente ? atual : maisUrgente;
  }, null);

  const realizadas = registros
    .filter((r) => r.equipamento_id === equipamento.id && r.status === "realizada")
    .sort((a, b) => (b.realizada_em ?? "").localeCompare(a.realizada_em ?? ""));

  return (
    <CardSecao
      titulo="Manutenções"
      icone="lucide:wrench"
      acessorio={<CardPill>{doEquip.length} plano(s)</CardPill>}
      bodyClassName="space-y-2 p-2"
    >
      {proxima ? (
        <div className="rounded-lg border border-primary/25 bg-primary/10 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {proxima.plano.descricao}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Prevista em {formatHorimetro(proxima.resultado.registro.horimetro_previsto)}
              </p>
            </div>
            <span className={cn(PILL_BASE, "shrink-0", STATUS_CLASSE[proxima.resultado.status])}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {STATUS_LABEL[proxima.resultado.status]}
            </span>
          </div>
        </div>
      ) : null}

      <ul>
        {realizadas.length === 0 ? (
          <li className="px-3 py-3 text-sm text-muted-foreground">
            Nenhuma manutenção concluída registrada.
          </li>
        ) : (
          realizadas.map((r) => {
            const descricao = planos.find((p) => p.id === r.plano_id)?.descricao ?? "Manutenção";
            return (
              <li
                key={r.id}
                className="flex items-center gap-3.5 rounded-lg px-3 py-3 not-first:border-t not-first:border-border hover:bg-surface/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{descricao}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-foreground-faint">
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:gauge" className="h-3 w-3" />
                      {formatHorimetro(r.horimetro_realizado ?? 0)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="lucide:calendar" className="h-3 w-3" />
                      {formatData(r.realizada_em)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm text-foreground">
                  {r.custo != null ? formatBRL(r.custo) : "—"}
                </span>
                <span className={cn(PILL_BASE, "shrink-0", "border-steel/40 bg-steel/15")}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Concluída
                </span>
              </li>
            );
          })
        )}
      </ul>
    </CardSecao>
  );
}
