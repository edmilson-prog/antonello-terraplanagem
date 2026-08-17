import { round2 } from "@/features/faturamento/calculo";
import { horasTrabalhadasNoPeriodo } from "@/features/custo-hora/derivacoes";
import type { MargemCliente } from "@/features/rentabilidade/derivacoes";
import type { Apontamento, DiasUteis, Equipamento } from "@/shared/types";

// Blocos da aba "Visão executiva" do Painel Gerencial (UI kit `screen-painel`):
// curva ABC de clientes e utilização da frota. O ranking de clientes em si
// reaproveita `margemPorCliente` da Rentabilidade — é o mesmo agregado, só
// ordenado por receita em vez de margem.

export type ClasseABC = "A" | "B" | "C";

export interface ClienteABC extends MargemCliente {
  classe: ClasseABC;
  /** Fatia da receita total do período (fração). */
  participacao: number;
  /** Fatia acumulada até este cliente, inclusive (fração). */
  acumulado: number;
}

export interface FaixaABC {
  classe: ClasseABC;
  clientes: number;
  /** Fatia da receita que a faixa concentra (fração). */
  receita: number;
}

/** Corte clássico de Pareto: A concentra até 80% da receita, B até 95%, C o resto. */
const CORTE_A = 0.8;
const CORTE_B = 0.95;

/**
 * Classifica os clientes por receita acumulada decrescente. O cliente que
 * cruza o corte entra na faixa que ele fecha — quem leva o acumulado de 78%
 * para 84% ainda é curva A, senão o corte nunca seria atingido.
 */
export function curvaABC(clientes: MargemCliente[]): ClienteABC[] {
  const total = clientes.reduce((s, c) => s + c.receita, 0);
  if (total <= 0) return [];

  const ordenados = [...clientes].sort((a, b) => b.receita - a.receita);
  let acumuladoAbs = 0;

  return ordenados.map((cliente) => {
    const anterior = acumuladoAbs / total;
    acumuladoAbs += cliente.receita;
    const acumulado = acumuladoAbs / total;
    // O corte olha onde o cliente COMEÇA: quem começa abaixo de 80% fecha a
    // curva A, mesmo que ultrapasse o limite ao entrar.
    const classe: ClasseABC = anterior < CORTE_A ? "A" : anterior < CORTE_B ? "B" : "C";
    return {
      ...cliente,
      classe,
      participacao: cliente.receita / total,
      acumulado,
    };
  });
}

/** Consolida a curva nas três faixas, como o card do kit mostra. */
export function faixasABC(clientes: ClienteABC[]): FaixaABC[] {
  return (["A", "B", "C"] as const).map((classe) => {
    const daFaixa = clientes.filter((c) => c.classe === classe);
    return {
      classe,
      clientes: daFaixa.length,
      receita: daFaixa.reduce((s, c) => s + c.participacao, 0),
    };
  });
}

/**
 * Dias úteis de um mês "YYYY-MM", conforme o parâmetro de dias úteis.
 * Não considera feriados — o sistema não tem calendário deles, e inventar um
 * daria uma precisão falsa.
 */
export function diasUteisNoMes(mes: string, diasUteis: DiasUteis): number {
  const [ano, m] = mes.split("-").map(Number);
  const ultimoDia = new Date(Date.UTC(ano, m, 0)).getUTCDate();
  // "personalizado" não tem configuração de quais dias são — cai em seg-sex,
  // que é o padrão da empresa.
  const inclui = (diaSemana: number) =>
    diasUteis === "seg_sab" ? diaSemana >= 1 && diaSemana <= 6 : diaSemana >= 1 && diaSemana <= 5;

  let conta = 0;
  for (let dia = 1; dia <= ultimoDia; dia++) {
    if (inclui(new Date(Date.UTC(ano, m - 1, dia)).getUTCDay())) conta += 1;
  }
  return conta;
}

/** Horas teóricas de UM equipamento no período: jornada × dias úteis de cada mês. */
export function horasDisponiveisNoPeriodo(
  meses: string[],
  jornadaHoras: number,
  diasUteis: DiasUteis,
): number {
  return round2(meses.reduce((s, mes) => s + diasUteisNoMes(mes, diasUteis) * jornadaHoras, 0));
}

export interface UtilizacaoEquipamento {
  equipamento_id: string;
  horas: number;
  disponivel: number;
  /** Fração; pode passar de 1 se o equipamento rodou além da jornada padrão. */
  utilizacao: number | null;
}

export function utilizacaoFrota(
  equipamentos: Equipamento[],
  apontamentos: Apontamento[],
  meses: string[],
  jornadaHoras: number,
  diasUteis: DiasUteis,
): UtilizacaoEquipamento[] {
  const disponivel = horasDisponiveisNoPeriodo(meses, jornadaHoras, diasUteis);

  return equipamentos
    .filter((e) => e.ativo)
    .map((equipamento) => {
      const horas = round2(
        meses.reduce(
          (s, mes) => s + horasTrabalhadasNoPeriodo(apontamentos, equipamento.id, mes),
          0,
        ),
      );
      return {
        equipamento_id: equipamento.id,
        horas,
        disponivel,
        utilizacao: disponivel > 0 ? horas / disponivel : null,
      };
    })
    .sort((a, b) => (b.utilizacao ?? -1) - (a.utilizacao ?? -1));
}
