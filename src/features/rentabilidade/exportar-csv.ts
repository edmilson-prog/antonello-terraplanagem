import { campoCsv, montarCsv, numeroCsv } from "@/shared/lib/exportar-csv";
import type {
  RentabilidadeEquipamento,
  RentabilidadeObra,
} from "@/features/rentabilidade/derivacoes";

// Export das duas visões de rentabilidade. Cada aba exporta o que está na
// tela — não há um CSV único, porque as colunas são diferentes.

const CABECALHO_OBRAS = [
  "OS",
  "Cliente",
  "Receita",
  "Custo",
  "Resultado",
  "Margem %",
  "Custo incompleto",
] as const;

const CABECALHO_EQUIPAMENTOS = [
  "Equipamento",
  "Horas",
  "Receita",
  "Custo",
  "Resultado",
  "Margem %",
  "Custo incompleto",
] as const;

/** "sim"/"não" em vez de true/false — a planilha é lida por gente. */
const sinalizar = (valor: boolean) => (valor ? "sim" : "não");

export function montarCsvObras(
  obras: RentabilidadeObra[],
  nomeDoCliente: (clienteId: string) => string,
): string {
  return montarCsv(
    CABECALHO_OBRAS,
    obras.map((o) => [
      campoCsv(o.os_numero),
      campoCsv(nomeDoCliente(o.cliente_id)),
      numeroCsv(o.receita),
      numeroCsv(o.custo),
      numeroCsv(o.margem),
      numeroCsv(o.margem_percentual),
      sinalizar(o.custo_incompleto),
    ]),
  );
}

export function montarCsvEquipamentos(
  equipamentos: RentabilidadeEquipamento[],
  nomeDoEquipamento: (equipamentoId: string) => string,
): string {
  return montarCsv(
    CABECALHO_EQUIPAMENTOS,
    equipamentos.map((e) => [
      campoCsv(nomeDoEquipamento(e.equipamento_id)),
      numeroCsv(e.horas_trabalhadas),
      numeroCsv(e.receita),
      numeroCsv(e.custo),
      numeroCsv(e.margem),
      numeroCsv(e.margem_percentual),
      sinalizar(e.custo_incompleto),
    ]),
  );
}

export function nomeArquivoRentabilidade(aba: "obras" | "equipamentos", periodo: string): string {
  return `rentabilidade-${aba}-${periodo}.csv`;
}
