import { consumoMedioLh, totalHoras, totalLitros } from "@/features/diesel/derivacoes";
import { formatBRL } from "@/features/retaguarda/format";
import { formatDiaCurto, formatHorasNumero, formatHorimetro } from "@/shared/lib/format";
import type {
  Abastecimento,
  Apontamento,
  Equipamento,
  Faturamento,
  FormaAquisicao,
  Operador,
  OrdemServico,
  RegistroManutencao,
} from "@/shared/types";

/*
 * Painel do equipamento (retaguarda) — derivado de dados reais.
 *
 * Substitui `equipamento-showcase-data.ts`, que sorteava horas do mês,
 * disponibilidade, receita, leituras de horímetro, consumo de diesel e até a
 * marca do modelo a partir de um hash do id. Uma escavadeira recém-cadastrada
 * exibia "182 h no mês · 94% de disponibilidade · R$ 38.000 de receita".
 *
 * Mesma regra do painel do operador: onde não há dado, o retorno é nulo, e a
 * tela mostra o vazio em vez de um número plausível.
 */

const DIA_MS = 24 * 60 * 60 * 1000;
const JANELA_DIAS = 30;
const SEMANAS_NO_GRAFICO = 8;

export interface KpiEquipamento {
  rotulo: string;
  valor: string;
  icone: string;
  rodape: string;
  trendPct: number | null;
  trendDir: "up" | "down" | null;
  spark: number[] | null;
}

export interface KpisEquipamento {
  horimetro: KpiEquipamento;
  horasMes: KpiEquipamento;
  disponibilidade: KpiEquipamento;
  receitaMes: KpiEquipamento;
}

export interface LeituraHorimetro {
  id: string;
  data: string;
  operadorNome: string;
  osNumero: string;
  horimetroInicial: string;
  horimetroFinal: string;
  horas: string;
}

export interface FichaTecnica {
  marcaModelo: string | null;
  ano: string | null;
  aquisicao: string | null;
  descricao: string | null;
}

export interface SemanaEquipamento {
  barras: { label: string; pct: number; horas: number }[];
  mediaHoras: string;
  picoHoras: string;
  picoLabel: string;
  temDados: boolean;
}

export interface PainelEquipamento {
  kpis: KpisEquipamento;
  leiturasHorimetro: LeituraHorimetro[];
  fichaTecnica: FichaTecnica;
  utilizacaoSemana: SemanaEquipamento;
  /** `null` quando não há abastecimento ou não há horas no período. */
  dieselMedioLh: string | null;
}

const FORMA_AQUISICAO_LABEL: Record<FormaAquisicao, string> = {
  recursos_proprios: "Recursos próprios",
  finame: "FINAME/BNDES",
  leasing: "Leasing",
  consorcio: "Consórcio",
};

export function rotuloAquisicao(equipamento: Equipamento): string | null {
  if (!equipamento.aquisicao_forma) return null;
  const base = FORMA_AQUISICAO_LABEL[equipamento.aquisicao_forma];
  return equipamento.aquisicao_parcelas ? `${base} · ${equipamento.aquisicao_parcelas}x` : base;
}

function instante(ap: Apontamento): number {
  return new Date(ap.iniciado_em ?? ap.created_at).getTime();
}

function inicioDaSemana(data: Date): Date {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function variacao(
  atual: number,
  anterior: number,
): { pct: number | null; dir: "up" | "down" | null } {
  if (anterior <= 0) return { pct: null, dir: null };
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  if (pct === 0) return { pct: null, dir: null };
  return { pct: Math.abs(pct), dir: pct > 0 ? "up" : "down" };
}

function spark(valores: number[]): number[] | null {
  const maximo = Math.max(...valores, 0);
  if (maximo <= 0) return null;
  return valores.map((v) => Math.round((v / maximo) * 100));
}

function horasPorSemana(apontamentos: Apontamento[], agora: Date): number[] {
  const semanaAtual = inicioDaSemana(agora).getTime();
  const horas = new Array<number>(SEMANAS_NO_GRAFICO).fill(0);
  for (const ap of apontamentos) {
    const atras = Math.round(
      (semanaAtual - inicioDaSemana(new Date(instante(ap))).getTime()) / (7 * DIA_MS),
    );
    if (atras >= 0 && atras < SEMANAS_NO_GRAFICO) {
      horas[SEMANAS_NO_GRAFICO - 1 - atras] += ap.horas_trabalhadas ?? 0;
    }
  }
  return horas;
}

function montarSemana(horas: number[], agora: Date): SemanaEquipamento {
  const semanaAtual = inicioDaSemana(agora);
  const maximo = Math.max(...horas, 0);

  const barras = horas.map((h, i) => {
    const inicio = new Date(semanaAtual);
    inicio.setDate(inicio.getDate() - (SEMANAS_NO_GRAFICO - 1 - i) * 7);
    return {
      label: inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      horas: Math.round(h * 10) / 10,
      // Zero fica zero: uma semana com a máquina parada não pode parecer
      // semana de trabalho leve.
      pct: maximo > 0 && h > 0 ? Math.max(4, Math.round((h / maximo) * 100)) : 0,
    };
  });

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

/*
 * Disponibilidade = fração da janela em que a máquina NÃO esteve em ordem de
 * manutenção aberta. Conta dias de indisponibilidade a partir dos registros,
 * recortados à janela — uma ordem aberta há 90 dias só desconta os 30 que
 * caem dentro dela.
 *
 * Ordens sobrepostas (preventiva e corretiva ao mesmo tempo) contariam duas
 * vezes se somássemos os intervalos, então eles são unidos antes.
 */
export function diasIndisponivel(
  registros: RegistroManutencao[],
  inicioJanela: number,
  fimJanela: number,
): number {
  const intervalos = registros
    .map((r) => {
      const inicio = new Date(r.aberta_em).getTime();
      const fim = r.realizada_em ? new Date(r.realizada_em).getTime() : fimJanela;
      return [Math.max(inicio, inicioJanela), Math.min(fim, fimJanela)] as const;
    })
    .filter(([i, f]) => f > i)
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let atualInicio = 0;
  let atualFim = 0;
  for (const [inicio, fim] of intervalos) {
    if (inicio > atualFim) {
      total += atualFim - atualInicio;
      atualInicio = inicio;
      atualFim = fim;
    } else if (fim > atualFim) {
      atualFim = fim;
    }
  }
  total += atualFim - atualInicio;
  return total / DIA_MS;
}

export interface EntradaPainelEquipamento {
  equipamento: Equipamento;
  apontamentos: Apontamento[];
  ordens: OrdemServico[];
  operadores: Operador[];
  abastecimentos: Abastecimento[];
  registrosManutencao: RegistroManutencao[];
  faturamentos: Faturamento[];
  agora?: Date;
}

export function montarPainelEquipamento({
  equipamento,
  apontamentos,
  ordens,
  operadores,
  abastecimentos,
  registrosManutencao,
  faturamentos,
  agora = new Date(),
}: EntradaPainelEquipamento): PainelEquipamento {
  const meus = apontamentos
    .filter((a) => a.equipamento_id === equipamento.id)
    .sort((a, b) => instante(b) - instante(a));

  const nomeOperador = new Map(operadores.map((o) => [o.id, o.nome]));
  const numeroOs = new Map(ordens.map((o) => [o.id, o.numero]));

  const fimJanela = agora.getTime();
  const corte = fimJanela - JANELA_DIAS * DIA_MS;
  const corteAnterior = fimJanela - 2 * JANELA_DIAS * DIA_MS;

  const naJanela = meus.filter((a) => instante(a) >= corte);
  const horasJanela = naJanela.reduce((s, a) => s + (a.horas_trabalhadas ?? 0), 0);
  const horasAnterior = meus
    .filter((a) => instante(a) >= corteAnterior && instante(a) < corte)
    .reduce((s, a) => s + (a.horas_trabalhadas ?? 0), 0);
  const tendHoras = variacao(horasJanela, horasAnterior);

  const semanal = horasPorSemana(meus, agora);

  // --- Disponibilidade.
  const manutencoesDoEquip = registrosManutencao.filter((r) => r.equipamento_id === equipamento.id);
  const parado = diasIndisponivel(manutencoesDoEquip, corte, fimJanela);
  const paradoAnterior = diasIndisponivel(manutencoesDoEquip, corteAnterior, corte);
  const disponibilidade = Math.max(0, Math.round((1 - parado / JANELA_DIAS) * 100));
  const dispAnterior = Math.max(0, Math.round((1 - paradoAnterior / JANELA_DIAS) * 100));
  const tendDisp = variacao(disponibilidade, dispAnterior);

  // --- Receita: itens de faturamento cuja origem é este equipamento. É o que
  // a máquina de fato faturou, não uma estimativa de horas × tabela.
  const receitaJanela = somaFaturadaDoEquipamento(faturamentos, equipamento.id, corte, fimJanela);
  const receitaAnterior = somaFaturadaDoEquipamento(
    faturamentos,
    equipamento.id,
    corteAnterior,
    corte,
  );
  const tendReceita = variacao(receitaJanela, receitaAnterior);

  // --- Consumo de diesel na janela.
  const absJanela = abastecimentos.filter(
    (a) => a.equipamento_id === equipamento.id && new Date(a.abastecido_em).getTime() >= corte,
  );
  const consumo = consumoMedioLh(totalLitros(absJanela), totalHoras(naJanela), absJanela.length);

  const kpis: KpisEquipamento = {
    horimetro: {
      rotulo: "Horímetro atual",
      valor: formatHorimetro(equipamento.horimetro_atual),
      icone: "lucide:gauge",
      rodape:
        horasJanela > 0
          ? `+${formatHorimetro(horasJanela)} em ${JANELA_DIAS} dias`
          : `sem horas em ${JANELA_DIAS} dias`,
      trendPct: null,
      trendDir: null,
      spark: spark(semanal),
    },
    horasMes: {
      rotulo: "Horas no mês",
      valor: formatHorimetro(horasJanela),
      icone: "lucide:clock",
      rodape: tendHoras.pct === null ? `últimos ${JANELA_DIAS} dias` : "vs. período anterior",
      trendPct: tendHoras.pct,
      trendDir: tendHoras.dir,
      spark: spark(semanal),
    },
    disponibilidade: {
      rotulo: "Disponibilidade",
      valor: `${disponibilidade}%`,
      icone: "lucide:activity",
      rodape:
        parado > 0 ? `${Math.round(parado)} dia(s) em manutenção` : "sem manutenção no período",
      trendPct: tendDisp.pct,
      trendDir: tendDisp.dir,
      spark: null,
    },
    receitaMes: {
      rotulo: "Receita no mês",
      valor: formatBRL(receitaJanela),
      icone: "lucide:banknote",
      rodape: receitaJanela > 0 ? "faturado no período" : "nada faturado no período",
      trendPct: tendReceita.pct,
      trendDir: tendReceita.dir,
      spark: null,
    },
  };

  const leiturasHorimetro: LeituraHorimetro[] = meus.slice(0, 6).map((ap) => ({
    id: ap.id,
    data: formatDiaCurto(new Date(instante(ap))),
    operadorNome: nomeOperador.get(ap.operador_id) ?? "Operador removido",
    osNumero: (ap.os_id && numeroOs.get(ap.os_id)) || "—",
    horimetroInicial: formatHorasNumero(ap.horimetro_inicial),
    horimetroFinal: ap.horimetro_final === null ? "—" : formatHorasNumero(ap.horimetro_final),
    horas: ap.horas_trabalhadas === null ? "em curso" : formatHorimetro(ap.horas_trabalhadas),
  }));

  return {
    kpis,
    leiturasHorimetro,
    fichaTecnica: {
      marcaModelo: equipamento.marca,
      ano: equipamento.ano,
      aquisicao: rotuloAquisicao(equipamento),
      descricao: equipamento.descricao,
    },
    utilizacaoSemana: montarSemana(semanal, agora),
    dieselMedioLh: consumo === null ? null : `${consumo.toFixed(1).replace(".", ",")} L/h`,
  };
}

/*
 * Soma dos itens de faturamento originados neste equipamento, dentro da
 * janela. `origem_id` do item aponta para o equipamento nos itens de
 * hora-máquina; mobilização aponta para o preço, então não entra — é receita
 * do transporte, não da máquina em operação.
 */
export function somaFaturadaDoEquipamento(
  faturamentos: Faturamento[],
  equipamentoId: string,
  inicio: number,
  fim: number,
): number {
  let total = 0;
  for (const f of faturamentos) {
    // Rascunho não é receita. `faturado_em` só existe depois da confirmação —
    // e sem esta guarda um rascunho passaria pelo filtro de janela, porque
    // toda comparação com NaN é falsa.
    if (f.status !== "faturado" || !f.faturado_em) continue;
    const quando = new Date(f.faturado_em).getTime();
    if (quando < inicio || quando >= fim) continue;
    for (const item of f.itens) {
      if (item.tipo === "hora_maquina" && item.origem_id === equipamentoId) {
        total += item.valor_total;
      }
    }
  }
  return Math.round(total * 100) / 100;
}
