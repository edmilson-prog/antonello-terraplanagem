import { describe, it, expect } from "vitest";
import { cobrancasGateway } from "./cobrancas-gateway";
import { contasReceber } from "./contas-receber";

describe("mock cobrancasGateway", () => {
  it("tem 2 registros", () => {
    expect(cobrancasGateway).toHaveLength(2);
  });

  it("cob-001 referencia cr-001 (Mercado Pago, pendente, boleto+PIX)", () => {
    const c = cobrancasGateway.find((x) => x.id === "cob-001");
    expect(c?.conta_receber_id).toBe("cr-001");
    expect(c?.provedor).toBe("mercado_pago");
    expect(c?.status).toBe("pendente");
    expect(c?.linha_digitavel).not.toBeNull();
  });

  it("cob-002 referencia cr-005 (Asaas, pendente, só PIX)", () => {
    const c = cobrancasGateway.find((x) => x.id === "cob-002");
    expect(c?.conta_receber_id).toBe("cr-005");
    expect(c?.provedor).toBe("asaas");
    expect(c?.linha_digitavel).toBeNull();
  });

  it("toda cobrança referencia uma conta a receber existente", () => {
    const idsContas = new Set(contasReceber.map((c) => c.id));
    cobrancasGateway.forEach((c) => {
      expect(idsContas.has(c.conta_receber_id)).toBe(true);
    });
  });

  it("valor da cobrança espelha o valor da conta a receber correspondente", () => {
    cobrancasGateway.forEach((c) => {
      const conta = contasReceber.find((cr) => cr.id === c.conta_receber_id);
      expect(c.valor).toBe(conta?.valor);
    });
  });
});
