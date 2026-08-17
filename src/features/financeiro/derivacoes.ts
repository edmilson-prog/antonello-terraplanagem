import { round2 } from "@/features/faturamento/calculo";
import { chaveMes, somarMeses, MESES_ABREV } from "@/features/faturamento/derivacoes";
import type { ContaReceber, ContaPagar, FormaRecebimento } from "@/shared/types";

// Vencida = status aberta E vencimento estritamente anterior a agoraISO (YYYY-MM-DD comparação lexical)
export function contaVencida(
  conta: Pick<ContaReceber | ContaPagar, "status" | "vencimento">,
  agoraISO: string,
): boolean {
  return conta.status === "aberta" && conta.vencimento < agoraISO;
}

export function resumoCaixa(
  receber: ContaReceber[],
  pagar: ContaPagar[],
): { totalReceber: number; totalPagar: number; saldoPrevisto: number } {
  const totalReceber = round2(
    receber.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0),
  );
  const totalPagar = round2(
    pagar.filter((c) => c.status === "aberta").reduce((s, c) => s + c.valor, 0),
  );
  return { totalReceber, totalPagar, saldoPrevisto: round2(totalReceber - totalPagar) };
}

export interface AgregadoMensalFinanceiro {
  mes: string; // "YYYY-MM"
  rotulo: string;
  valor: number;
}

// Agrega `valor` de itens por mês de uma data escolhida por `obterData`
// (ex.: recebido_em, pago_em), últimos N meses até a referência. Generaliza
// o padrão de agregadoMensal (faturamento/derivacoes.ts) para qualquer campo
// de data nullable.
export function agregadoMensalPorData<T>(
  itens: T[],
  obterData: (item: T) => string | null,
  obterValor: (item: T) => number,
  referenciaISO: string,
  meses = 6,
): AgregadoMensalFinanceiro[] {
  const mesRef = chaveMes(referenciaISO);
  const chaves = Array.from({ length: meses }, (_, i) => somarMeses(mesRef, i - (meses - 1)));
  return chaves.map((chave) => {
    const doMes = itens.filter((item) => {
      const data = obterData(item);
      return data != null && chaveMes(data) === chave;
    });
    const mesIndex = Number(chave.slice(5, 7)) - 1;
    return {
      mes: chave,
      rotulo: MESES_ABREV[mesIndex],
      valor: round2(doMes.reduce((s, item) => s + obterValor(item), 0)),
    };
  });
}

export interface RecebimentoPorForma {
  forma: FormaRecebimento;
  valor: number;
  quantidade: number;
}

// Agrupa contas a receber liquidadas por forma de recebimento, ordenado por
// valor desc. Usado pelo card "Recebimentos por forma" do Financeiro.
export function recebimentosPorForma(contas: ContaReceber[]): RecebimentoPorForma[] {
  const liquidadas = contas.filter((c) => c.status === "liquidada" && c.forma_recebimento != null);
  const mapa = new Map<FormaRecebimento, { valor: number; quantidade: number }>();
  for (const c of liquidadas) {
    const forma = c.forma_recebimento as FormaRecebimento;
    const atual = mapa.get(forma) ?? { valor: 0, quantidade: 0 };
    mapa.set(forma, { valor: round2(atual.valor + c.valor), quantidade: atual.quantidade + 1 });
  }
  return Array.from(mapa.entries())
    .map(([forma, { valor, quantidade }]) => ({ forma, valor, quantidade }))
    .sort((a, b) => b.valor - a.valor);
}

// Últimas N contas a receber liquidadas, mais recentes primeiro (por
// recebido_em). Usado pelo card "Comprovantes recentes" do Financeiro.
export function comprovantesRecentes(contas: ContaReceber[], limite = 5): ContaReceber[] {
  return contas
    .filter((c) => c.status === "liquidada" && c.recebido_em != null)
    .sort((a, b) => (b.recebido_em as string).localeCompare(a.recebido_em as string))
    .slice(0, limite);
}
