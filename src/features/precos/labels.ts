// src/features/precos/labels.ts
import type { Equipamento, PrecoHoraMaquina } from "@/shared/types";
import { TIPO_LABEL } from "@/features/equipamentos/labels";

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
