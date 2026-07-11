// DADOS DE EXEMPLO — TEMPORÁRIO.
// Enquanto KPIs financeiros (faturado, orçamentos, recebimentos) e o histórico
// por OS do cliente não têm backing real (schema + migração pendentes), esta é
// a ÚNICA fonte de exemplo da tela de detalhe do cliente. Determinístico por
// `id`. NÃO inclui `legado_*` (vêm reais do `cliente`) nem `contasReceber`
// (agora real via `contasReceberStore` — `kpis.saldoReceber.valor`/`.rodape`
// são placeholders sobrescritos pelo orquestrador). Quando os dados reais
// existirem, trocar por queries SEM mexer nos componentes.

export interface ClienteKpiItem {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[] | null;
  alerta?: boolean;
}

export interface ClienteShowcaseKpis {
  faturado: ClienteKpiItem;
  saldoReceber: ClienteKpiItem;
  osAtivasSpark: number[];
  orcamentosSpark: number[];
  orcamentosValor: string;
}

export interface ClienteOrdemFinanceiro {
  horas: string;
  valor: string;
}

export interface ClienteCadastrais {
  fantasia: string;
  segmento: string;
  email: string;
  endereco: string;
  contatoNome: string;
  contatoPapel: string;
}

export interface ClienteRecebimento {
  id: string;
  titulo: string;
  quando: string;
  valor: string;
  icone: string;
}

export interface ClienteShowcase {
  kpis: ClienteShowcaseKpis;
  porOS: ClienteOrdemFinanceiro[];
  cadastrais: ClienteCadastrais;
  recebimentos: ClienteRecebimento[];
  recorrente: boolean;
  ultimaOS: string;
  origemMigracao: string;
}

const FANTASIA_POOL = ["Vale Verde", "Serra Azul", "Pedra Branca", "Rio Bonito", "Campo Alto"];
const SEGMENTO_POOL = ["Construção civil", "Loteamentos", "Agroindústria"];
const RUAS_POOL = [
  "Rua das Palmeiras, 120",
  "Av. Independência, 845",
  "Rua Sete de Setembro, 310",
  "Rua Bento Gonçalves, 45",
];
const CIDADES_POOL = ["Santo Ângelo — RS", "Frederico Westphalen — RS", "Palmeira das Missões — RS"];
const CONTATO_NOME_POOL = ["Carlos Eduardo", "Fernanda Lima", "Roberto Costa", "Juliana Mendes"];
const CONTATO_PAPEL_POOL = ["Engenheiro responsável", "Comprador", "Sócio"];
const RECEBIMENTO_ICONE_POOL = ["lucide:smartphone-nfc", "lucide:arrow-left-right", "lucide:barcode"];
const RECEBIMENTO_TITULO_POOL = ["PIX recebido", "TED recebida", "Boleto compensado"];

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

function brl(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function showcaseDoCliente(id: string): ClienteShowcase {
  const rand = mulberry32(hashString(id));
  const intBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[intBetween(0, arr.length - 1)];
  const spark = () => Array.from({ length: 8 }, () => intBetween(20, 95));

  const faturadoTrend = intBetween(6, 24);

  const kpis: ClienteShowcaseKpis = {
    faturado: {
      rotulo: "Faturado em 2025",
      valor: brl(intBetween(80, 220) * 1000),
      icone: "lucide:wallet",
      rodape: "vs. 2024",
      trendPct: faturadoTrend,
      trendDir: "up",
      spark: spark(),
    },
    saldoReceber: {
      rotulo: "Saldo a receber",
      valor: "",
      rodape: "",
      icone: "lucide:alert-circle",
      trendPct: null,
      trendDir: null,
      spark: spark(),
      alerta: true,
    },
    osAtivasSpark: spark(),
    orcamentosSpark: spark(),
    orcamentosValor: `${brl(intBetween(40, 140) * 1000)} em propostas`,
  };

  const porOS: ClienteOrdemFinanceiro[] = Array.from({ length: 6 }, () => ({
    horas: `${intBetween(8, 62)} h`,
    valor: brl(intBetween(6, 40) * 1000),
  }));

  const cadastrais: ClienteCadastrais = {
    fantasia: pick(FANTASIA_POOL),
    segmento: pick(SEGMENTO_POOL),
    email: "contato@exemplo.com.br",
    endereco: `${pick(RUAS_POOL)} · ${pick(CIDADES_POOL)}`,
    contatoNome: pick(CONTATO_NOME_POOL),
    contatoPapel: pick(CONTATO_PAPEL_POOL),
  };

  const recebimentos: ClienteRecebimento[] = Array.from({ length: 4 }, (_, i) => ({
    id: `${id}-rec-${i}`,
    titulo: `${pick(RECEBIMENTO_TITULO_POOL)} — NF ${intBetween(1000, 1999)}`,
    quando: `${String(intBetween(1, 28)).padStart(2, "0")}/0${intBetween(1, 9)} · ${String(intBetween(7, 19)).padStart(2, "0")}:${String(intBetween(0, 59)).padStart(2, "0")}`,
    valor: brl(intBetween(3, 30) * 1000),
    icone: pick(RECEBIMENTO_ICONE_POOL),
  }));

  const recorrente = rand() > 0.4;
  const ultimaOS = `${String(intBetween(1, 28)).padStart(2, "0")}/0${intBetween(1, 9)}/2025`;
  const origemMigracao = "Migração jun/2024";

  return { kpis, porOS, cadastrais, recebimentos, recorrente, ultimaOS, origemMigracao };
}
