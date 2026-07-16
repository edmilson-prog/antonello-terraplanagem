import { Icon } from "@iconify/react";
import { Sparkline } from "@/shared/components/sparkline";
import { formatBRL } from "@/features/retaguarda/format";

export interface FinanceiroKpisProps {
  aReceberValor: number;
  aReceberRodape: string;
  aReceberAlerta: boolean;
  aPagarValor: number;
  aPagarRodape: string;
  recebidoNoMes: number;
  recebidoRodape: string;
  seriesRecebido: number[]; // últimos N meses (para o spark de "Recebido no mês")
  saldoDoMes: number;
  seriesSaldo: number[]; // últimos N meses (para o spark de "Saldo do mês")
}

function escalar0a100(valores: number[]): number[] {
  const max = Math.max(...valores, 0);
  if (max === 0) return valores.map(() => 0);
  return valores.map((v) => Math.round((v / max) * 100));
}

export function FinanceiroKpis({
  aReceberValor,
  aReceberRodape,
  aReceberAlerta,
  aPagarValor,
  aPagarRodape,
  recebidoNoMes,
  recebidoRodape,
  seriesRecebido,
  saldoDoMes,
  seriesSaldo,
}: FinanceiroKpisProps) {
  const sparkRecebido = escalar0a100(seriesRecebido);
  const sparkSaldo = escalar0a100(seriesSaldo);
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <Tile
        rotulo="A receber"
        valor={formatBRL(aReceberValor)}
        icone="lucide:hand-coins"
        rodape={aReceberRodape}
        alerta={aReceberAlerta}
      />
      <Tile
        rotulo="A pagar"
        valor={formatBRL(aPagarValor)}
        icone="lucide:wallet"
        rodape={aPagarRodape}
      />
      <Tile
        rotulo="Recebido no mês"
        valor={formatBRL(recebidoNoMes)}
        icone="lucide:credit-card"
        rodape={recebidoRodape}
        spark={sparkRecebido}
      />
      <Tile
        rotulo="Saldo do mês"
        valor={formatBRL(saldoDoMes)}
        icone="lucide:trending-up"
        rodape="recebido − pago"
        spark={sparkSaldo}
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
