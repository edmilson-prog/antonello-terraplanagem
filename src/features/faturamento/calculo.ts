import { formatHorimetro } from "@/shared/lib/format";
import type {
  Apontamento,
  Equipamento,
  FaturamentoItem,
  OrdemServico,
  PrecoFundacao,
  PrecoHoraMaquina,
} from "@/shared/types";

// Aritmética monetária em centavos (evita drift de ponto flutuante; RNF-001).
export function round2(reais: number): number {
  return Math.round(reais * 100) / 100;
}

export function valorItem(quantidade: number, valorUnitario: number): number {
  return round2(quantidade * valorUnitario);
}

// Preço hora-máquina: ativo por equipamento específico; senão por tipo; senão null.
export function precoHoraDoEquipamento(
  equipamento: Equipamento,
  precos: PrecoHoraMaquina[],
): PrecoHoraMaquina | null {
  const porEquip = precos.find((p) => p.ativo && p.equipamento_id === equipamento.id);
  if (porEquip) return porEquip;
  const porTipo = precos.find((p) => p.ativo && p.tipo_equipamento === equipamento.tipo);
  return porTipo ?? null;
}

export function precoFundacaoDoDiametro(
  diametroMm: number | null,
  precos: PrecoFundacao[],
): PrecoFundacao | null {
  if (diametroMm == null) return null;
  return precos.find((p) => p.ativo && p.diametro_broca_mm === diametroMm) ?? null;
}

function descricaoHora(nome: string, horas: number, horaTipo: "seca" | "operada"): string {
  return `${nome} — ${formatHorimetro(horas)} ${horaTipo}`;
}

// Monta os itens do faturamento a partir da OS fechada. Default hora = "operada".
export function gerarItens(
  os: OrdemServico,
  apontamentos: Apontamento[],
  equipamentos: Equipamento[],
  precosHM: PrecoHoraMaquina[],
  precosFund: PrecoFundacao[],
): FaturamentoItem[] {
  if (os.modelo_cobranca === "por_metro") {
    const metros = os.metragem_executada ?? 0;
    const preco = precoFundacaoDoDiametro(os.diametro_broca_mm, precosFund);
    const valorUnitario = preco ? preco.valor_metro : null;
    const diametro = os.diametro_broca_mm;
    return [
      {
        id: `${os.id}:metro`,
        tipo: "por_metro",
        descricao: diametro != null ? `Estaca Ø${diametro}mm — ${metros}m` : `Estaca — ${metros}m`,
        origem_id: null,
        hora_tipo: null,
        quantidade: metros,
        valor_unitario: valorUnitario,
        valor_total: valorUnitario != null ? valorItem(metros, valorUnitario) : 0,
        sem_preco: preco === null,
      },
    ];
  }

  const horasPorEquip = new Map<string, number>();
  for (const a of apontamentos) {
    if (a.os_id !== os.id || a.status !== "finalizado") continue;
    horasPorEquip.set(a.equipamento_id, (horasPorEquip.get(a.equipamento_id) ?? 0) + (a.horas_trabalhadas ?? 0));
  }

  const itens: FaturamentoItem[] = [];
  for (const [equipId, horasBrutas] of horasPorEquip) {
    const horas = round2(horasBrutas);
    const equipamento = equipamentos.find((e) => e.id === equipId);
    const nome = equipamento ? equipamento.nome : "Equipamento removido";
    const preco = equipamento ? precoHoraDoEquipamento(equipamento, precosHM) : null;
    const valorUnitario = preco ? preco.valor_hora_operada : null;
    itens.push({
      id: `${os.id}:${equipId}`,
      tipo: "hora_maquina",
      descricao: descricaoHora(nome, horas, "operada"),
      origem_id: equipId,
      hora_tipo: "operada",
      quantidade: horas,
      valor_unitario: valorUnitario,
      valor_total: valorUnitario != null ? valorItem(horas, valorUnitario) : 0,
      sem_preco: preco === null,
    });
  }
  return itens;
}

// Troca seca↔operada de um item hora-máquina, re-buscando o preço pelo equipamento.
export function aplicarHoraTipo(
  item: FaturamentoItem,
  equipamento: Equipamento | undefined,
  precosHM: PrecoHoraMaquina[],
  tipo: "seca" | "operada",
): FaturamentoItem {
  if (item.tipo !== "hora_maquina") return item;
  const preco = equipamento ? precoHoraDoEquipamento(equipamento, precosHM) : null;
  const valorUnitario = preco ? (tipo === "seca" ? preco.valor_hora_seca : preco.valor_hora_operada) : null;
  const nome = item.descricao.split(" — ")[0];
  return {
    ...item,
    hora_tipo: tipo,
    valor_unitario: valorUnitario,
    valor_total: valorUnitario != null ? valorItem(item.quantidade, valorUnitario) : 0,
    sem_preco: preco === null,
    descricao: descricaoHora(nome, item.quantidade, tipo),
  };
}

export function calcularValorTotal(itens: FaturamentoItem[], desconto: number): number {
  const soma = itens.reduce((s, i) => s + i.valor_total, 0);
  return round2(soma - desconto);
}

export function temPendencia(fat: { itens: FaturamentoItem[] }): boolean {
  return fat.itens.some((i) => i.sem_preco);
}
