import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import {
  rankingEquipamentosPorMargem,
  rankingObrasPorMargem,
} from "@/features/gerencial/derivacoes";
import type { PeriodoGerencial } from "@/features/gerencial/periodo-gerencial";
import { formatPercentual } from "@/features/rentabilidade/format";
import { formatBRL } from "@/features/retaguarda/format";
import { cn } from "@/lib/utils";

interface Props {
  tipo: "equipamento" | "obra";
  periodo: PeriodoGerencial;
}

export function RankingMargem({ tipo, periodo }: Props) {
  const navigate = useNavigate();
  const equipamentos = equipamentosStore.useAll();
  const apontamentos = apontamentosStore.useTodos();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useCompletos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const faturamentos = faturamentosStore.useTodos();
  const ordens = ordensStore.useTodas();

  const resultadosEquipamento = useMemo(
    () =>
      tipo === "equipamento"
        ? rankingEquipamentosPorMargem(
            equipamentos,
            periodo,
            componentesCusto,
            abastecimentos,
            registrosManutencao,
            apontamentos,
            precosHoraMaquina,
            faturamentos,
          )
        : [],
    [
      tipo,
      equipamentos,
      periodo,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    ],
  );

  const resultadosObra = useMemo(
    () =>
      tipo === "obra"
        ? rankingObrasPorMargem(
            ordens,
            faturamentos,
            periodo,
            equipamentos,
            componentesCusto,
            abastecimentos,
            registrosManutencao,
            apontamentos,
            precosHoraMaquina,
          )
        : [],
    [
      tipo,
      ordens,
      faturamentos,
      periodo,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
    ],
  );

  const linhas =
    tipo === "equipamento"
      ? resultadosEquipamento.map((r) => ({
          chave: r.equipamento_id,
          nome: equipamentos.find((e) => e.id === r.equipamento_id)?.nome ?? r.equipamento_id,
          margem: r.margem,
          margemPercentual: r.margem_percentual,
          custoIncompleto: r.custo_incompleto,
          onVerDetalhe: () => navigate({ to: "/admin/rentabilidade" }),
        }))
      : resultadosObra.map((r) => ({
          chave: r.os_id,
          nome: r.os_numero,
          margem: r.margem,
          margemPercentual: r.margem_percentual,
          custoIncompleto: r.custo_incompleto,
          onVerDetalhe: () => navigate({ to: "/admin/rentabilidade" }),
        }));

  const { isLoading, error, retry } = useMockResource(linhas);
  const titulo = tipo === "equipamento" ? "Margem por equipamento" : "Margem por obra";

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 font-display text-base font-bold text-card-foreground">{titulo}</h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      ) : linhas.length === 0 ? (
        <EmptyState
          icon="lucide:trending-up"
          titulo="Sem dados no período"
          descricao="Nenhum resultado de rentabilidade no período selecionado."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                <th className="px-4 py-3 font-medium">
                  {tipo === "equipamento" ? "Equipamento" : "OS"}
                </th>
                <th className="px-4 py-3 font-medium">Margem</th>
                <th className="px-4 py-3 font-medium">Margem %</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.chave} className="border-b last:border-b-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {l.nome}
                    {l.custoIncompleto ? (
                      <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-normal text-foreground-faint">
                        Margem não confiável
                      </span>
                    ) : null}
                    {l.margem < 0 ? (
                      <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                        Prejuízo
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-mono font-semibold",
                      l.margem < 0 && "text-destructive",
                    )}
                  >
                    {formatBRL(l.margem)}
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPercentual(l.margemPercentual)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={l.onVerDetalhe}>
                      Ver detalhamento
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
