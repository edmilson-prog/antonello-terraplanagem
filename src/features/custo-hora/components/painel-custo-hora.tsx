import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  custoHoraPorEquipamento,
  type CustoHoraEquipamento,
} from "@/features/custo-hora/derivacoes";
import { DetalhamentoCustoDialog } from "@/features/custo-hora/components/detalhamento-custo-dialog";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  periodo: string;
}

export function PainelCustoHora({ periodo }: Props) {
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();

  const [selecionado, setSelecionado] = useState<CustoHoraEquipamento | null>(null);

  const resultados = useMemo(
    () =>
      custoHoraPorEquipamento(
        equipamentos,
        periodo,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
      ).sort((a, b) => (b.custo_por_hora ?? -1) - (a.custo_por_hora ?? -1)),
    [equipamentos, periodo, componentesCusto, abastecimentos, registrosManutencao, apontamentos, precosHoraMaquina],
  );

  const { isLoading, error, retry } = useMockResource(resultados);

  const nomeDoEquipamento = (equipamentoId: string) =>
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Equipamento";

  const custoTotalPeriodo = resultados.reduce((s, r) => s + r.custo_total, 0);
  const horasTotais = resultados.reduce((s, r) => s + r.horas_trabalhadas, 0);
  const custoMedioHora = horasTotais > 0 ? custoTotalPeriodo / horasTotais : null;
  const margensNegativas = resultados.filter((r) => r.margem_hora != null && r.margem_hora < 0).length;

  if (componentesCusto.length === 0) {
    return (
      <EmptyState
        icon="lucide:calculator"
        titulo="Configure os componentes de custo"
        descricao="Cadastre ao menos um componente de custo (fixo mensal ou variável por hora) na aba Componentes de Custo para começar a calcular o custo por hora."
      />
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          rotulo="Custo total no período"
          valor={formatBRL(custoTotalPeriodo)}
          icone="lucide:wallet"
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Custo médio por hora"
          valor={custoMedioHora != null ? formatBRL(custoMedioHora) : "—"}
          icone="lucide:gauge"
          isLoading={isLoading}
        />
        <KpiCard
          rotulo="Equipamentos com margem negativa"
          valor={String(margensNegativas)}
          icone="lucide:triangle-alert"
          variante={margensNegativas > 0 ? "alerta" : "neutro"}
          isLoading={isLoading}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Horas</th>
                <th className="px-4 py-3 font-medium">Custo/hora</th>
                <th className="px-4 py-3 font-medium">Preço (operada)</th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.equipamento_id} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {nomeDoEquipamento(r.equipamento_id)}
                    {r.configuracao_incompleta ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Config. incompleta
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatHorimetro(r.horas_trabalhadas)}</td>
                  <td className="px-4 py-3 font-mono">
                    {r.custo_por_hora != null ? formatBRL(r.custo_por_hora) : "Sem horas"}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {r.preco_hora != null ? formatBRL(r.preco_hora) : "Sem preço"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      r.margem_hora != null && r.margem_hora < 0 && "text-destructive",
                    )}
                  >
                    {r.margem_hora != null ? formatBRL(r.margem_hora) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelecionado(r)}>
                      Ver detalhamento
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <DetalhamentoCustoDialog
        equipamentoNome={selecionado ? nomeDoEquipamento(selecionado.equipamento_id) : null}
        resultado={selecionado}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      />
    </div>
  );
}
