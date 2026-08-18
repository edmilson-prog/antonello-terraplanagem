import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { formatBRL } from "@/features/retaguarda/format";

export interface FaturamentoKpisProps {
  faturadoNoMes: number;
  nfsNoMes: number;
  aFaturarValor: number;
  aFaturarRodape: string;
  ticketMedio: number;
  seriesValor: number[]; // valores mensais reais (últimos N meses), para o spark de "Faturado no mês"
  seriesQtd: number[]; // quantidade de NFs por mês (últimos N meses), para o spark de "NFs emitidas"
}

// Os 4 indicadores-herói do Faturamento. O tile e a escala do sparkline vivem
// em shared desde a Onda 14 — as séries entram aqui em valores absolutos e o
// KpiHeroi as escala para o contrato do Sparkline.
export function FaturamentoKpis({
  faturadoNoMes,
  nfsNoMes,
  aFaturarValor,
  aFaturarRodape,
  ticketMedio,
  seriesValor,
  seriesQtd,
}: FaturamentoKpisProps) {
  const temPendencia = aFaturarValor > 0;
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <KpiHeroi
        rotulo="Faturado no mês"
        valor={formatBRL(faturadoNoMes)}
        icone="lucide:credit-card"
        spark={seriesValor}
      />
      <KpiHeroi
        rotulo="NFs emitidas"
        valor={String(nfsNoMes)}
        icone="lucide:file-check"
        rodape="no mês"
        spark={seriesQtd}
      />
      <KpiHeroi
        rotulo="A faturar"
        valor={formatBRL(aFaturarValor)}
        icone="lucide:clipboard-list"
        rodape={aFaturarRodape}
        alerta={temPendencia}
      />
      <KpiHeroi
        rotulo="Ticket médio"
        valor={formatBRL(ticketMedio)}
        icone="lucide:dollar-sign"
        rodape="por NF no mês"
      />
    </section>
  );
}
