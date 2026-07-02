export type PeriodoDashboard = "hoje" | "semana" | "mes";

export interface IntervaloPeriodo {
  inicio: Date;
  fim: Date;
}

// Calcula o intervalo [inicio, fim] para o período selecionado, ancorado em `agora`.
// "hoje": desde 00:00 local de hoje. "semana": últimos 7 dias corridos.
// "mes": desde o dia 1 (00:00 local) do mês corrente.
export function intervaloPeriodo(periodo: PeriodoDashboard, agora: Date): IntervaloPeriodo {
  const fim = agora;

  if (periodo === "hoje") {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    return { inicio, fim };
  }

  if (periodo === "semana") {
    const inicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { inicio, fim };
  }

  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
  return { inicio, fim };
}

// true se o timestamp ISO cai dentro de [inicio, fim] (inclusive). null/undefined nunca está no intervalo.
export function estaNoIntervalo(
  iso: string | null | undefined,
  intervalo: IntervaloPeriodo,
): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= intervalo.inicio.getTime() && t <= intervalo.fim.getTime();
}
