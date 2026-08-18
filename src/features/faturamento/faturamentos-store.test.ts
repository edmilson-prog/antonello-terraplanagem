import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";

/*
 * Faturamentos saiu do mock em memória para o Supabase na Onda 21, e os itens
 * passaram a morar na tabela filha `faturamento_itens`.
 *
 * A montagem dos itens em si (horas × preço, metros × preço, mobilização) já é
 * coberta por `calculo.test.ts`, que é puro e não depende de store. O que sobra
 * aqui é o que a store passou a ser responsável: recompor pai + filhos na
 * leitura, o guard de credencial e a regra de confirmação.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(faturamentosStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("faturamentosStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");
    await faturamentosStore.retry();
    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra", async () => {
    const espiao = vi.spyOn(supabase, "from");
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("faturamentos");
    });
  });
});

describe("faturamentosStore — itens vindos da tabela filha", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(faturamentosStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recompõe cada faturamento com os seus itens", () => {
    const comItens = faturamentosStore.listar().filter((f) => f.itens.length > 0);
    expect(comItens.length).toBeGreaterThan(0);

    // Nenhum item pode vazar para o faturamento errado: cada um só aparece na
    // linha a que pertence.
    for (const f of faturamentosStore.listar()) {
      for (const item of f.itens) {
        expect(item).not.toHaveProperty("faturamento_id");
      }
    }
  });

  it("o total bate com a soma dos itens menos o desconto", () => {
    for (const f of faturamentosStore.listar()) {
      const soma = f.itens.reduce((s, i) => s + i.valor_total, 0);
      expect(f.valor_total).toBeCloseTo(soma - f.desconto, 2);
    }
  });
});

describe("faturamentosStore — confirmação", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(faturamentosStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa confirmar faturamento inexistente", async () => {
    const r = await faturamentosStore.confirmar("nao-existe");
    expect(r).toEqual({ ok: false, motivo: "Faturamento não encontrado." });
  });

  it("recusa confirmar duas vezes", async () => {
    const faturado = faturamentosStore.listar().find((f) => f.status === "faturado");
    expect(faturado, "esperava um faturamento já confirmado no dublê").toBeDefined();

    const r = await faturamentosStore.confirmar(faturado!.id);
    expect(r).toEqual({ ok: false, motivo: "Este faturamento já foi confirmado." });
  });

  it("confirma um rascunho e carimba a data", async () => {
    const rascunho = faturamentosStore.listar().find((f) => f.status === "rascunho");
    expect(rascunho, "esperava um rascunho no dublê").toBeDefined();

    const r = await faturamentosStore.confirmar(rascunho!.id);

    expect(r.ok).toBe(true);
    const atual = faturamentosStore.obter(rascunho!.id);
    expect(atual?.status).toBe("faturado");
    expect(atual?.faturado_em).not.toBeNull();
  });
});
