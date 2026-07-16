// src/features/precos/labels.ts
import type {
  Equipamento,
  PrecoHoraMaquina,
  PrecoFundacao,
  PrecoMobilizacao,
  HistoricoPreco,
} from "@/shared/types";
import { TIPO_LABEL } from "@/features/equipamentos/labels";
import { formatBRL } from "@/features/retaguarda/format";

// `vinculo` é estado de formulário (qual FK gravar), não pertence ao contrato.
export type VinculoPreco = "equipamento" | "tipo";

export const VINCULOS: VinculoPreco[] = ["equipamento", "tipo"];

export const VINCULO_LABEL: Record<VinculoPreco, string> = {
  equipamento: "Equipamento específico",
  tipo: "Tipo de equipamento",
};

// Descrição legível do vínculo de um preço hora-máquina, resolvendo o nome do
// equipamento a partir da lista atual (reativo a mudanças no cadastro).
export function descreverVinculo(
  preco: Pick<PrecoHoraMaquina, "equipamento_id" | "tipo_equipamento">,
  equipamentos: Equipamento[],
): string {
  if (preco.equipamento_id) {
    const eq = equipamentos.find((e) => e.id === preco.equipamento_id);
    return eq ? eq.nome : "Equipamento removido";
  }
  if (preco.tipo_equipamento) {
    return `Tipo: ${TIPO_LABEL[preco.tipo_equipamento]}`;
  }
  return "—";
}

// Limiar de margem mínima da coluna "Margem" (Preços, aba Hora-Máquina).
// Fixo no código — não lido de Parâmetros (feature ainda não existe).
export const MARGEM_MINIMA_PADRAO = 0.3;

// Margem percentual entre o preço de hora operada e o custo de referência
// estimado. Pode ser negativa quando o custo supera o preço.
export function margemPercentual(precoOperada: number, custoRef: number): number {
  return (precoOperada - custoRef) / precoOperada;
}

export const TIPO_HISTORICO_LABEL: Record<HistoricoPreco["tipo"], string> = {
  hora_maquina: "Hora-Máquina",
  fundacao: "Por Metro",
  mobilizacao: "Mobilização",
};

// Descreve uma entrada de histórico de preços para exibição no diálogo
// "Tabelas anteriores" — título curto + detalhe com os valores do snapshot.
export function descreverHistorico(
  entrada: HistoricoPreco,
  equipamentos: Equipamento[],
): { titulo: string; detalhe: string } {
  if (entrada.tipo === "hora_maquina") {
    const s = entrada.snapshot as PrecoHoraMaquina;
    return {
      titulo: descreverVinculo(s, equipamentos),
      detalhe: `Hora seca: ${formatBRL(s.valor_hora_seca)} · Hora operada: ${formatBRL(s.valor_hora_operada)}`,
    };
  }
  if (entrada.tipo === "fundacao") {
    const s = entrada.snapshot as PrecoFundacao;
    return {
      titulo: `Ø${s.diametro_broca_mm}mm`,
      detalhe: `${s.descricao ?? "sem descrição"} · ${formatBRL(s.valor_metro)}/m`,
    };
  }
  const s = entrada.snapshot as PrecoMobilizacao;
  return { titulo: s.descricao, detalhe: formatBRL(s.valor) };
}
