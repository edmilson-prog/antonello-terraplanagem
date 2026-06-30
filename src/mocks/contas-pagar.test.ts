import { describe, it, expect } from "vitest";
import { contasPagar } from "./contas-pagar";
import { round2 } from "@/features/faturamento/calculo";

describe("mocks/contas-pagar", () => {
  it("tem 5 registros", () => {
    expect(contasPagar).toHaveLength(5);
  });

  it("cp-004 está liquidada com data de pagamento", () => {
    const c = contasPagar.find((x) => x.id === "cp-004");
    expect(c?.status).toBe("liquidada");
    expect(c?.pago_em).toBe("2026-06-27");
  });

  it("cp-002 está vencida e aberta (vencimento 2026-06-15)", () => {
    const c = contasPagar.find((x) => x.id === "cp-002");
    expect(c?.status).toBe("aberta");
    expect(c?.vencimento).toBe("2026-06-15");
  });

  it("cp-003 e cp-005 não têm fornecedor", () => {
    const semFornecedor = contasPagar.filter((c) => c.fornecedor === null);
    expect(semFornecedor).toHaveLength(2);
  });

  it("total abertas bate com soma manual (13780)", () => {
    const abertas = contasPagar.filter((c) => c.status === "aberta");
    const total = round2(abertas.reduce((s, c) => s + c.valor, 0));
    expect(total).toBe(13780); // 1800 + 3200 + 8500 + 280
  });
});
