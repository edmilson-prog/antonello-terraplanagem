import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { SyncBadge } from "@/shared/components/sync-badge";
import { StatusApontamentoBadge } from "@/features/apontamento/components/status-apontamento-badge";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { Apontamento } from "@/shared/types";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { statusEquipamento } from "@/features/manutencao/derivacoes";
import { ManutencaoIndicador } from "@/features/manutencao/components/manutencao-indicador";

export function ApontamentoCard({ apontamento }: { apontamento: Apontamento }) {
  const equipamento = equipamentosStore.getById(apontamento.equipamento_id);
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const statusManutencao = equipamento ? statusEquipamento(equipamento, planos, registros) : null;
  const emAndamento = apontamento.status === "em_andamento";

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">
            {equipamento?.nome ?? "Equipamento"}
          </div>
          <div className="mt-0.5 font-mono text-xs text-foreground-faint">
            Início: {formatHorimetro(apontamento.horimetro_inicial)}
            {apontamento.horas_trabalhadas != null
              ? ` · ${apontamento.horas_trabalhadas} h trabalhadas`
              : ""}
          </div>
        </div>
        <StatusApontamentoBadge status={apontamento.status} />
      </div>

      {statusManutencao === "proxima" || statusManutencao === "vencida" ? (
        <div className="mt-3">
          <ManutencaoIndicador status={statusManutencao} />
        </div>
      ) : null}

      {apontamento.pendente_sync ? (
        <div className="mt-3">
          <SyncBadge />
        </div>
      ) : null}

      <div className="mt-3 flex justify-end">
        <Link
          to="/app/apontamento/$apontamentoId"
          params={{ apontamentoId: apontamento.id }}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-primary hover:underline"
        >
          {emAndamento ? "Finalizar" : "Ver detalhes"}
          <Icon icon="lucide:arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
