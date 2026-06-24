import type {
  FaturamentoMes,
  FaturamentoPorEquipamento,
  FaturamentoPorCliente,
} from "@/shared/types";

// Valores em BRL. Apenas Retaguarda consome estes dados.

export const faturamentoMensal: FaturamentoMes[] = [
  { mes: "2026-01", rotulo: "Jan", horas_faturadas: 412, valor: 168_400 },
  { mes: "2026-02", rotulo: "Fev", horas_faturadas: 388, valor: 154_900 },
  { mes: "2026-03", rotulo: "Mar", horas_faturadas: 465, valor: 192_300 },
  { mes: "2026-04", rotulo: "Abr", horas_faturadas: 502, valor: 211_750 },
  { mes: "2026-05", rotulo: "Mai", horas_faturadas: 478, valor: 198_220 },
  { mes: "2026-06", rotulo: "Jun", horas_faturadas: 396, valor: 162_540 },
];

export const faturamentoPorEquipamento: FaturamentoPorEquipamento[] = [
  {
    equipamento_id: "eq-001",
    equipamento_nome: "Escavadeira CAT 320D 18t",
    horas: 612,
    valor: 287_640,
  },
  {
    equipamento_id: "eq-002",
    equipamento_nome: "Escavadeira 10t",
    horas: 488,
    valor: 195_200,
  },
  {
    equipamento_id: "eq-005",
    equipamento_nome: "Caminhão Caçamba",
    horas: 542,
    valor: 189_700,
  },
  {
    equipamento_id: "eq-006",
    equipamento_nome: "Trator de Esteira D6",
    horas: 359,
    valor: 168_730,
  },
  {
    equipamento_id: "eq-004",
    equipamento_nome: "Carregadeira de Rodas",
    horas: 240,
    valor: 76_840,
  },
];

export const faturamentoPorCliente: FaturamentoPorCliente[] = [
  { cliente_id: "cl-001", cliente_nome: "Construtora Horizonte Ltda.", valor: 412_300 },
  { cliente_id: "cl-002", cliente_nome: "Incorporadora Vale Verde", valor: 318_120 },
  { cliente_id: "cl-003", cliente_nome: "Prefeitura S. Pedro do Ivaí", valor: 187_490 },
];
