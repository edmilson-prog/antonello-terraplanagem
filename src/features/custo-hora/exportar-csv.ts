import { rotuloMes } from "@/shared/lib/periodo-mensal";
import type { CustoHoraEquipamento } from "@/features/custo-hora/derivacoes";

// Export da tabela de custo por equipamento. CSV em convenção pt-BR — ponto e
// vírgula como separador e vírgula decimal — porque o Excel em português lê
// assim; com vírgula separadora ele joga a linha inteira numa célula só.

const CABECALHO = [
  "Equipamento",
  "Horas no mês",
  "Custo/hora",
  "Preço/hora",
  "Margem/hora",
  "Custo total",
] as const;

/** Byte order mark, escapado para não virar caractere invisível no fonte. */
const BOM = String.fromCharCode(0xfeff);

/** Número no formato que o Excel pt-BR entende como número, sem separador de milhar. */
function numero(valor: number | null): string {
  if (valor === null) return "";
  return valor.toFixed(2).replace(".", ",");
}

/** Escapa aspas e envolve o campo quando ele contém separador, aspas ou quebra. */
function campo(texto: string): string {
  if (!/[;"\n\r]/.test(texto)) return texto;
  return `"${texto.replace(/"/g, '""')}"`;
}

export function montarCsvCustoHora(
  resultados: CustoHoraEquipamento[],
  nomeDoEquipamento: (equipamentoId: string) => string,
): string {
  const linhas = [
    CABECALHO.join(";"),
    ...resultados.map((r) =>
      [
        campo(nomeDoEquipamento(r.equipamento_id)),
        numero(r.horas_trabalhadas),
        numero(r.custo_por_hora),
        numero(r.preco_hora),
        numero(r.margem_hora),
        numero(r.custo_total),
      ].join(";"),
    ),
  ];
  return linhas.join("\r\n");
}

export function nomeArquivoCustoHora(periodo: string): string {
  return `custo-hora-${periodo}.csv`;
}

/**
 * Dispara o download no navegador. Sem o BOM, "Escavadeira" chega no Excel
 * como "EscavaÃ§...".
 */
export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob([BOM + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Rótulo do mês para o toast de confirmação ("julho de 2026"). */
export const descreverPeriodo = rotuloMes;
