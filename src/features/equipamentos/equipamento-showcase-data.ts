// DADOS DE EXEMPLO — TEMPORÁRIO.
// Enquanto leituras de horímetro, KPIs de horas/disponibilidade/receita e ficha
// técnica (marca/modelo/ano/aquisição) do equipamento não têm backing real
// (schema + migração pendentes), esta é a ÚNICA fonte de exemplo da tela de
// detalhe do equipamento. Determinístico por `id`. NÃO inclui custo-hora nem
// manutenções — esses vêm reais (precoHoraMaquinaStore / stores de manutenção).
// Quando os dados reais existirem, trocar por queries SEM mexer nos componentes.

export interface EquipamentoKpiItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[] | null;
}

export interface EquipamentoShowcaseKpis {
  horimetro: EquipamentoKpiItem;
  horasMes: EquipamentoKpiItem;
  disponibilidade: EquipamentoKpiItem;
  receitaMes: EquipamentoKpiItem;
}

export interface EquipamentoLeitura {
  id: string;
  data: string;
  operadorNome: string;
  osNumero: string;
  horimetroInicial: string;
  horimetroFinal: string;
  horas: string;
}

export interface EquipamentoFichaTecnica {
  marcaModelo: string;
  ano: string;
  aquisicao: string;
  descricao: string;
}

export interface EquipamentoSemana {
  barras: { label: string; pct: number }[];
  mediaHoras: string;
  picoHoras: string;
  picoLabel: string;
}

export interface EquipamentoShowcase {
  kpis: EquipamentoShowcaseKpis;
  leiturasHorimetro: EquipamentoLeitura[];
  fichaTecnica: EquipamentoFichaTecnica;
  utilizacaoSemana: EquipamentoSemana;
}

const OPERADORES_POOL = ["João Vitor", "Marcos Silva", "Anderson Reis", "Cleiton Souza"];
const MARCAS_POOL = [
  "Caterpillar 320D",
  "Komatsu PC200",
  "Volvo EC210",
  "JCB 3CX",
  "New Holland D150",
];
const AQUISICAO_POOL = [
  "FINAME/BNDES · 48x",
  "FINAME/BNDES · 60x",
  "Recursos próprios",
  "Leasing · 36x",
];

function hashString(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function showcaseDoEquipamento(id: string): EquipamentoShowcase {
  const rand = mulberry32(hashString(id));
  const intBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[intBetween(0, arr.length - 1)];
  const spark = () => Array.from({ length: 8 }, () => intBetween(20, 95));

  const horasMes = intBetween(120, 220);
  const horasTrend = intBetween(-6, 14);
  const disponibilidade = intBetween(85, 98);
  const receita = intBetween(22, 52) * 1000;

  const kpis: EquipamentoShowcaseKpis = {
    horimetro: {
      rotulo: "Horímetro atual",
      valor: "", // sobrescrito no orquestrador com formatHorimetro(equipamento.horimetro_atual)
      icone: "lucide:gauge",
      rodape: `+${intBetween(120, 210)} h no mês`,
      trendPct: null,
      trendDir: null,
      spark: spark(),
    },
    horasMes: {
      rotulo: "Horas no mês",
      valor: `${horasMes} h`,
      icone: "lucide:clock",
      rodape: "vs. mês anterior",
      trendPct: Math.abs(horasTrend),
      trendDir: horasTrend >= 0 ? "up" : "down",
      spark: spark(),
    },
    disponibilidade: {
      rotulo: "Disponibilidade",
      valor: `${disponibilidade}%`,
      icone: "lucide:activity",
      rodape: "no período",
      trendPct: intBetween(1, 4),
      trendDir: "up",
      spark: spark(),
    },
    receitaMes: {
      rotulo: "Receita no mês",
      valor: receita.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
      icone: "lucide:banknote",
      rodape: "faturamento estimado",
      trendPct: intBetween(3, 12),
      trendDir: "up",
      spark: null,
    },
  };

  let horimetro = intBetween(900, 8000);
  const leiturasHorimetro: EquipamentoLeitura[] = Array.from({ length: 5 }, (_, i) => {
    const inicial = horimetro;
    const trabalhadas = intBetween(6, 9);
    const final = inicial + trabalhadas;
    horimetro = final;
    return {
      id: `${id}-lh-${i}`,
      data: `${String(9 - i).padStart(2, "0")}/07`,
      operadorNome: pick(OPERADORES_POOL),
      osNumero: `OS-0${intBetween(15, 25)}`,
      horimetroInicial: inicial.toLocaleString("pt-BR"),
      horimetroFinal: final.toLocaleString("pt-BR"),
      horas: `${trabalhadas},0 h`,
    };
  });

  const fichaTecnica: EquipamentoFichaTecnica = {
    marcaModelo: pick(MARCAS_POOL),
    ano: String(intBetween(2015, 2023)),
    aquisicao: pick(AQUISICAO_POOL),
    descricao: "Uso geral em terraplenagem",
  };

  const barras = Array.from({ length: 8 }, (_, i) => ({
    label: `S${i + 1}`,
    pct: intBetween(50, 92),
  }));
  const picoIdx = barras.reduce((maxI, b, i, arr) => (b.pct > arr[maxI].pct ? i : maxI), 0);
  const utilizacaoSemana: EquipamentoSemana = {
    barras,
    mediaHoras: `${intBetween(36, 44)} h`,
    picoHoras: `${intBetween(45, 50)} h`,
    picoLabel: barras[picoIdx].label,
  };

  return { kpis, leiturasHorimetro, fichaTecnica, utilizacaoSemana };
}
