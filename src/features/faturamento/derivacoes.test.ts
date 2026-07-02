import { describe, it, expect } from "vitest";
import { faturamentoDaOS, osFechadasSemFaturamento, resumoPipeline } from "@/features/faturamento/derivacoes";
import type { Faturamento, OrdemServico } from "@/shared/types";

function os(id: string, status: OrdemServico["status"]): OrdemServico {
  return {
    id, numero: `OS-2026-${id}`, cliente_id: "cl-001", obra_nome: "x", endereco: null,
    modelo_cobranca: "hora_maquina", status, responsavel_id: null, observacao: null,
    diametro_broca_mm: null, aberta_em: "2026-06-01T00:00:00.000Z",
    fechada_em: status === "fechada" ? "2026-06-02T00:00:00.000Z" : null, pendente_sync: false,
    created_at: "2026-06-01T00:00:00.000Z", updated_at: "2026-06-01T00:00:00.000Z",
  };
}

function fat(id: string, os_id: string, status: Faturamento["status"], valor: number): Faturamento {
  return {
    id, numero: `FAT-2026-${id}`, os_id, cliente_id: "cl-001", modelo_cobranca: "hora_maquina",
    itens: [], desconto: 0, valor_total: valor, observacao: null, status,
    gerado_em: "2026-06-02T00:00:00.000Z", faturado_em: status === "faturado" ? "2026-06-03T00:00:00.000Z" : null,
    created_at: "2026-06-02T00:00:00.000Z", updated_at: "2026-06-02T00:00:00.000Z",
  };
}

const ordens = [os("a", "fechada"), os("b", "fechada"), os("c", "fechada"), os("d", "aberta")];
const fats = [fat("1", "a", "faturado", 5220), fat("2", "b", "rascunho", 0)];

describe("derivacoes de faturamento", () => {
  it("faturamentoDaOS encontra ou retorna null", () => {
    expect(faturamentoDaOS("a", fats)?.id).toBe("1");
    expect(faturamentoDaOS("c", fats)).toBeNull();
  });

  it("osFechadasSemFaturamento traz só fechadas sem fatura nenhuma", () => {
    const r = osFechadasSemFaturamento(ordens, fats);
    expect(r.map((o) => o.id)).toEqual(["c"]); // a=faturado, b=rascunho, d=aberta
  });

  it("resumoPipeline: executado = fechadas não confirmadas; faturado = qtd+total", () => {
    const r = resumoPipeline(ordens, fats);
    expect(r.executado).toBe(2); // b (rascunho) + c (sem fatura); a é faturado
    expect(r.faturado).toEqual({ qtd: 1, total: 5220 });
    expect(r.recebido).toStrictEqual({ qtd: 0, total: 0 });
  });
});
