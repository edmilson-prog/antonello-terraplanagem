import { describe, it, expect } from "vitest";
import { faturamentos } from "@/mocks/faturamentos";
import { ordensServico } from "@/mocks/ordens-servico";
import { clientes } from "@/mocks/clientes";
import { apontamentos } from "@/mocks/apontamentos";
import { calcularValorTotal, valorItem } from "@/features/faturamento/calculo";

describe("mock de faturamentos", () => {
  it("referencia OS e clientes existentes", () => {
    const osIds = new Set(ordensServico.map((o) => o.id));
    const clienteIds = new Set(clientes.map((c) => c.id));
    for (const f of faturamentos) {
      expect(osIds.has(f.os_id)).toBe(true);
      expect(clienteIds.has(f.cliente_id)).toBe(true);
    }
  });

  it("toda OS de origem está fechada", () => {
    for (const f of faturamentos) {
      const os = ordensServico.find((o) => o.id === f.os_id);
      expect(os?.status).toBe("fechada");
    }
  });

  it("números únicos no formato FAT-AAAA-NNNN", () => {
    const numeros = faturamentos.map((f) => f.numero);
    expect(new Set(numeros).size).toBe(numeros.length);
    for (const n of numeros) expect(n).toMatch(/^FAT-\d{4}-\d{4}$/);
  });

  it("valor_total bate com calcularValorTotal(itens, desconto)", () => {
    for (const f of faturamentos) {
      expect(f.valor_total).toBe(calcularValorTotal(f.itens, f.desconto));
    }
  });

  it("itens com preço: valor_total = quantidade × valor_unitario; sem preço: total 0", () => {
    for (const f of faturamentos) {
      for (const item of f.itens) {
        if (item.sem_preco) {
          expect(item.valor_unitario).toBeNull();
          expect(item.valor_total).toBe(0);
        } else {
          expect(item.valor_unitario).not.toBeNull();
          if (item.valor_unitario != null) {
            expect(item.valor_total).toBe(valorItem(item.quantidade, item.valor_unitario));
          }
        }
      }
    }
  });

  it("itens hora_maquina batem com a soma de horas dos apontamentos da OS", () => {
    for (const f of faturamentos) {
      for (const item of f.itens) {
        if (item.tipo !== "hora_maquina" || item.origem_id == null) continue;
        const horas = apontamentos
          .filter((a) => a.os_id === f.os_id && a.equipamento_id === item.origem_id && a.status === "finalizado")
          .reduce((s, a) => s + (a.horas_trabalhadas ?? 0), 0);
        expect(item.quantidade).toBe(horas);
      }
    }
  });

  it("cobre edge cases: rascunho, faturado, mobilização, sem preço, por_metro", () => {
    expect(faturamentos.some((f) => f.status === "rascunho")).toBe(true);
    expect(faturamentos.some((f) => f.status === "faturado")).toBe(true);
    expect(faturamentos.some((f) => f.itens.some((i) => i.tipo === "mobilizacao"))).toBe(true);
    expect(faturamentos.some((f) => f.itens.some((i) => i.sem_preco))).toBe(true);
    expect(faturamentos.some((f) => f.modelo_cobranca === "por_metro")).toBe(true);
  });
});
