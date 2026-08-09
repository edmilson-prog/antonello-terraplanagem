import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import { variacaoPercentual } from "@/features/gerencial/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { cn } from "@/lib/utils";
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
// FaixaIndicadores logo abaixo.
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
      <KpiTile
        rotulo="Faturamento"
        valor={formatBRL(faturado)}
        icone="lucide:credit-card"
        variacao={variacaoPercentual(faturado, faturadoAnterior)}
        rodape="vs. período anterior"
        spark={serieFaturado}
        para="/admin/faturamento"
      />
      <KpiTile
        rotulo="Horas apontadas"
        valor={formatHorimetro(horas)}
        icone="lucide:clock"
        variacao={variacaoPercentual(horas, horasAnterior)}
        rodape="vs. período anterior"
        spark={serieHoras}
        para="/admin/ordens"
      />
      <KpiTile
        rotulo="OS em andamento"
        valor={String(osEmAndamento)}
        icone="lucide:clipboard-list"
        rodape={osAbertas > 0 ? `${osAbertas} aguardando início` : "nenhuma aguardando início"}
        spark={serieOS}
        para="/admin/ordens"
      />
      <KpiTile
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

interface KpiTileProps {
  rotulo: string;
  valor: string;
  icone: string;
  rodape?: ReactNode;
  variacao?: number | null;
  spark?: number[];
  alerta?: boolean;
  para: string;
}

// Escala uma série absoluta para 0..100 (contrato do Sparkline).
function escalar0a100(valores: number[]): number[] {
  const max = Math.max(...valores, 0);
  if (max === 0) return valores.map(() => 0);
  return valores.map((v) => Math.round((v / max) * 100));
}

function KpiTile({ rotulo, valor, icone, rodape, variacao, spark, alerta, para }: KpiTileProps) {
  return (
    <Link
      to={para}
      className="relative block overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </span>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            alerta ? "bg-destructive/15 text-destructive" : "bg-surface text-primary",
          )}
        >
          <Icon icon={icone} className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-2xl font-bold",
            alerta ? "text-destructive" : "text-foreground",
          )}
        >
          {valor}
        </span>
        <TrendBadge variacao={variacao ?? null} />
      </div>
      {rodape ? <div className="mt-1.5 text-xs text-muted-foreground">{rodape}</div> : null}
      {spark && spark.length > 1 ? (
        <Sparkline
          pontos={escalar0a100(spark)}
          className="absolute bottom-3.5 right-3.5 h-6 w-16"
        />
      ) : null}
    </Link>
  );
}

// Variação vs. período anterior no formato do UI kit (seta + inteiro).
function TrendBadge({ variacao }: { variacao: number | null }) {
  if (variacao === null) return null;
  const positiva = variacao >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
        positiva ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
      )}
    >
      <Icon
        icon={positiva ? "lucide:arrow-up-right" : "lucide:arrow-down-right"}
        className="h-3 w-3"
      />
      {Math.abs(Math.round(variacao))}%
    </span>
  );
}
