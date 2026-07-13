import { formatHorimetro } from "@/shared/lib/format";
import { precoHoraDoEquipamento, round2, valorItem } from "@/features/faturamento/calculo";
import type {
  Equipamento,
  OrcamentoItem,
  PrecoFundacao,
  PrecoHoraMaquina,
  PrecoMobilizacao,
} from "@/shared/types";

function descricaoHora(nome: string, horas: number, horaTipo: "seca" | "operada"): string {
  return `${nome} — ${formatHorimetro(horas)} ${horaTipo} (estimado)`;
}

// Item hora-máquina (estimativa). Default tarifa "operada"; sem_preco se não há tarifa ativa.
export function criarItemHora(
  equipamento: Equipamento,
  precosHM: PrecoHoraMaquina[],
  horasEstimadas: number,
  horaTipo: "seca" | "operada" = "operada",
): OrcamentoItem {
  const horas = round2(horasEstimadas);
  const preco = precoHoraDoEquipamento(equipamento, precosHM);
  const valorUnitario = preco
    ? horaTipo === "seca"
      ? preco.valor_hora_seca
      : preco.valor_hora_operada
    : null;
  return {
    id: crypto.randomUUID(),
    tipo: "hora_maquina",
    descricao: descricaoHora(equipamento.nome, horas, horaTipo),
    origem_id: equipamento.id,
    hora_tipo: horaTipo,
    quantidade_estimada: horas,
    valor_unitario: valorUnitario,
    valor_total: valorUnitario != null ? valorItem(horas, valorUnitario) : 0,
    sem_preco: preco === null,
  };
}

// Item por metro (estimativa). origem_id guarda o id do preço de fundação (p/ o handoff ler o diâmetro).
export function criarItemMetro(preco: PrecoFundacao, metrosEstimados: number): OrcamentoItem {
  const metros = round2(metrosEstimados);
  return {
    id: crypto.randomUUID(),
    tipo: "por_metro",
    descricao: `Estaca Ø${preco.diametro_broca_mm}mm — ${metros}m (estimado)`,
    origem_id: preco.id,
    hora_tipo: null,
    quantidade_estimada: metros,
    valor_unitario: preco.valor_metro,
    valor_total: valorItem(metros, preco.valor_metro),
    sem_preco: false,
  };
}

export function criarItemMobilizacao(preco: PrecoMobilizacao): OrcamentoItem {
  return {
    id: crypto.randomUUID(),
    tipo: "mobilizacao",
    descricao: preco.descricao,
    origem_id: preco.id,
    hora_tipo: null,
    quantidade_estimada: 1,
    valor_unitario: preco.valor,
    valor_total: valorItem(1, preco.valor),
    sem_preco: false,
  };
}

// Troca seca↔operada de um item hora-máquina, re-buscando o preço pelo equipamento.
export function aplicarHoraTipo(
  item: OrcamentoItem,
  equipamento: Equipamento | undefined,
  precosHM: PrecoHoraMaquina[],
  tipo: "seca" | "operada",
): OrcamentoItem {
  if (item.tipo !== "hora_maquina") return item;
  const preco = equipamento ? precoHoraDoEquipamento(equipamento, precosHM) : null;
  const valorUnitario = preco
    ? tipo === "seca"
      ? preco.valor_hora_seca
      : preco.valor_hora_operada
    : null;
  const nome = equipamento ? equipamento.nome : item.descricao.split(" — ")[0];
  return {
    ...item,
    hora_tipo: tipo,
    valor_unitario: valorUnitario,
    valor_total: valorUnitario != null ? valorItem(item.quantidade_estimada, valorUnitario) : 0,
    sem_preco: preco === null,
    descricao: descricaoHora(nome, item.quantidade_estimada, tipo),
  };
}

export function calcularTotalOrcamento(itens: OrcamentoItem[], desconto: number): number {
  const soma = itens.reduce((s, i) => s + i.valor_total, 0);
  return round2(soma - desconto);
}

export function temPendencia(orc: { itens: OrcamentoItem[] }): boolean {
  return orc.itens.some((i) => i.sem_preco);
}
