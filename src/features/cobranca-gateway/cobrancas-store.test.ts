import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { cobrancasStore } from "./cobrancas-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";

/*
 * Cobranças saiu do mock em memória para o Supabase na Onda 21. Deixou de ser
 * um factory com a store de contas injetada — agora as duas falam com o banco,
 * e a injeção só servia para o teste antigo.
 *
 * O que continua simulado é a INTEGRAÇÃO: linha digitável e PIX são gerados
 * localmente, e `simularWebhookPago` faz o papel do webhook do provedor. A
 * cobrança em si é persistida de verdade.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(cobrancasStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("cobrancasStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");
    await cobrancasStore.retry();
    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra", async () => {
    const espiao = vi.spyOn(supabase, "from");
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("cobrancas_gateway");
    });
  });
});

describe("cobrancasStore — emissão", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(contasReceberStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa emitir para conta inexistente", async () => {
    const r = await cobrancasStore.emitirCobranca("nao-existe", "asaas");
    expect(r).toEqual({ ok: false, motivo: "Conta a receber não encontrada." });
  });

  it("recusa emitir para conta já liquidada", async () => {
    const liquidada = contasReceberStore.listar().find((c) => c.status === "liquidada");
    expect(liquidada, "esperava uma conta liquidada no dublê").toBeDefined();

    const r = await cobrancasStore.emitirCobranca(liquidada!.id, "asaas");
    expect(r).toEqual({
      ok: false,
      motivo: "Esta conta já foi liquidada; não é possível emitir cobrança.",
    });
  });

  it("emite com linha digitável e PIX preenchidos", async () => {
    const aberta = contasReceberStore
      .listar()
      .find(
        (c) =>
          c.status === "aberta" &&
          !cobrancasStore.listar().some((x) => x.conta_receber_id === c.id),
      );
    expect(aberta, "esperava uma conta aberta sem cobrança no dublê").toBeDefined();

    const r = await cobrancasStore.emitirCobranca(aberta!.id, "mercado_pago");

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.cobranca.status).toBe("pendente");
    expect(r.cobranca.valor).toBe(aberta!.valor);
    expect(r.cobranca.pix_copia_cola).toBeTruthy();
  });

  it("recusa uma segunda cobrança pendente para a mesma conta", async () => {
    const pendente = cobrancasStore.listar().find((c) => c.status === "pendente");
    expect(pendente, "esperava uma cobrança pendente no dublê").toBeDefined();

    const r = await cobrancasStore.emitirCobranca(pendente!.conta_receber_id, "asaas");
    expect(r).toEqual({ ok: false, motivo: "Já existe uma cobrança pendente para esta conta." });
  });
});

describe("cobrancasStore — pagamento simulado", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(cobrancasStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa pagar cobrança inexistente", async () => {
    const r = await cobrancasStore.simularWebhookPago("nao-existe");
    expect(r).toEqual({ ok: false, motivo: "Cobrança não encontrada." });
  });

  it("dar por paga também liquida a conta a receber", async () => {
    const pendente = cobrancasStore.listar().find((c) => c.status === "pendente");
    expect(pendente, "esperava uma cobrança pendente no dublê").toBeDefined();

    const r = await cobrancasStore.simularWebhookPago(pendente!.id);

    expect(r.ok).toBe(true);
    expect(cobrancasStore.obter(pendente!.id)?.status).toBe("paga");
    // É o ponto do fluxo: a baixa da conta é o efeito que importa, não o
    // status da cobrança.
    expect(contasReceberStore.obter(pendente!.conta_receber_id)?.status).toBe("liquidada");
  });

  it("recusa pagar duas vezes", async () => {
    const paga = cobrancasStore.listar().find((c) => c.status === "paga");
    expect(paga, "esperava uma cobrança paga no dublê").toBeDefined();

    const r = await cobrancasStore.simularWebhookPago(paga!.id);
    expect(r).toEqual({ ok: false, motivo: "Esta cobrança já foi paga." });
  });
});
