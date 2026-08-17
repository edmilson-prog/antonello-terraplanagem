import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { contasPagarStore } from "./contas-pagar-store";

/*
 * Contas a pagar saiu do mock em memória para o Supabase na Onda 17, então
 * herdou o risco que derrubou os outros stores: o bundle não tem
 * code-splitting, este módulo é importado no boot de qualquer rota — landing
 * pública, login, app de campo — e sem sessão da retaguarda a consulta volta
 * 401, que ficava preso na tela até um F5.
 *
 * Mesmo contrato de `clientes-store.test.ts`, que documenta a regressão.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(contasPagarStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("contasPagarStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");

    await contasPagarStore.retry();

    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra, sem esperar um reload", async () => {
    const espiao = vi.spyOn(supabase, "from");

    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });

    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("contas_pagar");
    });
  });

  it("esvazia a lista quando a retaguarda sai", async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(contasPagarStore.listar().length).toBeGreaterThan(0);
    });

    emitirAuthState("SIGNED_OUT", null);

    await vi.waitFor(() => {
      expect(contasPagarStore.listar()).toHaveLength(0);
    });
  });
});

describe("contasPagarStore — regras de baixa", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(contasPagarStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa baixa de conta inexistente", async () => {
    const r = await contasPagarStore.darBaixaPagar("nao-existe", "2026-07-01");
    expect(r).toEqual({ ok: false, motivo: "Conta a pagar não encontrada." });
  });

  it("recusa baixar duas vezes a mesma conta", async () => {
    const liquidada = contasPagarStore.listar().find((c) => c.status === "liquidada");
    // O dublê de Supabase semeia ao menos uma conta já paga; sem ela, a regra
    // não teria como ser exercitada.
    expect(liquidada, "esperava uma conta liquidada no dublê").toBeDefined();

    const r = await contasPagarStore.darBaixaPagar(liquidada!.id, "2026-07-01");
    expect(r).toEqual({ ok: false, motivo: "Esta conta já foi paga." });
  });
});
