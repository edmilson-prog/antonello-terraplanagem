import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatDiaCurto, formatHorasNumero, formatHorimetro } from "@/shared/lib/format";
import type {
  Apontamento,
  Cliente,
  Equipamento,
  Operador,
  OrdemServico,
  StatusOS,
} from "@/shared/types";

/*
 * Painel do operador (retaguarda) — derivado de dados reais.
 *
 * Substitui `operador-showcase-data.ts`, que sorteava tudo a partir de um hash
 * do id: horas, OS, equipamentos, CNH, base. Números plausíveis e falsos, que
 * o escritório não tinha como distinguir de verdade.
 *
 * A regra que orienta este arquivo: **onde não há dado, o retorno é vazio ou
 * nulo — nunca um valor plausível**. Um operador recém-cadastrado tem que
 * aparecer como recém-cadastrado.
 *
 * Tudo aqui é função pura sobre listas que a retaguarda já lê por RLS
 * (`apontamentos`, `ordens_servico`, `equipamentos`, `clientes`), então o
 * cálculo é testável sem banco e não custa ida de rede.
 */

const DIA_MS = 24 * 60 * 60 * 1000;
const JANELA_DIAS = 30;
const SEMANAS_NO_GRAFICO = 6;

export interface KpiOperador {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  /** `null` quando não há período anterior com que comparar. */
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  /** `null` esconde a sparkline — melhor que uma linha reta inventada. */
  spark: number[] | null;
}

export interface KpisOperador {
  horasApontadas: KpiOperador;
  osAtivas: KpiOperador;
  osConcluidas: KpiOperador;
  equipamentos: KpiOperador;
}

export interface LinhaApontamento {
  id: string;
  data: string;
  equipamentoNome: string;
  equipamentoIcone: string;
  horimetroInicial: string;
  horimetroFinal: string;
  horas: string;
  osNumero: string;
}

export interface LinhaOrdem {
  id: string;
  numero: string;
  titulo: string;
  clienteNome: string;
  horas: string;
  desde: string;
  status: StatusOS;
}

export interface SemanaOperador {
  barras: { label: string; pct: number; horas: number }[];
  mediaHoras: string;
  picoHoras: string;
  picoLabel: string;
  /** Falso quando nenhuma das semanas teve hora apontada — o card mostra vazio. */
  temDados: boolean;
}

export interface EquipHabilitado {
  id: string;
  nome: string;
  icone: string;
}

export interface CadastraisOperador {
  cnhCategoria: string | null;
  cnhValidade: string | null;
  cnhVencida: boolean;
  nascimento: string | null;
  idade: string | null;
  vinculo: string | null;
  admissao: string | null;
  base: string | null;
}

export interface PainelOperador {
  kpis: KpisOperador;
  apontamentos: LinhaApontamento[];
  ordens: LinhaOrdem[];
  horasSemana: SemanaOperador;
  equipamentos: EquipHabilitado[];
  cadastrais: CadastraisOperador;
  /** Total de apontamentos do operador — distingue "sem dado" de "zero horas". */
  totalApontamentos: number;
}

// ---------------------------------------------------------------------------
// Helpers de tempo. `iniciado_em` é o instante do fato em campo; é por ele que
// tudo se agrupa, não por `created_at` (que é quando a fila offline esvaziou).
// ---------------------------------------------------------------------------

function instante(ap: Apontamento): number {
  return new Date(ap.iniciado_em ?? ap.created_at).getTime();
}

function horasDe(ap: Apontamento): number {
  return ap.horas_trabalhadas ?? 0;
}

function inicioDaSemana(data: Date): Date {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  // Segunda como primeiro dia: é como a obra conta a semana.
  const desloca = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - desloca);
  return d;
}

function variacao(
  atual: number,
  anterior: number,
): { pct: number | null; dir: "up" | "down" | null } {
  // Sem base de comparação não há tendência. Zero anterior com atual positivo
  // seria "+∞%" — que não é informação, é ruído.
  if (anterior <= 0) return { pct: null, dir: null };
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  if (pct === 0) return { pct: null, dir: null };
  return { pct: Math.abs(pct), dir: pct > 0 ? "up" : "down" };
}

/** Sparkline em 0..100 sobre as últimas `SEMANAS_NO_GRAFICO` semanas. */
function sparkSemanal(valoresPorSemana: number[]): number[] | null {
  const maximo = Math.max(...valoresPorSemana, 0);
  if (maximo <= 0) return null;
  return valoresPorSemana.map((v) => Math.round((v / maximo) * 100));
}

// ---------------------------------------------------------------------------

export function apontamentosDoOperadorOrdenados(
  apontamentos: Apontamento[],
  operadorId: string,
): Apontamento[] {
  return apontamentos
    .filter((a) => a.operador_id === operadorId)
    .sort((a, b) => instante(b) - instante(a));
}

/** "Minhas OS" pela ótica da retaguarda: responsável OU tem apontamento nela. */
export function ordensDoOperador(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  operadorId: string,
): OrdemServico[] {
  const comApontamento = new Set(
    apontamentos.filter((a) => a.operador_id === operadorId && a.os_id).map((a) => a.os_id!),
  );
  return ordens.filter((os) => os.responsavel_id === operadorId || comApontamento.has(os.id));
}

function horasPorSemana(apontamentos: Apontamento[], agora: Date): number[] {
  const semanaAtual = inicioDaSemana(agora).getTime();
  const horas = new Array<number>(SEMANAS_NO_GRAFICO).fill(0);

  for (const ap of apontamentos) {
    const semana = inicioDaSemana(new Date(instante(ap))).getTime();
    const atras = Math.round((semanaAtual - semana) / (7 * DIA_MS));
    if (atras >= 0 && atras < SEMANAS_NO_GRAFICO) {
      horas[SEMANAS_NO_GRAFICO - 1 - atras] += horasDe(ap);
    }
  }
  return horas;
}

function montarSemana(horas: number[], agora: Date): SemanaOperador {
  const semanaAtual = inicioDaSemana(agora);
  const barras = horas.map((h, i) => {
    const inicio = new Date(semanaAtual);
    inicio.setDate(inicio.getDate() - (SEMANAS_NO_GRAFICO - 1 - i) * 7);
    return {
      label: inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      horas: Math.round(h * 10) / 10,
      pct: 0,
    };
  });

  const maximo = Math.max(...horas, 0);
  if (maximo > 0) {
    barras.forEach((b, i) => {
      // Piso de 4% para a barra existir visualmente quando houve pouca hora —
      // e ZERO fica zero, senão uma semana parada parece semana trabalhada.
      b.pct = horas[i] > 0 ? Math.max(4, Math.round((horas[i] / maximo) * 100)) : 0;
    });
  }

  const comHora = horas.filter((h) => h > 0);
  const media = comHora.length > 0 ? comHora.reduce((s, h) => s + h, 0) / comHora.length : 0;
  const picoIdx = horas.reduce((maxI, h, i, arr) => (h > arr[maxI] ? i : maxI), 0);

  return {
    barras,
    mediaHoras: formatHorimetro(media),
    picoHoras: formatHorimetro(maximo),
    picoLabel: barras[picoIdx]?.label ?? "—",
    temDados: maximo > 0,
  };
}

function idadeEmAnos(nascimento: string, agora: Date): number {
  const [ano, mes, dia] = nascimento.split("-").map(Number);
  let idade = agora.getFullYear() - ano;
  const passouAniversario =
    agora.getMonth() + 1 > mes || (agora.getMonth() + 1 === mes && agora.getDate() >= dia);
  if (!passouAniversario) idade -= 1;
  return idade;
}

function mesAno(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
}

export function cadastraisDoOperador(operador: Operador, agora: Date): CadastraisOperador {
  const validade = operador.cnh_validade ?? null;
  return {
    cnhCategoria: operador.cnh_categoria ?? null,
    cnhValidade: validade,
    cnhVencida: validade ? new Date(`${validade}T12:00:00`).getTime() < agora.getTime() : false,
    nascimento: operador.data_nascimento ?? null,
    idade: operador.data_nascimento ? `${idadeEmAnos(operador.data_nascimento, agora)} anos` : null,
    vinculo: operador.vinculo ?? null,
    admissao: operador.admissao ? mesAno(operador.admissao) : null,
    base: operador.base ?? null,
  };
}

export interface EntradaPainel {
  operador: Operador;
  apontamentos: Apontamento[];
  ordens: OrdemServico[];
  equipamentos: Equipamento[];
  clientes: Cliente[];
  /** Ids de `operadores_equipamentos`. Lista vazia = nenhum habilitado. */
  equipamentosHabilitadosIds: string[];
  agora?: Date;
}

export function montarPainelOperador({
  operador,
  apontamentos,
  ordens,
  equipamentos,
  clientes,
  equipamentosHabilitadosIds,
  agora = new Date(),
}: EntradaPainel): PainelOperador {
  const meus = apontamentosDoOperadorOrdenados(apontamentos, operador.id);
  const minhasOrdens = ordensDoOperador(ordens, apontamentos, operador.id);

  const nomeEquip = new Map(equipamentos.map((e) => [e.id, e.nome]));
  const iconeEquip = new Map(equipamentos.map((e) => [e.id, TIPO_ICONE[e.tipo]]));
  const nomeCliente = new Map(clientes.map((c) => [c.id, c.nome]));
  const numeroOs = new Map(ordens.map((o) => [o.id, o.numero]));

  // --- KPI: horas apontadas nos últimos 30 dias, contra os 30 anteriores.
  const corte = agora.getTime() - JANELA_DIAS * DIA_MS;
  const corteAnterior = agora.getTime() - 2 * JANELA_DIAS * DIA_MS;
  const horasJanela = meus.filter((a) => instante(a) >= corte).reduce((s, a) => s + horasDe(a), 0);
  const horasAnterior = meus
    .filter((a) => instante(a) >= corteAnterior && instante(a) < corte)
    .reduce((s, a) => s + horasDe(a), 0);
  const tendHoras = variacao(horasJanela, horasAnterior);

  const semanal = horasPorSemana(meus, agora);

  // --- KPI: OS por estado.
  const ativas = minhasOrdens.filter((o) => o.status !== "fechada");
  const concluidas = minhasOrdens.filter((o) => o.status === "fechada");
  const concluidasNaJanela = concluidas.filter(
    (o) => o.fechada_em && new Date(o.fechada_em).getTime() >= corte,
  );

  // --- KPI: equipamentos efetivamente operados na janela (não os habilitados:
  // habilitado é permissão, operado é fato — e o card ao lado já lista a
  // permissão).
  const operadosNaJanela = new Set(
    meus.filter((a) => instante(a) >= corte).map((a) => a.equipamento_id),
  );

  const kpis: KpisOperador = {
    horasApontadas: {
      rotulo: "Horas apontadas",
      valor: formatHorasNumero(horasJanela),
      icone: "lucide:timer",
      rodape: `últimos ${JANELA_DIAS} dias`,
      trendPct: tendHoras.pct,
      trendDir: tendHoras.dir,
      spark: sparkSemanal(semanal),
    },
    osAtivas: {
      rotulo: "OS ativas",
      valor: String(ativas.length),
      icone: "lucide:clipboard-list",
      rodape: ativas.length === 1 ? "em andamento" : "em andamento",
      trendPct: null,
      trendDir: null,
      spark: null,
    },
    osConcluidas: {
      rotulo: "OS concluídas",
      valor: String(concluidas.length),
      icone: "lucide:circle-check",
      rodape:
        concluidasNaJanela.length > 0
          ? `${concluidasNaJanela.length} nos últimos ${JANELA_DIAS} dias`
          : "no total",
      trendPct: null,
      trendDir: null,
      spark: null,
    },
    equipamentos: {
      rotulo: "Equipamentos",
      valor: String(operadosNaJanela.size),
      icone: "lucide:wrench",
      rodape: `operados nos últimos ${JANELA_DIAS} dias`,
      trendPct: null,
      trendDir: null,
      spark: null,
    },
  };

  const linhasApontamento: LinhaApontamento[] = meus.slice(0, 6).map((ap) => ({
    id: ap.id,
    data: formatDiaCurto(new Date(instante(ap))),
    equipamentoNome: nomeEquip.get(ap.equipamento_id) ?? "Equipamento removido",
    equipamentoIcone: iconeEquip.get(ap.equipamento_id) ?? "lucide:truck",
    horimetroInicial: formatHorasNumero(ap.horimetro_inicial),
    horimetroFinal: ap.horimetro_final === null ? "—" : formatHorasNumero(ap.horimetro_final),
    horas: ap.horas_trabalhadas === null ? "em curso" : formatHorimetro(ap.horas_trabalhadas),
    osNumero: (ap.os_id && numeroOs.get(ap.os_id)) || "—",
  }));

  const horasPorOs = new Map<string, number>();
  for (const ap of apontamentos) {
    if (!ap.os_id) continue;
    horasPorOs.set(ap.os_id, (horasPorOs.get(ap.os_id) ?? 0) + horasDe(ap));
  }

  const linhasOrdem: LinhaOrdem[] = [...minhasOrdens]
    .sort((a, b) => new Date(b.aberta_em).getTime() - new Date(a.aberta_em).getTime())
    .slice(0, 6)
    .map((os) => ({
      id: os.id,
      numero: os.numero,
      titulo: os.obra_nome,
      clienteNome: nomeCliente.get(os.cliente_id) ?? "Cliente removido",
      horas: formatHorimetro(horasPorOs.get(os.id) ?? 0),
      desde: new Date(os.aberta_em).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      status: os.status,
    }));

  const habilitados = new Set(equipamentosHabilitadosIds);
  const equipHabilitados: EquipHabilitado[] = equipamentos
    .filter((e) => habilitados.has(e.id))
    .map((e) => ({ id: e.id, nome: e.nome, icone: TIPO_ICONE[e.tipo] }));

  return {
    kpis,
    apontamentos: linhasApontamento,
    ordens: linhasOrdem,
    horasSemana: montarSemana(semanal, agora),
    equipamentos: equipHabilitados,
    cadastrais: cadastraisDoOperador(operador, agora),
    totalApontamentos: meus.length,
  };
}
