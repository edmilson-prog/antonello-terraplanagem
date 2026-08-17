import { mesAnterior } from "@/shared/lib/periodo-mensal";
import type { Equipamento, RegistroManutencao, StatusRegistroManutencao } from "@/shared/types";

// Agregados da tela de Manutenção. Tudo derivado dos registros — nada é
// persistido, na mesma regra do custo/hora e do saldo do tanque: corrigir uma
// ordem lançada errada corrige o histórico inteiro sozinho.

// A data que posiciona uma ordem no tempo: quando foi concluída, ou quando foi
// aberta se ainda não terminou. É a coluna "Data" da tabela e o que decide de
// que mês a ordem é.
export function dataReferencia(registro: Pick<RegistroManutencao, "realizada_em" | "aberta_em">) {
  return registro.realizada_em ?? registro.aberta_em;
}

function noMes(iso: string, periodo: string): boolean {
  return iso.slice(0, 7) === periodo;
}

export interface OrdemManutencao {
  registro: RegistroManutencao;
  equipamento: Equipamento | undefined;
  data: string; // ISO
  situacao: StatusRegistroManutencao;
}

// Ordens de manutenção do período, da mais recente para a mais antiga.
export function ordensDoMes(
  registros: RegistroManutencao[],
  equipamentos: Equipamento[],
  periodo: string,
): OrdemManutencao[] {
  return registros
    .filter((r) => noMes(dataReferencia(r), periodo))
    .map((registro) => ({
      registro,
      equipamento: equipamentos.find((e) => e.id === registro.equipamento_id),
      data: dataReferencia(registro),
      situacao: registro.status,
    }))
    .sort((a, b) => b.data.localeCompare(a.data));
}

export interface ResumoManutencaoMes {
  total: number;
  preventivas: number;
  corretivas: number;
  /** Custo das ordens CONCLUÍDAS no mês — é o que entra no Custo da Hora. */
  custo: number;
  custoMesAnterior: number;
  /** Variação % do custo vs. o mês anterior; null quando não há base. */
  variacaoCusto: number | null;
}

export function resumoManutencaoMes(
  registros: RegistroManutencao[],
  periodo: string,
): ResumoManutencaoMes {
  const doMes = registros.filter((r) => noMes(dataReferencia(r), periodo));
  const anterior = mesAnterior(periodo);

  // Só ordem concluída tem custo consolidado. A em andamento carrega estimativa,
  // e somá-la aqui faria o KPI divergir do que o Custo da Hora calcula.
  const custoDe = (mes: string) =>
    registros
      .filter(
        (r) => r.status === "realizada" && r.realizada_em != null && noMes(r.realizada_em, mes),
      )
      .reduce((soma, r) => soma + (r.custo ?? 0), 0);

  const custo = custoDe(periodo);
  const custoMesAnterior = custoDe(anterior);

  return {
    total: doMes.length,
    preventivas: doMes.filter((r) => r.tipo === "preventiva").length,
    corretivas: doMes.filter((r) => r.tipo === "corretiva").length,
    custo: Math.round(custo * 100) / 100,
    custoMesAnterior: Math.round(custoMesAnterior * 100) / 100,
    variacaoCusto:
      custoMesAnterior > 0 ? ((custo - custoMesAnterior) / custoMesAnterior) * 100 : null,
  };
}

// Equipamentos parados na oficina agora. Não é recortado por mês de propósito:
// uma máquina aberta em junho e ainda parada em agosto continua parada.
export function equipamentosEmManutencao(
  registros: RegistroManutencao[],
  equipamentos: Equipamento[],
): Equipamento[] {
  const ids = new Set(
    registros.filter((r) => r.status === "em_andamento").map((r) => r.equipamento_id),
  );
  return equipamentos.filter((e) => ids.has(e.id));
}

// Série de contagem de ordens por mês, do mais antigo ao mais recente —
// alimenta o sparkline do KPI. Devolve `meses` pontos terminando em `periodo`.
export function serieOrdensPorMes(
  registros: RegistroManutencao[],
  periodo: string,
  meses = 6,
): number[] {
  const serie: number[] = [];
  let mes = periodo;
  for (let i = 0; i < meses; i++) {
    serie.unshift(registros.filter((r) => noMes(dataReferencia(r), mes)).length);
    mes = mesAnterior(mes);
  }
  return serie;
}
