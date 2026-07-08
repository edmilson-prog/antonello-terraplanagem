import type { Apontamento } from "@/shared/types";
import type { AnomaliaApontamento } from "@/features/ia/types";

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
  const finalizados = apontamentos.filter((a) => a.status === "finalizado" && a.horas_trabalhadas != null);
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
