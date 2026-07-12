import { describe, it, expect } from "vitest";
import {
  faturamentoDaOS,
  osFechadasSemFaturamento,
  resumoPipeline,
  agregadoMensal,
  contaDoFaturamento,
} from "@/features/faturamento/derivacoes";
import type { Faturamento, OrdemServico } from "@/shared/types";

function os(id: string, status: OrdemServico["status"]): OrdemServico {
  return {
    id,
    numero: `OS-2026-${id}`,
    cliente_id: "cl-001",
    obra_nome: "x",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status,
    responsavel_id: null,
    observacao: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-01T00:00:00.000Z",
    fechada_em: status === "fechada" ? "2026-06-02T00:00:00.000Z" : null,
    pendente_sync: false,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

function fat(id: string, os_id: string, status: Faturamento["status"], valor: number): Faturamento {
  return {
    id,
    numero: `FAT-2026-${id}`,
    os_id,
    cliente_id: "cl-001",
    modelo_cobranca: "hora_maquina",
    itens: [],
    desconto: 0,
    valor_total: valor,
    observacao: null,
    status,
    gerado_em: "2026-06-02T00:00:00.000Z",
    faturado_em: status === "faturado" ? "2026-06-03T00:00:00.000Z" : null,
    created_at: "2026-06-02T00:00:00.000Z",
    updated_at: "2026-06-02T00:00:00.000Z",
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

describe("agregadoMensal", () => {
  const base = (over: Partial<Faturamento>): Faturamento => ({
    id: over.id ?? "f1",
    numero: over.numero ?? "FAT-2026-0001",
    os_id: "os1",
    cliente_id: "cli1",
    modelo_cobranca: "hora_maquina",
    itens: [],
    desconto: 0,
    valor_total: over.valor_total ?? 1000,
    observacao: null,
    status: over.status ?? "faturado",
    gerado_em: "2026-05-01T10:00:00.000Z",
    faturado_em: over.faturado_em ?? null,
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-01T10:00:00.000Z",
  });

  it("agrupa por mês de faturado_em, últimos 6 meses até a referência, ignorando rascunhos", () => {
    const faturamentos = [
      base({
        id: "f1",
        valor_total: 1000,
        status: "faturado",
        faturado_em: "2026-07-05T00:00:00.000Z",
      }),
      base({
        id: "f2",
        valor_total: 500,
        status: "faturado",
        faturado_em: "2026-07-20T00:00:00.000Z",
      }),
      base({
        id: "f3",
        valor_total: 2000,
        status: "faturado",
        faturado_em: "2026-06-10T00:00:00.000Z",
      }),
      base({ id: "f4", valor_total: 9999, status: "rascunho", faturado_em: null }),
    ];
    const r = agregadoMensal(faturamentos, "2026-07-15T12:00:00.000Z", 6);
    expect(r).toHaveLength(6);
    expect(r[r.length - 1]).toEqual({ mes: "2026-07", rotulo: "Jul", valor: 1500, qtd: 2 });
    expect(r[r.length - 2]).toEqual({ mes: "2026-06", rotulo: "Jun", valor: 2000, qtd: 1 });
    expect(r[0]).toEqual({ mes: "2026-02", rotulo: "Fev", valor: 0, qtd: 0 });
  });

  it("retorna array vazio de meses com valor 0 quando não há faturamentos", () => {
    const r = agregadoMensal([], "2026-01-15T00:00:00.000Z", 3);
    expect(r).toEqual([
      { mes: "2025-11", rotulo: "Nov", valor: 0, qtd: 0 },
      { mes: "2025-12", rotulo: "Dez", valor: 0, qtd: 0 },
      { mes: "2026-01", rotulo: "Jan", valor: 0, qtd: 0 },
    ]);
  });
});

describe("contaDoFaturamento", () => {
  it("encontra a conta a receber vinculada pelo faturamento_id", () => {
    const contas = [
      {
        id: "c1",
        faturamento_id: "f1",
        cliente_id: "cli1",
        valor: 100,
        vencimento: "2026-08-01",
        status: "aberta" as const,
        recebido_em: null,
        forma_recebimento: null,
        created_at: "",
        updated_at: "",
      },
    ];
    expect(contaDoFaturamento("f1", contas)?.id).toBe("c1");
    expect(contaDoFaturamento("f2", contas)).toBeNull();
  });
});
