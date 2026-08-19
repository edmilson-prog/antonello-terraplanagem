import type {
  Cliente,
  Equipamento,
  Faturamento,
  FaturamentoMes,
  FaturamentoPorCliente,
  FaturamentoPorEquipamento,
} from "@/shared/types";

/*
 * Análise de faturamento — derivada de `faturamentos` reais.
 *
 * Substitui as constantes de `src/mocks/faturamento.ts`: seis meses fixos de
 * jan a jun/2026, cinco equipamentos e três clientes que não existiam no
 * cadastro. E o filtro de período não filtrava nada — escalava os totais fixos
 * por uma razão (`valor × totalDoPeriodo / totalGeral`), de modo que "últimos
 * 3 meses" devolvia uma fração proporcional dos mesmos números inventados,
 * distribuída pelos mesmos equipamentos.
 *
 * Só entra faturamento CONFIRMADO. Rascunho é intenção, não receita — e o
 * `faturado_em` nulo do rascunho passaria por qualquer filtro de janela, já
 * que toda comparação com NaN é falsa.
 */

const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/** "2026-08" a partir de um ISO, no fuso de quem olha. */
function chaveDoMes(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function rotuloDoMes(chave: string): string {
  const [ano, mes] = chave.split("-");
  return `${MESES_CURTOS[Number(mes) - 1]}/${ano.slice(2)}`;
}

export function faturamentosConfirmados(faturamentos: Faturamento[]): Faturamento[] {
  return faturamentos.filter((f) => f.status === "faturado" && f.faturado_em);
}

export function noPeriodo(faturamentos: Faturamento[], de: string, ate: string): Faturamento[] {
  return faturamentosConfirmados(faturamentos).filter((f) => {
    const mes = chaveDoMes(f.faturado_em!);
    return mes >= de && mes <= ate;
  });
}

/** Horas faturadas = quantidade dos itens de hora-máquina (não horas apontadas). */
function horasFaturadas(f: Faturamento): number {
  return f.itens
    .filter((i) => i.tipo === "hora_maquina")
    .reduce((soma, i) => soma + i.quantidade, 0);
}

/**
 * Série mensal, um ponto por mês COM faturamento. Meses vazios não entram:
 * inventar um zero entre dois meses faturados desenharia uma queda que não
 * houve — a empresa pode simplesmente não ter fechado nota naquele mês.
 */
export function serieMensal(faturamentos: Faturamento[]): FaturamentoMes[] {
  const porMes = new Map<string, { horas: number; valor: number }>();

  for (const f of faturamentosConfirmados(faturamentos)) {
    const chave = chaveDoMes(f.faturado_em!);
    const atual = porMes.get(chave) ?? { horas: 0, valor: 0 };
    atual.horas += horasFaturadas(f);
    atual.valor += f.valor_total;
    porMes.set(chave, atual);
  }

  return [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, { horas, valor }]) => ({
      mes,
      rotulo: rotuloDoMes(mes),
      horas_faturadas: Math.round(horas * 10) / 10,
      valor: Math.round(valor * 100) / 100,
    }));
}

/**
 * Por equipamento, dentro do período. `origem_id` do item de hora-máquina é o
 * equipamento; mobilização aponta para o preço, então fica de fora — é receita
 * do transporte, não da máquina em operação.
 */
export function porEquipamento(
  faturamentos: Faturamento[],
  equipamentos: Equipamento[],
  de: string,
  ate: string,
): FaturamentoPorEquipamento[] {
  const nomes = new Map(equipamentos.map((e) => [e.id, e.nome]));
  const acumulado = new Map<string, { horas: number; valor: number }>();

  for (const f of noPeriodo(faturamentos, de, ate)) {
    for (const item of f.itens) {
      if (item.tipo !== "hora_maquina" || !item.origem_id) continue;
      const atual = acumulado.get(item.origem_id) ?? { horas: 0, valor: 0 };
      atual.horas += item.quantidade;
      atual.valor += item.valor_total;
      acumulado.set(item.origem_id, atual);
    }
  }

  return [...acumulado.entries()]
    .map(([equipamento_id, { horas, valor }]) => ({
      equipamento_id,
      equipamento_nome: nomes.get(equipamento_id) ?? "Equipamento removido",
      horas: Math.round(horas * 10) / 10,
      valor: Math.round(valor * 100) / 100,
    }))
    .sort((a, b) => b.valor - a.valor);
}

export function porCliente(
  faturamentos: Faturamento[],
  clientes: Cliente[],
  de: string,
  ate: string,
): FaturamentoPorCliente[] {
  const nomes = new Map(clientes.map((c) => [c.id, c.nome]));
  const acumulado = new Map<string, number>();

  for (const f of noPeriodo(faturamentos, de, ate)) {
    acumulado.set(f.cliente_id, (acumulado.get(f.cliente_id) ?? 0) + f.valor_total);
  }

  return [...acumulado.entries()]
    .map(([cliente_id, valor]) => ({
      cliente_id,
      cliente_nome: nomes.get(cliente_id) ?? "Cliente removido",
      valor: Math.round(valor * 100) / 100,
    }))
    .sort((a, b) => b.valor - a.valor);
}

export interface Periodo {
  de: string;
  ate: string;
}

export type PeriodoPreset = "3m" | "6m" | "ytd" | "custom";

/**
 * Recorte a partir dos meses que EXISTEM na série. Com a base vazia devolve um
 * período vazio, e não um intervalo montado em cima de datas fabricadas.
 */
export function rangeDePreset(preset: PeriodoPreset, meses: FaturamentoMes[]): Periodo {
  if (meses.length === 0) return { de: "", ate: "" };

  const primeiro = meses[0].mes;
  const ultimo = meses[meses.length - 1].mes;

  if (preset === "custom") return { de: primeiro, ate: ultimo };
  if (preset === "ytd") return { de: `${ultimo.slice(0, 4)}-01`, ate: ultimo };

  const n = preset === "3m" ? 3 : 6;
  const inicio = Math.max(0, meses.length - n);
  return { de: meses[inicio].mes, ate: ultimo };
}

export interface ResumoPeriodo {
  meses: FaturamentoMes[];
  totalHoras: number;
  totalValor: number;
  ticketMedio: number;
}

export function resumoDoPeriodo(meses: FaturamentoMes[], { de, ate }: Periodo): ResumoPeriodo {
  const noRecorte = meses.filter((m) => m.mes >= de && m.mes <= ate);
  const totalHoras = noRecorte.reduce((s, m) => s + m.horas_faturadas, 0);
  const totalValor = noRecorte.reduce((s, m) => s + m.valor, 0);

  return {
    meses: noRecorte,
    totalHoras: Math.round(totalHoras * 10) / 10,
    totalValor: Math.round(totalValor * 100) / 100,
    // Sem hora faturada não há ticket por hora — zero seria uma divisão que
    // não aconteceu, exibida como se fosse resultado.
    ticketMedio: totalHoras > 0 ? Math.round((totalValor / totalHoras) * 100) / 100 : 0,
  };
}
