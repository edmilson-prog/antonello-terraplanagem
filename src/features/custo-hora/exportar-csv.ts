import { campoCsv, montarCsv, numeroCsv } from "@/shared/lib/exportar-csv";
import { rotuloMes } from "@/shared/lib/periodo-mensal";
import type { CustoHoraEquipamento } from "@/features/custo-hora/derivacoes";

// Export da tabela de custo por equipamento. A mecânica do CSV (separador,
// decimal, BOM, escape) vive em shared/lib/exportar-csv desde a Onda 15.

const CABECALHO = [
  "Equipamento",
  "Horas no mês",
  "Custo/hora",
  "Preço/hora",
  "Margem/hora",
  "Custo total",
] as const;

export function montarCsvCustoHora(
  resultados: CustoHoraEquipamento[],
  nomeDoEquipamento: (equipamentoId: string) => string,
): string {
  return montarCsv(
    CABECALHO,
    resultados.map((r) => [
      campoCsv(nomeDoEquipamento(r.equipamento_id)),
      numeroCsv(r.horas_trabalhadas),
      numeroCsv(r.custo_por_hora),
      numeroCsv(r.preco_hora),
      numeroCsv(r.margem_hora),
      numeroCsv(r.custo_total),
    ]),
  );
}

export function nomeArquivoCustoHora(periodo: string): string {
  return `custo-hora-${periodo}.csv`;
}

export { baixarCsv } from "@/shared/lib/exportar-csv";

/** Rótulo do mês para o toast de confirmação ("julho de 2026"). */
export const descreverPeriodo = rotuloMes;
