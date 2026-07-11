// DADOS DE EXEMPLO — TEMPORÁRIO.
// Enquanto apontamentos/OS/KPIs do operador não têm backing real (schema +
// migração mock→real pendentes), esta é a ÚNICA fonte de dados de exemplo da
// tela de detalhe do operador. É determinístico por `id` (mesmo operador →
// mesmos números, estáveis entre renders). Quando os dados reais existirem,
// trocar por queries reais SEM mexer nos componentes de apresentação.

export interface ShowcaseKpiItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[];
}

export interface ShowcaseKpis {
  horasApontadas: ShowcaseKpiItem;
  osAtivas: ShowcaseKpiItem;
  osConcluidas: ShowcaseKpiItem;
  equipamentos: ShowcaseKpiItem;
}

export interface ShowcaseApontamento {
  id: string;
  data: string;
  equipamentoNome: string;
  equipamentoIcone: string;
  horimetroInicial: string;
  horimetroFinal: string;
  horas: string;
  osNumero: string;
}

export interface ShowcaseOrdem {
  id: string;
  numero: string;
  titulo: string;
  clienteNome: string;
  horas: string;
  desde: string;
  status: "aberta" | "em_andamento" | "fechada";
}

export interface ShowcaseSemana {
  barras: { label: string; pct: number }[];
  mediaHoras: string;
  picoHoras: string;
  picoLabel: string;
}

export interface ShowcaseEquip {
  nome: string;
  icone: string;
}

export interface ShowcaseCadastrais {
  cnhCategoria: string;
  cnhValidade: string;
  nascimento: string;
  idade: string;
  vinculo: string;
  admissao: string;
  base: string;
}

export interface ShowcaseAcessoApp {
  liberado: boolean;
  ultimoAcesso: string;
  dispositivo: string;
  versao: string;
  apontaVia: string;
}

export interface OperadorShowcase {
  kpis: ShowcaseKpis;
  apontamentos: ShowcaseApontamento[];
  ordens: ShowcaseOrdem[];
  horasSemana: ShowcaseSemana;
  equipamentos: ShowcaseEquip[];
  cadastrais: ShowcaseCadastrais;
  acessoApp: ShowcaseAcessoApp;
}

const ICONE_ESCAVADEIRA = "lucide:truck";
const ICONE_RETRO = "lucide:tractor";
const ICONE_PA = "lucide:forklift";

const EQUIPAMENTOS_POOL: ShowcaseEquip[] = [
  { nome: "Escavadeira CAT 320", icone: ICONE_ESCAVADEIRA },
  { nome: "Retro JCB 3CX", icone: ICONE_RETRO },
  { nome: "Pá XCMG", icone: ICONE_PA },
  { nome: "Basculante", icone: ICONE_ESCAVADEIRA },
  { nome: "Trator D6", icone: ICONE_RETRO },
];

const OBRAS_POOL = [
  "Terraplenagem — lote industrial",
  "Abertura de acesso e drenagem",
  "Nivelamento de pátio",
  "Fundação de galpão — estacas",
  "Corte e aterro — loteamento",
];

const CLIENTES_POOL = [
  "Essavado Ltda.",
  "Construtora Sul",
  "Agro Vale Verde",
  "Metalúrgica Boa Vista",
  "Rodobens Engenharia",
];

const BASES_POOL = ["Santo Ângelo — RS", "Frederico Westphalen — RS", "Palmeira das Missões — RS"];
const DISPOSITIVOS_POOL = ["Android · Moto G", "Android · Galaxy A15", "Android · Redmi 12"];
const CNH_CATS = ["D", "E", "AD", "AE"];

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

export function showcaseDoOperador(id: string): OperadorShowcase {
  const rand = mulberry32(hashString(id));
  const intBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[intBetween(0, arr.length - 1)];

  // Equipamentos habilitados (2..4 estáveis).
  const qtdEquip = intBetween(2, 4);
  const equipamentos = EQUIPAMENTOS_POOL.slice(0, qtdEquip);

  // KPIs.
  const horas = intBetween(120, 220);
  const horasTrend = intBetween(-8, 18);
  const osAtivas = intBetween(1, 4);
  const osEmAndamento = Math.max(1, osAtivas - intBetween(0, 1));
  const osConcluidas = intBetween(8, 24);
  const spark = () => Array.from({ length: 8 }, () => intBetween(20, 95));

  const kpis: ShowcaseKpis = {
    horasApontadas: {
      rotulo: "Horas apontadas",
      valor: String(horas),
      icone: "lucide:clock",
      rodape: "vs. mês anterior",
      trendPct: Math.abs(horasTrend),
      trendDir: horasTrend >= 0 ? "up" : "down",
      spark: spark(),
    },
    osAtivas: {
      rotulo: "OS ativas",
      valor: String(osAtivas),
      icone: "lucide:clipboard-list",
      rodape: `${osEmAndamento} em andamento · ${osAtivas - osEmAndamento} aberta(s)`,
      trendPct: null,
      trendDir: null,
      spark: spark(),
    },
    osConcluidas: {
      rotulo: "OS concluídas",
      valor: String(osConcluidas),
      icone: "lucide:circle-check-big",
      rodape: "no mês",
      trendPct: intBetween(1, 5),
      trendDir: "up",
      spark: spark(),
    },
    equipamentos: {
      rotulo: "Equipamentos",
      valor: String(qtdEquip),
      icone: "lucide:truck",
      rodape: "operados no período",
      trendPct: null,
      trendDir: null,
      spark: spark(),
    },
  };

  // Apontamentos recentes (5).
  let horimetro = intBetween(900, 4200);
  const apontamentos: ShowcaseApontamento[] = Array.from({ length: 5 }, (_, i) => {
    const equip = pick(equipamentos);
    const inicial = horimetro;
    const trabalhadas = intBetween(6, 9);
    const final = inicial + trabalhadas;
    horimetro = final;
    const dia = String(9 - i).padStart(2, "0");
    return {
      id: `${id}-ap-${i}`,
      data: `${dia}/07`,
      equipamentoNome: equip.nome,
      equipamentoIcone: equip.icone,
      horimetroInicial: inicial.toLocaleString("pt-BR"),
      horimetroFinal: final.toLocaleString("pt-BR"),
      horas: `${trabalhadas},0 h`,
      osNumero: `OS-0${intBetween(15, 25)}`,
    };
  });

  // Ordens vinculadas (4): 2 em andamento, 1 aberta, 1 fechada.
  const statuses: ShowcaseOrdem["status"][] = ["em_andamento", "em_andamento", "aberta", "fechada"];
  const ordens: ShowcaseOrdem[] = statuses.map((status, i) => ({
    id: `${id}-os-${i}`,
    numero: `OS-0${intBetween(10, 25)}`,
    titulo: pick(OBRAS_POOL),
    clienteNome: pick(CLIENTES_POOL),
    horas: `${intBetween(8, 62)} h`,
    desde: `desde ${String(intBetween(1, 28)).padStart(2, "0")}/0${intBetween(6, 7)}`,
    status,
  }));

  // Horas por semana (8 barras).
  const barras = Array.from({ length: 8 }, (_, i) => ({
    label: `S${i + 1}`,
    pct: intBetween(52, 92),
  }));
  const picoIdx = barras.reduce((maxI, b, i, arr) => (b.pct > arr[maxI].pct ? i : maxI), 0);
  const horasSemana: ShowcaseSemana = {
    barras,
    mediaHoras: `${intBetween(38, 44)} h`,
    picoHoras: `${intBetween(45, 48)} h`,
    picoLabel: barras[picoIdx].label,
  };

  // Cadastrais.
  const anoNasc = intBetween(1975, 1995);
  const cadastrais: ShowcaseCadastrais = {
    cnhCategoria: pick(CNH_CATS),
    cnhValidade: `${String(intBetween(1, 12)).padStart(2, "0")}/${intBetween(2026, 2031)}`,
    nascimento: `${String(intBetween(1, 28)).padStart(2, "0")}/${String(intBetween(1, 12)).padStart(2, "0")}/${anoNasc}`,
    idade: `${2026 - anoNasc} anos`,
    vinculo: "CLT",
    admissao: `mar/${intBetween(2018, 2023)}`,
    base: pick(BASES_POOL),
  };

  // Acesso ao app.
  const acessoApp: ShowcaseAcessoApp = {
    liberado: true,
    ultimoAcesso: `Hoje, 0${intBetween(6, 9)}:${String(intBetween(0, 59)).padStart(2, "0")}`,
    dispositivo: pick(DISPOSITIVOS_POOL),
    versao: "v0.1 · fundação",
    apontaVia: "App de campo",
  };

  return { kpis, apontamentos, ordens, horasSemana, equipamentos, cadastrais, acessoApp };
}
