import type { Apontamento, OrdemServico, StatusOS } from "@/shared/types";

export function apontamentosDaOS(osId: string, apontamentos: Apontamento[]): Apontamento[] {
  return apontamentos.filter((a) => a.os_id === osId);
}

// Total de horas da OS = soma de horas_trabalhadas dos apontamentos finalizados.
export function totalHorasOS(osId: string, apontamentos: Apontamento[]): number {
  return apontamentos
    .filter((a) => a.os_id === osId && a.status === "finalizado")
    .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);
}

// Total de metros da OS (modelo por_metro) = soma de metros_executados dos
// apontamentos finalizados vinculados. Espelha totalHorasOS: não vive no
// cabeçalho da OS (evita o conflito multi-operador de um campo de header
// mutável — ver PATCH v2 do PRD-003).
export function totalMetragemOS(osId: string, apontamentos: Apontamento[]): number {
  return apontamentos
    .filter((a) => a.os_id === osId && a.status === "finalizado")
    .reduce((soma, a) => soma + (a.metros_executados ?? 0), 0);
}

// Status para exibição: fechada > em_andamento (se há apontamento) > status armazenado.
export function statusEfetivoOS(os: OrdemServico, apontamentos: Apontamento[]): StatusOS {
  if (os.status === "fechada") return "fechada";
  const temApontamento = apontamentos.some((a) => a.os_id === os.id);
  if (temApontamento) return "em_andamento";
  return os.status;
}

export type ResultadoFechar = { pode: true } | { pode: false; motivo: string };

export function podeFecharOS(os: OrdemServico, apontamentos: Apontamento[]): ResultadoFechar {
  if (os.status === "fechada") {
    return { pode: false, motivo: "Esta OS já está fechada." };
  }
  const temEmAndamento = apontamentos.some((a) => a.os_id === os.id && a.status === "em_andamento");
  if (temEmAndamento) {
    return {
      pode: false,
      motivo: "Há apontamento em andamento (horímetro final pendente) nesta OS.",
    };
  }
  return { pode: true };
}

// "Minhas OS": responsável OU tem apontamento do operador.
export function ordensDoOperador(
  ordens: OrdemServico[],
  apontamentos: Apontamento[],
  operadorId: string,
): OrdemServico[] {
  return ordens.filter(
    (os) =>
      os.responsavel_id === operadorId ||
      apontamentos.some((a) => a.os_id === os.id && a.operador_id === operadorId),
  );
}
