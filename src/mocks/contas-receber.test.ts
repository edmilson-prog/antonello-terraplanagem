import { describe, it, expect } from "vitest";
import { contasReceber } from "./contas-receber";
import { round2 } from "@/features/faturamento/calculo";

describe("mocks/contas-receber", () => {
  it("tem 5 registros", () => {
    expect(contasReceber).toHaveLength(5);
  });

  it("cr-004 está liquidada com forma e data de recebimento", () => {
    const c = contasReceber.find((x) => x.id === "cr-004");
    expect(c?.status).toBe("liquidada");
    expect(c?.recebido_em).toBe("2026-06-25");
    expect(c?.forma_recebimento).toBe("pix");
  });

  it("cr-003 está vencida e aberta (vencimento 2026-06-10)", () => {
    const c = contasReceber.find((x) => x.id === "cr-003");
    expect(c?.status).toBe("aberta");
    expect(c?.vencimento).toBe("2026-06-10");
  });

  it("total abertas bate com soma manual (27720)", () => {
    const abertas = contasReceber.filter((c) => c.status === "aberta");
    const total = round2(abertas.reduce((s, c) => s + c.valor, 0));
    expect(total).toBe(27720); // 5220 + 2700 + 12000 + 7800
  });
});
