import type { Apontamento } from "@/shared/types";

/*
 * Agregações puras de horas apontadas — alimentam a aba "Hoje", o histórico e
 * o espelho de horas do App de Campo. Só olham apontamentos FINALIZADOS: um
 * apontamento em andamento ainda não tem horas fechadas.
 */

function chaveDiaLocal(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// O dia do operador é o dia DELE, não o UTC: um apontamento fechado às 22h no
// Brasil chega como ISO do dia seguinte em Z. Sempre converter para local.
function chaveDia(iso: string): string {
  return chaveDiaLocal(new Date(iso));
}

export function finalizadosDoOperador(lista: Apontamento[], operadorId: string): Apontamento[] {
  return lista.filter(
    (a) => a.operador_id === operadorId && a.status === "finalizado" && a.finalizado_em !== null,
  );
}

export function somarHoras(lista: Apontamento[]): number {
  const total = lista.reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
  return Math.round(total * 10) / 10;
}

export function finalizadosNoDia(
  lista: Apontamento[],
  operadorId: string,
  dia: Date,
): Apontamento[] {
  const alvo = chaveDiaLocal(dia);
  return finalizadosDoOperador(lista, operadorId).filter(
    (a) => chaveDia(a.finalizado_em as string) === alvo,
  );
}

export function finalizadosNoMes(
  lista: Apontamento[],
  operadorId: string,
  mes: Date,
): Apontamento[] {
  const prefixo = chaveDiaLocal(mes).slice(0, 7);
  return finalizadosDoOperador(lista, operadorId).filter((a) =>
    chaveDia(a.finalizado_em as string).startsWith(prefixo),
  );
}

export interface GrupoDia {
  dia: string; // "YYYY-MM-DD"
  apontamentos: Apontamento[];
}

// Do mais recente para o mais antigo — ordem do histórico do kit.
export function agruparPorDia(lista: Apontamento[]): GrupoDia[] {
  const mapa = new Map<string, Apontamento[]>();
  for (const a of lista) {
    const dia = chaveDia(a.finalizado_em ?? a.iniciado_em);
    const grupo = mapa.get(dia);
    if (grupo) grupo.push(a);
    else mapa.set(dia, [a]);
  }
  return [...mapa.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dia, apontamentos]) => ({
      dia,
      apontamentos: apontamentos.sort((x, y) =>
        (y.finalizado_em ?? y.iniciado_em).localeCompare(x.finalizado_em ?? x.iniciado_em),
      ),
    }));
}

export interface HorasPorOS {
  osId: string | null;
  horas: number;
}

// Ordenado do maior para o menor — a barra do espelho de horas usa o topo
// como referência de 100%.
export function horasPorOS(lista: Apontamento[]): HorasPorOS[] {
  const mapa = new Map<string | null, number>();
  for (const a of lista) {
    mapa.set(a.os_id, (mapa.get(a.os_id) ?? 0) + (a.horas_trabalhadas ?? 0));
  }
  return [...mapa.entries()]
    .map(([osId, horas]) => ({ osId, horas: Math.round(horas * 10) / 10 }))
    .sort((a, b) => b.horas - a.horas);
}

export interface HorasPorSemana {
  inicio: string; // "YYYY-MM-DD" (segunda-feira)
  horas: number;
}

function segundaDaSemana(iso: string): string {
  // Meio-dia local evita que o ajuste de fuso/horário de verão jogue a data
  // para o dia anterior.
  const d = new Date(`${chaveDia(iso)}T12:00:00`);
  const diaSemana = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - diaSemana);
  return chaveDiaLocal(d);
}

export function horasPorSemana(lista: Apontamento[]): HorasPorSemana[] {
  const mapa = new Map<string, number>();
  for (const a of lista) {
    const inicio = segundaDaSemana(a.finalizado_em ?? a.iniciado_em);
    mapa.set(inicio, (mapa.get(inicio) ?? 0) + (a.horas_trabalhadas ?? 0));
  }
  return [...mapa.entries()]
    .map(([inicio, horas]) => ({ inicio, horas: Math.round(horas * 10) / 10 }))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function diasComApontamento(lista: Apontamento[]): number {
  return new Set(lista.map((a) => chaveDia(a.finalizado_em ?? a.iniciado_em))).size;
}
