import { describe, it, expect } from "vitest";
import { apontamentos } from "./apontamentos";
import { calcularHoras } from "@/features/apontamento/calcular-horas";

describe("mock de apontamentos", () => {
  it("inclui ao menos um em andamento e um finalizado", () => {
    expect(apontamentos.some((a) => a.status === "em_andamento")).toBe(true);
    expect(apontamentos.some((a) => a.status === "finalizado")).toBe(true);
  });

  it("cobre edge cases: sem os_id, pendente_sync e de outro operador", () => {
    expect(apontamentos.some((a) => a.os_id === null)).toBe(true);
    expect(apontamentos.some((a) => a.pendente_sync)).toBe(true);
    expect(apontamentos.some((a) => a.operador_id !== "op-001")).toBe(true);
  });

  it("horas_trabalhadas dos finalizados batem com calcularHoras", () => {
    for (const a of apontamentos) {
      if (a.status === "finalizado" && a.horimetro_final != null) {
        expect(a.horas_trabalhadas).toBe(
          calcularHoras(a.horimetro_inicial, a.horimetro_final),
        );
      }
    }
  });

  it("os em andamento não têm horímetro final nem horas", () => {
    for (const a of apontamentos) {
      if (a.status === "em_andamento") {
        expect(a.horimetro_final).toBeNull();
        expect(a.horas_trabalhadas).toBeNull();
      }
    }
  });
});
