import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import {
  apontamentosDoDiaMaisRecente,
  contagemOSPorStatus,
  horasApontadasNoPeriodo,
} from "@/features/dashboard/derivacoes";
import { rotuloDia } from "@/features/dashboard/format";
import { intervaloPeriodo } from "@/features/dashboard/periodo";
import {
  dataReferenciaOperacional,
  serieDiariaOSAbertas,
} from "@/features/dashboard-operacional/derivacoes";
import {
  MiniBarras,
  TileOperacional,
  TileRodape,
  TileStatList,
} from "@/features/dashboard-operacional/components/tile-operacional";
import { numero } from "@/features/retaguarda/format";

// Bloco "Ordens e horas" do UI kit: três tiles — OS abertas (com as novas dos
// últimos 7 dias), OS em andamento (com a quebra por status) e horas apontadas
// (com os apontamentos do último dia com movimento).
export function TilesOrdensHoras() {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const faturamentos = faturamentosStore.useTodos();
  const contasReceber = contasReceberStore.useTodas();
  const operadores = operadoresStore.useAll();
  const { isLoading, error, retry } = useMockResource(ordens);

  const dados = useMemo(() => {
    const referencia = dataReferenciaOperacional(ordens, apontamentos, faturamentos, contasReceber);
    const intervaloMes = intervaloPeriodo("mes", referencia);
    const dia = apontamentosDoDiaMaisRecente(apontamentos, 3);
    const todosDoDia = apontamentosDoDiaMaisRecente(apontamentos);
    return {
      referencia,
      contagem: contagemOSPorStatus(ordens, apontamentos, intervaloMes),
      horasMes: horasApontadasNoPeriodo(apontamentos, intervaloMes),
      // Barras discretas por dia: série real, não a decorativa dos sparklines.
      novasPorDia: serieDiariaOSAbertas(ordens, referencia).map((p) => p.valor),
      dia,
      horasDoDia: todosDoDia.itens.reduce((s, a) => s + (a.horas_trabalhadas ?? 0), 0),
      osDoDia: new Set(todosDoDia.itens.map((a) => a.os_id).filter(Boolean)).size,
    };
  }, [ordens, apontamentos, faturamentos, contasReceber]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const rotulo = rotuloDia(dados.dia.data, dados.referencia);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <TileOperacional rotulo="Abertas" valor={dados.contagem.abertas}>
        <MiniBarras valores={dados.novasPorDia} />
        <TileRodape>Novas OS · últimos 7 dias</TileRodape>
      </TileOperacional>

      <TileOperacional rotulo="Em andamento" valor={dados.contagem.emAndamento}>
        <TileStatList
          itens={[
            { rotulo: "Em andamento", valor: dados.contagem.emAndamento, cor: "bg-primary" },
            { rotulo: "Abertas", valor: dados.contagem.abertas, cor: "bg-steel" },
            {
              rotulo: "Concluídas no mês",
              valor: dados.contagem.fechadasNoPeriodo,
              cor: "bg-secondary",
            },
          ]}
        />
      </TileOperacional>

      <TileOperacional rotulo="Horas apontadas" valor={numero.format(dados.horasMes)} unidade="h">
        {dados.dia.itens.length > 0 ? (
          <div className="mt-3 border-t">
            {dados.dia.itens.map((a) => {
              const os = ordens.find((o) => o.id === a.os_id);
              const operador = operadores.find((o) => o.id === a.operador_id);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 border-b py-1.5 text-[11.5px] text-muted-foreground last:border-b-0"
                >
                  {os ? (
                    <Link
                      to="/admin/ordens/$ordemId"
                      params={{ ordemId: os.id }}
                      className="shrink-0 rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary"
                    >
                      {os.numero}
                    </Link>
                  ) : (
                    <span className="shrink-0 font-mono text-[11px] text-foreground-faint">—</span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {operador?.nome.split(" ")[0] ?? "—"}
                  </span>
                  <b className="shrink-0 font-mono text-[11.5px] font-semibold text-foreground">
                    {numero.format(a.horas_trabalhadas ?? 0)} h
                  </b>
                </div>
              );
            })}
          </div>
        ) : null}
        <TileRodape>
          {dados.dia.data
            ? `${rotulo === "hoje" ? "Hoje" : rotulo} · ${numero.format(dados.horasDoDia)} h em ${dados.osDoDia} OS`
            : "no mês"}
        </TileRodape>
      </TileOperacional>
    </div>
  );
}
