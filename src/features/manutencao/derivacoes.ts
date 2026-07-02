import type {
  Equipamento,
  PlanoManutencao,
  RegistroManutencao,
  StatusManutencao,
} from "@/shared/types";

export const ANTECEDENCIA_HORAS_PADRAO = 20;

// Status é sempre DERIVADO do horímetro atual vs. a marca prevista — nunca
// armazenado (RF-004). Antecedência inclusiva: faltam <= antecedência → próxima.
export function calcularStatusManutencao(
  horimetroAtual: number,
  horimetroPrevisto: number,
  antecedenciaHoras: number = ANTECEDENCIA_HORAS_PADRAO,
): StatusManutencao {
  const horasRestantes = horimetroPrevisto - horimetroAtual;
  if (horasRestantes <= 0) return "vencida";
  if (horasRestantes <= antecedenciaHoras) return "proxima";
  return "em_dia";
}

export function planosParaEquipamento(
  equipamento: Equipamento,
  planos: PlanoManutencao[],
): PlanoManutencao[] {
  return planos.filter(
    (p) =>
      p.ativo &&
      (p.equipamento_id === equipamento.id || p.tipo_equipamento === equipamento.tipo),
  );
}

export function registroPrevisto(
  registros: RegistroManutencao[],
  planoId: string,
  equipamentoId: string,
): RegistroManutencao | undefined {
  return registros.find(
    (r) =>
      r.plano_id === planoId && r.equipamento_id === equipamentoId && r.status === "prevista",
  );
}

export interface StatusPlanoResultado {
  status: StatusManutencao;
  registro: RegistroManutencao;
}

export function statusPlano(
  plano: PlanoManutencao,
  equipamento: Equipamento,
  registros: RegistroManutencao[],
): StatusPlanoResultado | null {
  const registro = registroPrevisto(registros, plano.id, equipamento.id);
  if (!registro) return null;
  return {
    status: calcularStatusManutencao(equipamento.horimetro_atual, registro.horimetro_previsto),
    registro,
  };
}

const PESO_STATUS: Record<StatusManutencao, number> = { em_dia: 0, proxima: 1, vencida: 2 };

export function statusEquipamento(
  equipamento: Equipamento,
  planos: PlanoManutencao[],
  registros: RegistroManutencao[],
): StatusManutencao | null {
  const resultados = planosParaEquipamento(equipamento, planos)
    .map((p) => statusPlano(p, equipamento, registros))
    .filter((r): r is StatusPlanoResultado => r !== null);
  if (resultados.length === 0) return null;
  return resultados.reduce((pior, atual) =>
    PESO_STATUS[atual.status] > PESO_STATUS[pior.status] ? atual : pior,
  ).status;
}

export interface AlertaManutencao {
  equipamento: Equipamento;
  plano: PlanoManutencao;
  registro: RegistroManutencao;
  status: "proxima" | "vencida";
}

// Uma linha por (equipamento, plano) vencido/próximo — não agregada por
// equipamento, pois "registrar manutenção" age sobre um plano específico.
export function alertasManutencao(
  equipamentos: Equipamento[],
  planos: PlanoManutencao[],
  registros: RegistroManutencao[],
): AlertaManutencao[] {
  const alertas: AlertaManutencao[] = [];
  for (const equipamento of equipamentos.filter((e) => e.ativo)) {
    for (const plano of planosParaEquipamento(equipamento, planos)) {
      const resultado = statusPlano(plano, equipamento, registros);
      if (resultado && (resultado.status === "proxima" || resultado.status === "vencida")) {
        alertas.push({ equipamento, plano, registro: resultado.registro, status: resultado.status });
      }
    }
  }
  return alertas.sort((a, b) => PESO_STATUS[b.status] - PESO_STATUS[a.status]);
}
