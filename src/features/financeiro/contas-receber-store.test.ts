import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { contasReceberStore } from "./contas-receber-store";

/*
 * Contas a receber saiu do mock em memória para o Supabase na Onda 21,
 * fechando o par com contas_pagar (Onda 17). Mesmo contrato de teste das
 * outras stores migradas: o guard de credencial, que é o risco herdado por
 * qualquer store que passe a falar com o banco, mais as regras de baixa.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(contasReceberStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("contasReceberStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");

    await contasReceberStore.retry();

    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra, sem esperar um reload", async () => {
    const espiao = vi.spyOn(supabase, "from");

    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });

    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("contas_receber");
    });
  });

  it("esvazia a lista quando a retaguarda sai", async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(contasReceberStore.listar().length).toBeGreaterThan(0);
    });

    emitirAuthState("SIGNED_OUT", null);

    await vi.waitFor(() => {
      expect(contasReceberStore.listar()).toHaveLength(0);
    });
  });
});

describe("contasReceberStore — regras de baixa", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(contasReceberStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa baixa de conta inexistente", async () => {
    const r = await contasReceberStore.darBaixaReceber("nao-existe", {
      recebido_em: "2026-08-18",
      forma_recebimento: "pix",
    });
    expect(r).toEqual({ ok: false, motivo: "Conta a receber não encontrada." });
  });

  it("recusa receber duas vezes a mesma conta", async () => {
    const liquidada = contasReceberStore.listar().find((c) => c.status === "liquidada");
    // O dublê semeia ao menos uma conta já recebida; sem ela a regra não teria
    // como ser exercitada.
    expect(liquidada, "esperava uma conta liquidada no dublê").toBeDefined();

    const r = await contasReceberStore.darBaixaReceber(liquidada!.id, {
      recebido_em: "2026-08-18",
      forma_recebimento: "pix",
    });
    expect(r).toEqual({ ok: false, motivo: "Esta conta já foi recebida." });
  });

  it("registra data e forma ao dar baixa numa conta aberta", async () => {
    const aberta = contasReceberStore.listar().find((c) => c.status === "aberta");
    expect(aberta, "esperava uma conta aberta no dublê").toBeDefined();

    const r = await contasReceberStore.darBaixaReceber(aberta!.id, {
      recebido_em: "2026-08-18",
      forma_recebimento: "boleto",
    });

    expect(r.ok).toBe(true);
    const atualizada = contasReceberStore.obter(aberta!.id);
    expect(atualizada?.status).toBe("liquidada");
    expect(atualizada?.recebido_em).toBe("2026-08-18");
    expect(atualizada?.forma_recebimento).toBe("boleto");
  });
});
