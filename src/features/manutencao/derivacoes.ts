import { parametroNumero } from "@/features/parametros/uso";
import type {
  Equipamento,
  PlanoManutencao,
  RegistroManutencaoOperador,
  StatusManutencao,
} from "@/shared/types";

// Tudo aqui recebe RegistroManutencaoOperador (o recorte sem custo/fornecedor/
// observação), e não RegistroManutencao. Não é frescura de tipo: esta cadeia é
// chamada de dentro do app de campo, onde a RPC nem devolve os campos
// financeiros. Declarar o recorte faz o compilador provar que nenhuma derivação
// de manutenção depende de dado que /app/* não pode ver.

export const ANTECEDENCIA_HORAS_PADRAO = 20;

/**
 * Antecedência configurada em Parâmetros, com a constante como piso. A leitura
 * é aqui, e não propagada por props, porque a cadeia
 * statusEquipamento → statusPlano → calcularStatusManutencao é chamada de cinco
 * telas, uma delas no app do operador — que por RLS não enxerga `parametros` e
 * portanto segue no valor histórico de 20h.
 */
export function antecedenciaConfigurada(): number {
  return parametroNumero("alerta_manutencao_horas", ANTECEDENCIA_HORAS_PADRAO);
}

// Status é sempre DERIVADO do horímetro atual vs. a marca prevista — nunca
// armazenado (RF-004). Antecedência inclusiva: faltam <= antecedência → próxima.
export function calcularStatusManutencao(
  horimetroAtual: number,
  horimetroPrevisto: number,
  antecedenciaHoras: number = antecedenciaConfigurada(),
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
      p.ativo && (p.equipamento_id === equipamento.id || p.tipo_equipamento === equipamento.tipo),
  );
}

// Registro de ciclo de plano ainda aberto. O check do banco garante que todo
// registro com plano tem marca de horímetro; o predicado é o que traz essa
// garantia para o TypeScript, já que a coluna é anulável por causa da corretiva.
export type RegistroPrevisto = RegistroManutencaoOperador & { horimetro_previsto: number };

export function registroPrevisto(
  registros: RegistroManutencaoOperador[],
  planoId: string,
  equipamentoId: string,
): RegistroPrevisto | undefined {
  return registros.find(
    (r): r is RegistroPrevisto =>
      r.plano_id === planoId &&
      r.equipamento_id === equipamentoId &&
      r.status === "prevista" &&
      r.horimetro_previsto !== null,
  );
}

export interface StatusPlanoResultado {
  status: StatusManutencao;
  registro: RegistroPrevisto;
}

export function statusPlano(
  plano: PlanoManutencao,
  equipamento: Equipamento,
  registros: RegistroManutencaoOperador[],
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
  registros: RegistroManutencaoOperador[],
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
  registro: RegistroPrevisto;
  status: "proxima" | "vencida";
}

// Uma linha por (equipamento, plano) vencido/próximo — não agregada por
// equipamento, pois "registrar manutenção" age sobre um plano específico.
export function alertasManutencao(
  equipamentos: Equipamento[],
  planos: PlanoManutencao[],
  registros: RegistroManutencaoOperador[],
): AlertaManutencao[] {
  const alertas: AlertaManutencao[] = [];
  for (const equipamento of equipamentos.filter((e) => e.ativo)) {
    for (const plano of planosParaEquipamento(equipamento, planos)) {
      const resultado = statusPlano(plano, equipamento, registros);
      if (resultado && (resultado.status === "proxima" || resultado.status === "vencida")) {
        alertas.push({
          equipamento,
          plano,
          registro: resultado.registro,
          status: resultado.status,
        });
      }
    }
  }
  return alertas.sort((a, b) => PESO_STATUS[b.status] - PESO_STATUS[a.status]);
}

export interface ResumoProximaManutencao {
  descricao: string;
  intervalo: number;
  previsto: number;
  restantes: number;
  status: StatusManutencao;
}

// Extrai o plano mais urgente (menor "horas restantes") entre os aplicáveis ao
// equipamento — mesma seleção usada pelo card de detalhe (ProximaManutencaoCard)
// e pela coluna "Próx. manutenção" da lista de equipamentos, para as duas telas
// nunca divergirem para o mesmo equipamento.
export function resumoProximaManutencao(
  equipamento: Equipamento,
  planos: PlanoManutencao[],
  registros: RegistroManutencaoOperador[],
): ResumoProximaManutencao | null {
  const candidatos = planosParaEquipamento(equipamento, planos).reduce<
    { plano: PlanoManutencao; resultado: StatusPlanoResultado }[]
  >((acc, plano) => {
    const resultado = statusPlano(plano, equipamento, registros);
    if (resultado) acc.push({ plano, resultado });
    return acc;
  }, []);

  const maisUrgente = candidatos.reduce<{
    plano: PlanoManutencao;
    resultado: StatusPlanoResultado;
  } | null>((urgente, atual) => {
    if (!urgente) return atual;
    const restantesAtual =
      atual.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    const restantesUrgente =
      urgente.resultado.registro.horimetro_previsto - equipamento.horimetro_atual;
    return restantesAtual < restantesUrgente ? atual : urgente;
  }, null);

  if (!maisUrgente) return null;

  const { plano, resultado } = maisUrgente;
  return {
    descricao: plano.descricao,
    intervalo: plano.intervalo_horas,
    previsto: resultado.registro.horimetro_previsto,
    restantes: resultado.registro.horimetro_previsto - equipamento.horimetro_atual,
    status: resultado.status,
  };
}
