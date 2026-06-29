import { describe, it, expect } from "vitest";
import { ordensServico } from "@/mocks/ordens-servico";
import { clientes } from "@/mocks/clientes";
import { operadores } from "@/mocks/operadores";
import { apontamentos } from "@/mocks/apontamentos";

describe("mock de ordens de serviço", () => {
  it("referencia clientes e responsáveis existentes", () => {
    const clienteIds = new Set(clientes.map((c) => c.id));
    const operadorIds = new Set(operadores.map((o) => o.id));
    for (const os of ordensServico) {
      expect(clienteIds.has(os.cliente_id)).toBe(true);
      if (os.responsavel_id) expect(operadorIds.has(os.responsavel_id)).toBe(true);
    }
  });

  it("tem números únicos no formato OS-AAAA-NNNN", () => {
    const numeros = ordensServico.map((o) => o.numero);
    expect(new Set(numeros).size).toBe(numeros.length);
    for (const n of numeros) expect(n).toMatch(/^OS-\d{4}-\d{4}$/);
  });

  it("inclui edge cases: ≥1 fechada, ≥1 por_metro, ≥1 pendente_sync", () => {
    expect(ordensServico.some((o) => o.status === "fechada")).toBe(true);
    expect(ordensServico.some((o) => o.modelo_cobranca === "por_metro")).toBe(true);
    expect(ordensServico.some((o) => o.pendente_sync)).toBe(true);
  });

  it("inclui uma OS colaborativa (apontamentos de 2+ operadores)", () => {
    const colaborativa = ordensServico.some((os) => {
      const ops = new Set(
        apontamentos.filter((a) => a.os_id === os.id).map((a) => a.operador_id),
      );
      return ops.size >= 2;
    });
    expect(colaborativa).toBe(true);
  });

  it("por_metro tem diâmetro definido", () => {
    for (const os of ordensServico) {
      if (os.modelo_cobranca === "por_metro") {
        expect(os.diametro_broca_mm).not.toBeNull();
      }
    }
  });
});
