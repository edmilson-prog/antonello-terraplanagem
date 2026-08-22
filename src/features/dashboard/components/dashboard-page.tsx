import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { PeriodoFiltro } from "@/features/dashboard/components/periodo-filtro";
import { DashboardKpis } from "@/features/dashboard/components/dashboard-kpis";
import { FaixaIndicadores } from "@/features/dashboard/components/faixa-indicadores";
import { CardOsAndamento } from "@/features/dashboard/components/card-os-andamento";
import { CardApontamentosDia } from "@/features/dashboard/components/card-apontamentos-dia";
import { CardFrota } from "@/features/dashboard/components/card-frota";
import { CardVencimentos } from "@/features/dashboard/components/card-vencimentos";
import { CardHorasSemana } from "@/features/dashboard/components/card-horas-semana";
import { PainelOperacional } from "@/features/dashboard-operacional";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import {
  apontamentosDoDiaMaisRecente,
  contagemAlertasManutencao,
  contagemOSPorStatus,
  horasApontadasNoPeriodo,
  intervaloAnterior,
  osAtivas,
  pipelineFinanceiroPeriodo,
  referenciaApontamentos,
  resumoContasPendentes,
  resumoSemanal,
  saldoAReceber,
  serieEmBuckets,
  serieSemanalHoras,
  vencimentosProximos,
} from "@/features/dashboard/derivacoes";
import { intervaloPeriodo, type PeriodoDashboard } from "@/features/dashboard/periodo";

const ROTULO_PERIODO: Record<PeriodoDashboard, string> = {
  hoje: "hoje",
  semana: "nesta semana",
  mes: "neste mês",
};

export function AdminDashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>("mes");

  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const contasPagar = contasPagarStore.useTodas();
  const equipamentos = equipamentosStore.useAll();
  const operadores = operadoresStore.useAll();
  const clientes = clientesStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const precosFund = precoFundacaoStore.useAll();
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useCompletos();
  const { isLoading, error, retry } = combinarEstados(
    { estado: ordensStore.useEstado(), retry: ordensStore.retry },
    { estado: apontamentosStore.useEstado(), retry: apontamentosStore.retry },
    { estado: faturamentosStore.useEstado(), retry: faturamentosStore.retry },
    { estado: contasReceberStore.useEstado(), retry: contasReceberStore.retry },
    { estado: contasPagarStore.useEstado(), retry: contasPagarStore.retry },
    { estado: equipamentosStore.useEstado(), retry: equipamentosStore.retry },
    { estado: operadoresStore.useEstado(), retry: operadoresStore.retry },
    { estado: clientesStore.useEstado(), retry: clientesStore.retry },
    { estado: precoHoraMaquinaStore.useEstado(), retry: precoHoraMaquinaStore.retry },
    { estado: precoFundacaoStore.useEstado(), retry: precoFundacaoStore.retry },
    { estado: planosManutencaoStore.useEstado(), retry: planosManutencaoStore.retry },
    { estado: registrosManutencaoStore.useEstado(), retry: registrosManutencaoStore.retry },
  );

  const agora = useMemo(() => new Date(), []);
  const agoraISO = useMemo(() => agora.toISOString().slice(0, 10), [agora]);
  const intervalo = useMemo(() => intervaloPeriodo(periodo, agora), [periodo, agora]);
  const anterior = useMemo(() => intervaloAnterior(intervalo), [intervalo]);

  const dados = useMemo(() => {
    const pipeline = pipelineFinanceiroPeriodo(
      ordens,
      apontamentos,
      faturamentos,
      contasReceber,
      equipamentos,
      precosHM,
      precosFund,
      intervalo,
    );
    const pipelineAnterior = pipelineFinanceiroPeriodo(
      ordens,
      apontamentos,
      faturamentos,
      contasReceber,
      equipamentos,
      precosHM,
      precosFund,
      anterior,
    );
    const finalizados = apontamentos.filter((a) => a.status === "finalizado");
    const referencia = referenciaApontamentos(apontamentos, agora);
    const semanas = serieSemanalHoras(apontamentos, referencia);

    return {
      pipeline,
      faturadoAnterior: pipelineAnterior.faturado,
      horas: horasApontadasNoPeriodo(apontamentos, intervalo),
      horasAnterior: horasApontadasNoPeriodo(apontamentos, anterior),
      contagemOS: contagemOSPorStatus(ordens, apontamentos, intervalo),
      saldo: saldoAReceber(contasReceber, agoraISO),
      contas: resumoContasPendentes(contasReceber, contasPagar, agora),
      alertas: contagemAlertasManutencao(equipamentos, planos, registros),
      serieFaturado: serieEmBuckets(
        faturamentos,
        (f) => f.faturado_em,
        (f) => f.valor_total,
        intervalo,
      ),
      serieHoras: serieEmBuckets(
        finalizados,
        (a) => a.finalizado_em,
        (a) => a.horas_trabalhadas ?? 0,
        intervalo,
      ),
      serieOS: serieEmBuckets(
        ordens,
        (o) => o.aberta_em,
        () => 1,
        intervalo,
      ),
      osAtivas: osAtivas(ordens, apontamentos, 5),
      apontamentosDoDia: apontamentosDoDiaMaisRecente(apontamentos, 6),
      semanas,
      resumoSemanas: resumoSemanal(semanas),
      vencimentos: vencimentosProximos(contasReceber, faturamentos, agoraISO, 4),
      frota: equipamentos.filter((e) => e.ativo),
    };
  }, [
    ordens,
    apontamentos,
    faturamentos,
    contasReceber,
    contasPagar,
    equipamentos,
    precosHM,
    precosFund,
    planos,
    registros,
    intervalo,
    anterior,
    agora,
    agoraISO,
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Dashboard"
        descricao="Visão geral da operação — equipamentos, ordens e faturamento."
        acoes={
          <>
            <PeriodoFiltro periodo={periodo} onChange={setPeriodo} />
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/admin/ordens/nova">
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Nova OS
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/admin/orcamentos/novo">
                <Icon icon="lucide:file-plus" className="h-4 w-4" />
                Novo orçamento
              </Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4">
          {isLoading ? (
            <EsqueletoDashboard />
          ) : error ? (
            <div role="alert" className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <Icon icon="lucide:rotate-cw" className="h-3.5 w-3.5" />
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              <DashboardKpis
                faturado={dados.pipeline.faturado}
                faturadoAnterior={dados.faturadoAnterior}
                serieFaturado={dados.serieFaturado}
                horas={dados.horas}
                horasAnterior={dados.horasAnterior}
                serieHoras={dados.serieHoras}
                osEmAndamento={dados.contagemOS.emAndamento}
                osAbertas={dados.contagemOS.abertas}
                serieOS={dados.serieOS}
                saldo={dados.saldo}
                rotuloPeriodo={ROTULO_PERIODO[periodo]}
              />

              <FaixaIndicadores
                executado={dados.pipeline.executado}
                recebido={dados.pipeline.recebido}
                osAbertas={dados.contagemOS.abertas}
                osFechadasNoPeriodo={dados.contagemOS.fechadasNoPeriodo}
                contasVencidas={dados.contas.vencidas}
                contasAVencer={dados.contas.aVencer}
                alertasManutencao={dados.alertas}
              />

              <div className="grid items-start gap-4 lg:grid-cols-[1.62fr_1fr]">
                <div className="space-y-4">
                  <CardOsAndamento itens={dados.osAtivas} clientes={clientes} />
                  <CardApontamentosDia
                    dia={dados.apontamentosDoDia}
                    operadores={operadores}
                    equipamentos={equipamentos}
                    ordens={ordens}
                    agora={agora}
                  />
                </div>
                <div className="space-y-4">
                  <CardFrota equipamentos={dados.frota} />
                  <CardVencimentos itens={dados.vencimentos} clientes={clientes} />
                  <CardHorasSemana semanas={dados.semanas} resumo={dados.resumoSemanas} />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="operacional">
          <PainelOperacional />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EsqueletoDashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-7 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[74px] w-full rounded-xl" />
      <div className="grid items-start gap-4 lg:grid-cols-[1.62fr_1fr]">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
