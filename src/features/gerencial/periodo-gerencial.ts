import { mesAnterior, proximoMes } from "@/shared/lib/periodo-mensal";
import type { IntervaloPeriodo } from "@/features/dashboard/periodo";
import type { PeriodoFiltro } from "@/features/diesel/derivacoes";

// Período do painel gerencial: sempre um intervalo de meses fechados
// ("YYYY-MM" .. "YYYY-MM", inclusive nas duas pontas). Distinto de
// PeriodoDashboard (hoje/semana/mês do PRD-015) e de periodo-mensal.ts (mês
// único do PRD-013/014) — o gerencial precisa comparar vários meses de uma vez.

export type TipoPeriodoGerencial = "mes" | "trimestre" | "ano" | "personalizado";

export interface PeriodoGerencial {
  tipo: TipoPeriodoGerencial;
  mesInicio: string; // "YYYY-MM"
  mesFim: string; // "YYYY-MM", inclusive
}

const MESES_POR_TIPO: Record<Exclude<TipoPeriodoGerencial, "personalizado">, number> = {
  mes: 1,
  trimestre: 3,
  ano: 12,
};

export function periodoTerminandoEm(
  tipo: TipoPeriodoGerencial,
  mesFim: string,
  mesInicioPersonalizado?: string,
): PeriodoGerencial {
  if (tipo === "personalizado") {
    if (!mesInicioPersonalizado) {
      throw new Error("Período personalizado exige mesInicio.");
    }
    return { tipo, mesInicio: mesInicioPersonalizado, mesFim };
  }
  const qtd = MESES_POR_TIPO[tipo];
  let mesInicio = mesFim;
  for (let i = 1; i < qtd; i++) mesInicio = mesAnterior(mesInicio);
  return { tipo, mesInicio, mesFim };
}

export function mesesDoPeriodo(periodo: PeriodoGerencial): string[] {
  const meses = [periodo.mesInicio];
  while (meses[meses.length - 1] !== periodo.mesFim) {
    meses.push(proximoMes(meses[meses.length - 1]));
  }
  return meses;
}

export function periodoAnterior(periodo: PeriodoGerencial): PeriodoGerencial {
  const qtdMeses = mesesDoPeriodo(periodo).length;
  const mesFim = mesAnterior(periodo.mesInicio);
  let mesInicio = mesFim;
  for (let i = 1; i < qtdMeses; i++) mesInicio = mesAnterior(mesInicio);
  return { tipo: periodo.tipo, mesInicio, mesFim };
}

function ultimoDiaDoMes(mes: string): number {
  const [ano, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(ano, m, 0)).getUTCDate();
}

// Intervalo em datas-string "YYYY-MM-DD" (para PeriodoFiltro do diesel, que
// compara strings, não instantes).
export function intervaloDias(periodo: PeriodoGerencial): PeriodoFiltro {
  const dia = String(ultimoDiaDoMes(periodo.mesFim)).padStart(2, "0");
  return { de: `${periodo.mesInicio}-01`, ate: `${periodo.mesFim}-${dia}` };
}

// Intervalo em Date UTC (para IntervaloPeriodo do dashboard, que compara
// getTime()). Usa limites UTC — simplificação aceitável na fase mockada,
// consistente com o resto do projeto tratando datas ISO por slice/comparação
// de string, não por fuso horário local.
export function intervaloDatas(periodo: PeriodoGerencial): IntervaloPeriodo {
  const [anoInicio, mesInicioNum] = periodo.mesInicio.split("-").map(Number);
  const [anoFim, mesFimNum] = periodo.mesFim.split("-").map(Number);
  return {
    inicio: new Date(Date.UTC(anoInicio, mesInicioNum - 1, 1, 0, 0, 0, 0)),
    fim: new Date(Date.UTC(anoFim, mesFimNum, 0, 23, 59, 59, 999)),
  };
}
