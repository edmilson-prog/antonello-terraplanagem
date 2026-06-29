import { describe, expect, it } from "vitest";
import { orcamentos } from "@/mocks/orcamentos";
import { calcularTotalOrcamento } from "@/features/orcamentos/calculo";
import { validadeVencida } from "@/features/orcamentos/derivacoes";

const AGORA = "2026-06-29T12:00:00.000Z";

describe("mock de orçamentos", () => {
  it("tem 6 orçamentos com ids únicos", () => {
    expect(orcamentos).toHaveLength(6);
    expect(new Set(orcamentos.map((o) => o.id)).size).toBe(6);
  });

  it("cada valor_total bate com a soma dos itens menos o desconto", () => {
    for (const o of orcamentos) {
      expect(o.valor_total).toBe(calcularTotalOrcamento(o.itens, o.desconto));
    }
  });

  it("cobre os edge cases: rascunho vazio, sem-preço, validade vencida, vinculado a OS", () => {
    const vazio = orcamentos.find((o) => o.id === "orc-001");
    expect(vazio?.status).toBe("rascunho");
    expect(vazio?.itens).toHaveLength(0);
    expect(vazio?.valor_total).toBe(0);

    const semPreco = orcamentos.find((o) => o.id === "orc-004");
    expect(semPreco?.itens.some((i) => i.sem_preco)).toBe(true);

    const vencido = orcamentos.find((o) => o.id === "orc-005");
    expect(validadeVencida(vencido!, AGORA)).toBe(true);

    const aprovado = orcamentos.find((o) => o.id === "orc-003");
    expect(aprovado?.status).toBe("aprovado");
    expect(aprovado?.os_id).not.toBeNull();
  });

  it("apresenta os quatro status", () => {
    expect(new Set(orcamentos.map((o) => o.status))).toEqual(
      new Set(["rascunho", "enviado", "aprovado", "recusado"]),
    );
  });
});
