import type { Apontamento, Cliente, ContaReceber } from "@/shared/types";
import type {
  AlertaConsumoAnomalo,
  AnomaliaApontamento,
  InsightGerencial,
  PrevisaoCaixaPeriodo,
  RiscoCliente,
} from "@/features/ia/types";
import { comDelay } from "@/features/ia/delay";
import { formatBRL } from "@/features/retaguarda/format";
import type { IndicadorDieselEquipamento } from "@/features/diesel/derivacoes";
import { contaVencida } from "@/features/financeiro/derivacoes";
import { round2 } from "@/features/faturamento/calculo";

const LIMITE_HORAS_APONTAMENTO_UNICO = 16;
const LIMITE_HORAS_EQUIPAMENTO_DIA = 14;

function diaDe(apontamento: Apontamento): string {
  return apontamento.iniciado_em.slice(0, 10);
}

// A2 — regras determinísticas de anomalia (sem Math.random, sem chamada de
// rede). "IA" aqui é a narrativa de produto; a implementação mockada é um
// motor de regras sobre os apontamentos já finalizados, coerente com o RF-002
// (não inventar cálculo novo) e a convenção de determinismo do projeto.
export function detectarAnomalias(apontamentos: Apontamento[]): AnomaliaApontamento[] {
  const finalizados = apontamentos.filter(
    (a) => a.status === "finalizado" && a.horas_trabalhadas != null,
  );
  const anomalias: AnomaliaApontamento[] = [];
  const jaAdicionado = new Set<string>();

  const adicionar = (apontamento_id: string, motivo: string, severidade: "atencao" | "alerta") => {
    const chave = `${apontamento_id}::${motivo}`;
    if (jaAdicionado.has(chave)) return;
    jaAdicionado.add(chave);
    anomalias.push({ apontamento_id, motivo, severidade });
  };

  for (const a of finalizados) {
    if ((a.horas_trabalhadas as number) > LIMITE_HORAS_APONTAMENTO_UNICO) {
      adicionar(
        a.id,
        `Salto de horímetro atípico (${a.horas_trabalhadas}h em um único apontamento)`,
        "alerta",
      );
    }
  }

  const porEquipamentoDia = new Map<string, Apontamento[]>();
  for (const a of finalizados) {
    const chave = `${a.equipamento_id}::${diaDe(a)}`;
    porEquipamentoDia.set(chave, [...(porEquipamentoDia.get(chave) ?? []), a]);
  }
  for (const grupo of porEquipamentoDia.values()) {
    const totalHoras = grupo.reduce((soma, a) => soma + (a.horas_trabalhadas as number), 0);
    if (grupo.length > 1 && totalHoras > LIMITE_HORAS_EQUIPAMENTO_DIA) {
      for (const a of grupo) {
        adicionar(
          a.id,
          `Horas do equipamento acima do padrão do dia (${totalHoras}h somadas no dia)`,
          "atencao",
        );
      }
    }
  }

  const porAssinatura = new Map<string, Apontamento[]>();
  for (const a of finalizados) {
    const chave = `${a.equipamento_id}::${a.operador_id}::${a.horimetro_inicial}::${a.iniciado_em}`;
    porAssinatura.set(chave, [...(porAssinatura.get(chave) ?? []), a]);
  }
  for (const grupo of porAssinatura.values()) {
    if (grupo.length > 1) {
      for (const a of grupo) {
        adicionar(a.id, "Possível apontamento duplicado", "atencao");
      }
    }
  }

  return anomalias;
}

// B5 — insight gerencial em linguagem natural. Template determinístico sobre
// números já calculados pela página (gerencial/derivacoes.ts) — nenhum
// cálculo de margem/faturamento novo (RF-002).
export interface ContextoInsightGerencial {
  totalAtual: number;
  totalAnterior: number;
  margemAtual: number;
  margemAnterior: number;
}

function variacaoTexto(atual: number, anterior: number): string {
  if (anterior === 0) return "sem comparação — período anterior sem dados";
  const percentual = Math.round(((atual - anterior) / anterior) * 1000) / 10;
  return percentual >= 0 ? `alta de ${percentual}%` : `queda de ${Math.abs(percentual)}%`;
}

export async function gerarInsight(
  contexto: ContextoInsightGerencial,
  opts: { delayMs?: number } = {},
): Promise<InsightGerencial> {
  const texto = [
    `Faturamento no período: ${formatBRL(contexto.totalAtual)} (${variacaoTexto(contexto.totalAtual, contexto.totalAnterior)} em relação ao período anterior).`,
    `Margem no período: ${formatBRL(contexto.margemAtual)} (${variacaoTexto(contexto.margemAtual, contexto.margemAnterior)}).`,
  ].join(" ");
  return comDelay({ texto, gerado_em: new Date().toISOString() }, opts.delayMs ?? 1200);
}

// B6 — manutenção preditiva por anomalia de CONSUMO, distinta do alerta
// preventivo por horas (features/manutencao/derivacoes.ts). Sem histórico
// suficiente (< 2 equipamentos com >= 2 abastecimentos), não arrisca alerta
// falso — retorna lista vazia (edge case do PRD).
const LIMITE_PERCENTUAL_ACIMA_MEDIA = 30;
const MINIMO_EQUIPAMENTOS_COM_DADO = 2;

export function alertasConsumoAnomalo(
  indicadores: IndicadorDieselEquipamento[],
): AlertaConsumoAnomalo[] {
  const comDado = indicadores.filter(
    (i): i is IndicadorDieselEquipamento & { consumo_medio_l_h: number } =>
      i.consumo_medio_l_h != null && i.qtd_abastecimentos >= 2,
  );
  if (comDado.length < MINIMO_EQUIPAMENTOS_COM_DADO) return [];

  const media = comDado.reduce((soma, i) => soma + i.consumo_medio_l_h, 0) / comDado.length;
  const limite = media * (1 + LIMITE_PERCENTUAL_ACIMA_MEDIA / 100);

  return comDado
    .filter((i) => i.consumo_medio_l_h > limite)
    .map((i) => ({
      equipamento_id: i.equipamento.id,
      consumo_medio_l_h: i.consumo_medio_l_h,
      media_frota_l_h: Math.round(media * 10) / 10,
      percentual_acima: Math.round(((i.consumo_medio_l_h - media) / media) * 100),
    }));
}

// B8 — previsão de caixa e risco de inadimplência. Ambas são agregações
// puras sobre ContaReceber já existente (PRD-007) — nenhuma regra de
// cobrança nova. "Estimativa — base histórica limitada" é comunicado na UI
// (previsao-caixa-card.tsx), não aqui.
function somaAteDias(contasAbertas: ContaReceber[], hojeISO: string, dias: number): number {
  const limite = new Date(`${hojeISO}T00:00:00.000Z`);
  limite.setUTCDate(limite.getUTCDate() + dias);
  const limiteISO = limite.toISOString().slice(0, 10);
  return round2(
    contasAbertas
      .filter((c) => c.vencimento >= hojeISO && c.vencimento <= limiteISO)
      .reduce((soma, c) => soma + c.valor, 0),
  );
}

export function preverCaixa(
  contasReceber: ContaReceber[],
  opts: { hojeISO?: string } = {},
): PrevisaoCaixaPeriodo[] {
  const hojeISO = opts.hojeISO ?? new Date().toISOString().slice(0, 10);
  const abertas = contasReceber.filter((c) => c.status === "aberta");
  return [30, 60, 90].map((dias) => ({
    dias: dias as 30 | 60 | 90,
    valor_previsto: somaAteDias(abertas, hojeISO, dias),
  }));
}

export function avaliarRiscoClientes(
  contasReceber: ContaReceber[],
  clientes: Cliente[],
  opts: { hojeISO?: string } = {},
): RiscoCliente[] {
  const hojeISO = opts.hojeISO ?? new Date().toISOString().slice(0, 10);
  const clientesComConta = [...new Set(contasReceber.map((c) => c.cliente_id))];
  const riscos: RiscoCliente[] = [];
  for (const clienteId of clientesComConta) {
    const vencidas = contasReceber.filter(
      (c) => c.cliente_id === clienteId && contaVencida(c, hojeISO),
    ).length;
    if (vencidas === 0) continue;
    const nivel = vencidas >= 2 ? "alto" : "medio";
    const nome = clientes.find((c) => c.id === clienteId)?.nome ?? "cliente";
    riscos.push({
      cliente_id: clienteId,
      nivel,
      motivo: `${vencidas} conta${vencidas > 1 ? "s" : ""} vencida${vencidas > 1 ? "s" : ""} — ${nome}`,
    });
  }
  return riscos.sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === "alto" ? -1 : 1));
}
