import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { alertasManutencao } from "@/features/manutencao/derivacoes";
import { StatusManutencaoBadge } from "@/features/manutencao/labels";
import { horasRestantesAlerta } from "@/features/dashboard-operacional/derivacoes";
import { numero } from "@/features/retaguarda/format";

export function TabelaManutencaoPreditiva() {
  const equipamentos = equipamentosStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();
  const { isLoading, error, retry } = useMockResource(equipamentos);

  const alertas = useMemo(
    () => alertasManutencao(equipamentos, planos, registros),
    [equipamentos, planos, registros],
  );

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-card-foreground">Manutenção preditiva</h2>
        <p className="text-xs text-muted-foreground">Alertas por horímetro — próxima ou vencida</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button type="button" onClick={retry} className="text-sm font-semibold text-primary hover:underline">
            Tentar novamente
          </button>
        </div>
      ) : alertas.length === 0 ? (
        <EmptyState
          icon="lucide:circle-check"
          titulo="Tudo em dia"
          descricao="Nenhum equipamento com manutenção próxima ou vencida."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-[11px] uppercase tracking-wide text-foreground-faint">
                <th className="pb-2 pr-4 font-mono font-normal">Equipamento</th>
                <th className="pb-2 pr-4 font-mono font-normal">Alerta</th>
                <th className="pb-2 pr-4 font-mono font-normal">Horas restantes</th>
                <th className="pb-2 font-mono font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => {
                const horas = horasRestantesAlerta(alerta);
                return (
                  <tr key={`${alerta.equipamento.id}-${alerta.plano.id}`} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-semibold text-card-foreground">{alerta.equipamento.nome}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{alerta.plano.descricao}</td>
                    <td className="py-2 pr-4 font-mono text-card-foreground">
                      {horas <= 0 ? `${numero.format(Math.abs(horas))} h vencidas` : `${numero.format(horas)} h`}
                    </td>
                    <td className="py-2">
                      <StatusManutencaoBadge status={alerta.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
