import { KpiHeroi } from "@/shared/components/kpi-heroi";
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

// Os 4 indicadores-herói do Financeiro. O tile e a escala do sparkline vivem em
// shared desde a Onda 14 — as séries entram aqui em valores absolutos e o
// KpiHeroi as escala para o contrato do Sparkline.
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
  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      <KpiHeroi
        rotulo="A receber"
        valor={formatBRL(aReceberValor)}
        icone="lucide:hand-coins"
        rodape={aReceberRodape}
        alerta={aReceberAlerta}
      />
      <KpiHeroi
        rotulo="A pagar"
        valor={formatBRL(aPagarValor)}
        icone="lucide:wallet"
        rodape={aPagarRodape}
      />
      <KpiHeroi
        rotulo="Recebido no mês"
        valor={formatBRL(recebidoNoMes)}
        icone="lucide:credit-card"
        rodape={recebidoRodape}
        spark={seriesRecebido}
      />
      <KpiHeroi
        rotulo="Saldo do mês"
        valor={formatBRL(saldoDoMes)}
        icone="lucide:trending-up"
        rodape="recebido − pago"
        spark={seriesSaldo}
      />
    </section>
  );
}
