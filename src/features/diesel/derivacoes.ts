import type { Abastecimento, Apontamento, Equipamento } from "@/shared/types";

// Consumo médio (l/h) e utilização são DERIVADOS cruzando Abastecimento[] com
// Apontamento[] — nunca armazenados (RF-005/RF-006). Funções puras, sem
// depender de nenhum store, para manter a feature isolada e testável.

export interface PeriodoFiltro {
  de: string; // "YYYY-MM-DD", inclusive
  ate: string; // "YYYY-MM-DD", inclusive
}

function dataDentroDoPeriodo(iso: string, periodo?: PeriodoFiltro): boolean {
  if (!periodo) return true;
  const data = iso.slice(0, 10);
  return data >= periodo.de && data <= periodo.ate;
}

export function abastecimentosDoEquipamento(
  abastecimentos: Abastecimento[],
  equipamentoId: string,
  periodo?: PeriodoFiltro,
): Abastecimento[] {
  return abastecimentos.filter(
    (a) => a.equipamento_id === equipamentoId && dataDentroDoPeriodo(a.abastecido_em, periodo),
  );
}

export function apontamentosFinalizadosDoEquipamento(
  apontamentos: Apontamento[],
  equipamentoId: string,
  periodo?: PeriodoFiltro,
): Apontamento[] {
  return apontamentos.filter(
    (ap) =>
      ap.equipamento_id === equipamentoId &&
      ap.status === "finalizado" &&
      ap.horas_trabalhadas != null &&
      dataDentroDoPeriodo(ap.finalizado_em ?? ap.iniciado_em, periodo),
  );
}

export function totalLitros(abastecimentos: Abastecimento[]): number {
  return Math.round(abastecimentos.reduce((soma, a) => soma + a.litros, 0) * 10) / 10;
}

export function totalHoras(apontamentos: Apontamento[]): number {
  return (
    Math.round(apontamentos.reduce((soma, ap) => soma + (ap.horas_trabalhadas ?? 0), 0) * 10) / 10
  );
}

// null quando não há abastecimento ou não há horas no período — representa
// "sem dados", nunca um falso 0 l/h.
export function consumoMedioLh(
  litros: number,
  horas: number,
  qtdAbastecimentos: number,
): number | null {
  if (qtdAbastecimentos === 0 || horas <= 0) return null;
  return Math.round((litros / horas) * 10) / 10;
}

// custo_total tem prioridade; se ausente, deriva de litros × preço/litro.
// null quando não há nenhum dado de custo (abastecimento registrado pelo
// operador, sem preço).
export function custoAbastecimento(abastecimento: Abastecimento): number | null {
  if (abastecimento.custo_total != null) return abastecimento.custo_total;
  if (abastecimento.preco_litro != null) {
    return Math.round(abastecimento.litros * abastecimento.preco_litro * 100) / 100;
  }
  return null;
}

export interface IndicadorDieselEquipamento {
  equipamento: Equipamento;
  litros_periodo: number;
  horas_periodo: number;
  consumo_medio_l_h: number | null;
  qtd_abastecimentos: number;
}

// Um indicador por equipamento ATIVO (equipamentos inativos são excluídos —
// não fazem mais parte da frota operante).
export function indicadoresPorEquipamento(
  equipamentos: Equipamento[],
  abastecimentos: Abastecimento[],
  apontamentos: Apontamento[],
  periodo?: PeriodoFiltro,
): IndicadorDieselEquipamento[] {
  return equipamentos
    .filter((eq) => eq.ativo)
    .map((equipamento) => {
      const abs = abastecimentosDoEquipamento(abastecimentos, equipamento.id, periodo);
      const aps = apontamentosFinalizadosDoEquipamento(apontamentos, equipamento.id, periodo);
      const litros = totalLitros(abs);
      const horas = totalHoras(aps);
      return {
        equipamento,
        litros_periodo: litros,
        horas_periodo: horas,
        consumo_medio_l_h: consumoMedioLh(litros, horas, abs.length),
        qtd_abastecimentos: abs.length,
      };
    });
}
