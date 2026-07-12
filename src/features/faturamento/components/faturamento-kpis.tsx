import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import { formatBRL } from "@/features/retaguarda/format";

export interface FaturamentoKpisProps {
  faturadoNoMes: number;
  nfsNoMes: number;
  aFaturarValor: number;
  aFaturarRodape: string;
  ticketMedio: number;
  series: number[]; // valores mensais reais (últimos N meses), para os sparks escalados 0..100
}

function escalar0a100(valores: number[]): number[] {
  const max = Math.max(...valores, 0);
  if (max === 0) return valores.map(() => 0);
  return valores.map((v) => Math.round((v / max) * 100));
}

export function FaturamentoKpis({
  faturadoNoMes,
  nfsNoMes,
  aFaturarValor,
  aFaturarRodape,
  ticketMedio,
  series,
}: FaturamentoKpisProps) {
  const spark = escalar0a100(series);
  const temPendencia = aFaturarValor > 0;
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <Tile
        rotulo="Faturado no mês"
        valor={formatBRL(faturadoNoMes)}
        icone="lucide:credit-card"
        spark={spark}
      />
      <Tile
        rotulo="NFs emitidas"
        valor={String(nfsNoMes)}
        icone="lucide:file-check"
        rodape="no mês"
        spark={spark}
      />
      <Tile
        rotulo="A faturar"
        valor={formatBRL(aFaturarValor)}
        icone="lucide:clipboard-list"
        rodape={aFaturarRodape}
        alerta={temPendencia}
      />
      <Tile
        rotulo="Ticket médio"
        valor={formatBRL(ticketMedio)}
        icone="lucide:dollar-sign"
        rodape="por NF no mês"
      />
    </section>
  );
}

function Tile({
  rotulo,
  valor,
  icone,
  rodape,
  spark,
  alerta,
}: {
  rotulo: string;
  valor: string;
  icone: string;
  rodape?: string;
  spark?: number[];
  alerta?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10.5px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </span>
        <span
          className={
            alerta
              ? "grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive"
              : "grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary"
          }
        >
          <Icon icon={icone} className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div
        className={
          (alerta ? "text-destructive" : "text-foreground") + " mt-3 font-mono text-2xl font-bold"
        }
      >
        {valor}
      </div>
      {rodape ? <div className="mt-1.5 text-xs text-muted-foreground">{rodape}</div> : null}
      {spark ? (
        <Sparkline pontos={spark} className="absolute bottom-3.5 right-3.5 h-6 w-16" />
      ) : null}
    </div>
  );
}
