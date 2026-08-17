import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardPill } from "@/shared/components/card-secao";
import { VisaoExecutiva } from "@/features/gerencial/components/visao-executiva";
import { mesReferencia, rotuloMes } from "@/shared/lib/periodo-mensal";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import {
  periodoTerminandoEm,
  periodoAnterior,
  mesesDoPeriodo,
  type PeriodoGerencial,
} from "@/features/gerencial/periodo-gerencial";
import { serieMensalFaturamento, serieMensalCustoMargem } from "@/features/gerencial/derivacoes";
import { SeletorPeriodoGerencial } from "@/features/gerencial/components/seletor-periodo-gerencial";
import { NumeroChaveCard } from "@/features/gerencial/components/numero-chave-card";
import { GraficoEvolucaoFaturamento } from "@/features/gerencial/components/grafico-evolucao-faturamento";
import { GraficoReceitaCustoMargem } from "@/features/gerencial/components/grafico-receita-custo-margem";
import { GraficoHorasEquipamento } from "@/features/gerencial/components/grafico-horas-equipamento";
import { GraficoUtilizacaoDiesel } from "@/features/gerencial/components/grafico-utilizacao-diesel";
import { RankingMargem } from "@/features/gerencial/components/ranking-margem";
import { PipelineConsolidadoCard } from "@/features/gerencial/components/pipeline-consolidado-card";
import { CardInsight } from "@/features/ia/components/card-insight";
import { PrevisaoCaixaCard } from "@/features/ia/components/previsao-caixa-card";
import { gerarInsight } from "@/features/ia/mock/analitico";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { brl } from "@/features/retaguarda/format";

// Mês mais recente com dado real (não `new Date()` — a fase mockada tem uma
// "data corrente" fixa nos mocks, e o painel deve refletir os dados que
// existem, não o relógio da máquina de quem está rodando o app).
function mesMaisRecenteComDados(): string {
  const datas = [
    ...apontamentosStore.listar().map((a) => a.finalizado_em ?? a.iniciado_em),
    ...faturamentosStore.listar().map((f) => f.faturado_em ?? f.gerado_em),
  ].filter((d): d is string => d != null);
  const maisRecente = datas.sort().at(-1);
  return maisRecente ? mesReferencia(new Date(maisRecente)) : mesReferencia(new Date());
}

export function GerencialPage() {
  const mesMaisRecente = useMemo(() => mesMaisRecenteComDados(), []);
  const [periodo, setPeriodo] = useState<PeriodoGerencial>(() =>
    periodoTerminandoEm("ano", mesMaisRecente),
  );

  const meses = useMemo(() => mesesDoPeriodo(periodo), [periodo]);
  const periodoComparativo = useMemo(() => periodoAnterior(periodo), [periodo]);
  const mesesComparativo = useMemo(() => mesesDoPeriodo(periodoComparativo), [periodoComparativo]);

  const faturamentos = faturamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();
  const componentesCusto = componentesCustoStore.useAll();
  const abastecimentos = abastecimentosStore.useTodos();
  const registrosManutencao = registrosManutencaoStore.useCompletos();
  const apontamentos = apontamentosStore.useTodos();
  const precosHoraMaquina = precoHoraMaquinaStore.useAll();
  const contasReceber = contasReceberStore.useTodas();
  const clientes = clientesStore.useAll();

  const totalAtual = useMemo(
    () => serieMensalFaturamento(meses, faturamentos).reduce((s, p) => s + p.faturado, 0),
    [meses, faturamentos],
  );
  const totalAnterior = useMemo(
    () =>
      serieMensalFaturamento(mesesComparativo, faturamentos).reduce((s, p) => s + p.faturado, 0),
    [mesesComparativo, faturamentos],
  );

  const margemAtual = useMemo(
    () =>
      serieMensalCustoMargem(
        meses,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ).reduce((s, p) => s + p.margem, 0),
    [
      meses,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    ],
  );
  const margemAnterior = useMemo(
    () =>
      serieMensalCustoMargem(
        mesesComparativo,
        equipamentos,
        componentesCusto,
        abastecimentos,
        registrosManutencao,
        apontamentos,
        precosHoraMaquina,
        faturamentos,
      ).reduce((s, p) => s + p.margem, 0),
    [
      mesesComparativo,
      equipamentos,
      componentesCusto,
      abastecimentos,
      registrosManutencao,
      apontamentos,
      precosHoraMaquina,
      faturamentos,
    ],
  );

  const rotuloPeriodo =
    periodo.mesInicio === periodo.mesFim
      ? rotuloMes(periodo.mesFim)
      : `${rotuloMes(periodo.mesInicio)} — ${rotuloMes(periodo.mesFim)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Painel Gerencial
        </h1>
        <CardPill>{rotuloPeriodo}</CardPill>
        <div className="ml-auto">
          <SeletorPeriodoGerencial
            periodo={periodo}
            mesMaisRecente={mesMaisRecente}
            onChange={setPeriodo}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground md:text-base">
        Evolução, margem e rankings — visão consolidada para decisão.
      </p>

      {/* A aba executiva é o desenho do UI kit; a de análises guarda os blocos
          do PRD-016, que o kit não desenha mas o Leonardo já usa. */}
      <Tabs defaultValue="executiva" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executiva">Visão executiva</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="executiva">
          <VisaoExecutiva periodo={periodo} />
        </TabsContent>

        <TabsContent value="analises" className="space-y-4">
          <CardInsight
            vazio={totalAtual === 0 && margemAtual === 0}
            gerar={() => gerarInsight({ totalAtual, totalAnterior, margemAtual, margemAnterior })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <NumeroChaveCard
              rotulo="Faturado no período"
              valorAtual={totalAtual}
              valorAnterior={totalAnterior}
              formatar={(v) => brl.format(v)}
              icone="lucide:receipt"
            />
            <NumeroChaveCard
              rotulo="Margem no período (hora-máquina)"
              valorAtual={margemAtual}
              valorAnterior={margemAnterior}
              formatar={(v) => brl.format(v)}
              icone="lucide:trending-up"
            />
          </div>

          <GraficoEvolucaoFaturamento meses={meses} />
          <GraficoReceitaCustoMargem meses={meses} />

          <div className="grid gap-4 lg:grid-cols-2">
            <GraficoHorasEquipamento periodo={periodo} />
            <GraficoUtilizacaoDiesel periodo={periodo} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RankingMargem tipo="equipamento" periodo={periodo} />
            <RankingMargem tipo="obra" periodo={periodo} />
          </div>

          <PipelineConsolidadoCard periodo={periodo} />

          <PrevisaoCaixaCard contasReceber={contasReceber} clientes={clientes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
