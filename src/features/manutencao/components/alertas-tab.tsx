import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { StatusManutencaoBadge } from "@/features/manutencao/labels";
import { formatHorimetro } from "@/shared/lib/format";
import type { AlertaManutencao } from "@/features/manutencao/derivacoes";

interface AlertasTabProps {
  alertas: AlertaManutencao[];
}

export function AlertasTab({ alertas }: AlertasTabProps) {
  if (alertas.length === 0) {
    return (
      <EmptyState
        icon="lucide:circle-check"
        titulo="Nada para revisar"
        descricao="Nenhum equipamento com manutenção próxima ou vencida no momento."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {alertas.map((alerta) => (
        <li
          key={`${alerta.equipamento.id}-${alerta.plano.id}`}
          className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-display font-bold text-card-foreground">
                {alerta.equipamento.nome}
              </div>
              <StatusManutencaoBadge status={alerta.status} />
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">{alerta.plano.descricao}</div>
            <div className="mt-0.5 font-mono text-xs text-foreground-faint">
              Horímetro atual: {formatHorimetro(alerta.equipamento.horimetro_atual)} · Previsto:{" "}
              {formatHorimetro(alerta.registro.horimetro_previsto)}
            </div>
          </div>
          <Button asChild size="sm" className="gap-1.5 sm:shrink-0">
            <Link
              to="/admin/manutencao/registrar/$registroId"
              params={{ registroId: alerta.registro.id }}
            >
              <Icon icon="lucide:wrench" className="h-4 w-4" />
              Registrar manutenção
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}
