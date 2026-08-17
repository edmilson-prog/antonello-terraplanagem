import { KpiHeroi } from "@/shared/components/kpi-heroi";
import { variacaoPercentual } from "@/features/gerencial/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import type { SaldoAReceber } from "@/features/dashboard/derivacoes";

export interface DashboardKpisProps {
  faturado: number;
  faturadoAnterior: number;
  serieFaturado: number[];
  horas: number;
  horasAnterior: number;
  serieHoras: number[];
  osEmAndamento: number;
  osAbertas: number;
  serieOS: number[];
  saldo: SaldoAReceber;
  rotuloPeriodo: string; // "hoje" | "nesta semana" | "neste mês"
}

// Os 4 indicadores-herói do dashboard (UI kit `screen-dashboard`): faturamento,
// horas, OS em andamento e saldo a receber. Os demais indicadores continuam na
// FaixaIndicadores logo abaixo. O tile em si vive em shared desde a Onda 14.
export function DashboardKpis({
  faturado,
  faturadoAnterior,
  serieFaturado,
  horas,
  horasAnterior,
  serieHoras,
  osEmAndamento,
  osAbertas,
  serieOS,
  saldo,
  rotuloPeriodo,
}: DashboardKpisProps) {
  return (
    <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <KpiHeroi
        rotulo="Faturamento"
        valor={formatBRL(faturado)}
        icone="lucide:credit-card"
        variacao={variacaoPercentual(faturado, faturadoAnterior)}
        rodape="vs. período anterior"
        spark={serieFaturado}
        para="/admin/faturamento"
      />
      <KpiHeroi
        rotulo="Horas apontadas"
        valor={formatHorimetro(horas)}
        icone="lucide:clock"
        variacao={variacaoPercentual(horas, horasAnterior)}
        rodape="vs. período anterior"
        spark={serieHoras}
        para="/admin/ordens"
      />
      <KpiHeroi
        rotulo="OS em andamento"
        valor={String(osEmAndamento)}
        icone="lucide:clipboard-list"
        rodape={osAbertas > 0 ? `${osAbertas} aguardando início` : "nenhuma aguardando início"}
        spark={serieOS}
        para="/admin/ordens"
      />
      <KpiHeroi
        rotulo="Saldo a receber"
        valor={formatBRL(saldo.total)}
        icone="lucide:hand-coins"
        alerta={saldo.vencidos > 0}
        rodape={
          saldo.vencidos > 0 ? (
            <>
              {saldo.titulos} títulos ·{" "}
              <b className="font-semibold text-destructive">{saldo.vencidos} vencidos</b>
            </>
          ) : (
            `${saldo.titulos} títulos em aberto`
          )
        }
        para="/admin/financeiro"
      />
      <span className="sr-only">Indicadores {rotuloPeriodo}</span>
    </section>
  );
}
