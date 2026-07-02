import { describe, it, expect } from "vitest";
import { comprovantes } from "./comprovantes";

describe("mocks/comprovantes", () => {
  it("tem 5 registros", () => {
    expect(comprovantes).toHaveLength(5);
  });

  it("cobre os três status", () => {
    const status = new Set(comprovantes.map((c) => c.status));
    expect(status).toEqual(new Set(["pendente", "assinado", "recusado"]));
  });

  it("cmp-002 é de uma OS por metro e está assinado", () => {
    const c = comprovantes.find((x) => x.id === "cmp-002");
    expect(c?.os_id).toBe("os-009");
    expect(c?.status).toBe("assinado");
    expect(c?.resumo_servico).toContain("Metragem executada");
  });

  it("cmp-003 está recusado com motivo", () => {
    const c = comprovantes.find((x) => x.id === "cmp-003");
    expect(c?.status).toBe("recusado");
    expect(c?.motivo_recusa).not.toBeNull();
  });

  it("comprovantes assinados têm assinante, assinatura e data registrados", () => {
    const assinados = comprovantes.filter((c) => c.status === "assinado");
    expect(assinados.length).toBeGreaterThan(0);
    for (const c of assinados) {
      expect(c.assinante_nome).not.toBeNull();
      expect(c.assinatura_url).not.toBeNull();
      expect(c.assinado_em).not.toBeNull();
    }
  });

  it("nenhum resumo_servico contém cifrão (sem valores)", () => {
    for (const c of comprovantes) {
      expect(c.resumo_servico).not.toContain("R$");
    }
  });

  it("cada os_id aparece em no máximo um comprovante", () => {
    const osIds = comprovantes.map((c) => c.os_id);
    expect(new Set(osIds).size).toBe(osIds.length);
  });
});
