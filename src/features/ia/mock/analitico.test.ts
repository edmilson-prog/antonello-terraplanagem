import { describe, expect, it } from "vitest";
import { detectarAnomalias } from "@/features/ia/mock/analitico";
import type { Apontamento } from "@/shared/types";

function apontamento(overrides: Partial<Apontamento>): Apontamento {
  return {
    id: "ap-1",
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: null,
    horimetro_inicial: 100,
    horimetro_final: 108,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-10T08:00:00.000Z",
    finalizado_em: "2026-06-10T16:00:00.000Z",
    created_at: "2026-06-10T08:00:00.000Z",
    updated_at: "2026-06-10T16:00:00.000Z",
    ...overrides,
  };
}

describe("detectarAnomalias", () => {
  it("flags a single apontamento with more than 16 worked hours as an atypical jump", () => {
    const lista = [apontamento({ id: "ap-1", horas_trabalhadas: 18 })];
    const anomalias = detectarAnomalias(lista);
    expect(anomalias).toEqual([
      { apontamento_id: "ap-1", motivo: "Salto de horímetro atípico (18h em um único apontamento)", severidade: "alerta" },
    ]);
  });

  it("flags same-day same-equipment apontamentos totalling more than 14h", () => {
    const lista = [
      apontamento({ id: "ap-1", horas_trabalhadas: 8, iniciado_em: "2026-06-10T06:00:00.000Z" }),
      apontamento({ id: "ap-2", horas_trabalhadas: 8, iniciado_em: "2026-06-10T14:00:00.000Z" }),
    ];
    const anomalias = detectarAnomalias(lista);
    expect(anomalias.map((a) => a.apontamento_id)).toEqual(["ap-1", "ap-2"]);
    expect(anomalias[0].motivo).toContain("Horas do equipamento acima do padrão do dia");
  });

  it("flags apontamentos with the same equipamento, operador, horimetro_inicial and day as a possible duplicate", () => {
    const lista = [
      apontamento({ id: "ap-1", horas_trabalhadas: 4, horimetro_inicial: 200 }),
      apontamento({ id: "ap-2", horas_trabalhadas: 4, horimetro_inicial: 200 }),
    ];
    const anomalias = detectarAnomalias(lista);
    expect(anomalias.some((a) => a.motivo === "Possível apontamento duplicado")).toBe(true);
  });

  it("returns nothing for a normal, isolated apontamento", () => {
    expect(detectarAnomalias([apontamento({})])).toEqual([]);
  });
});
