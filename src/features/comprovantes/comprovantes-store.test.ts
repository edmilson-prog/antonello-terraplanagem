import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { comprovantesStore } from "./comprovantes-store";

/*
 * Comprovantes saiu do mock em memória para o Supabase na Onda 21. O que a
 * store protege são as transições do ciclo de vida (pendente → assinado /
 * recusado, ambos terminais) e a unicidade por OS — é isso que os testes
 * exercitam, além do guard de credencial comum a toda store migrada.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

const ASSINATURA = {
  assinante_nome: "Maria Souza",
  assinatura_url: "data:image/png;base64,iVBORw0KGgo=",
};

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(comprovantesStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("comprovantesStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");
    await comprovantesStore.retry();
    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra", async () => {
    const espiao = vi.spyOn(supabase, "from");
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("comprovantes");
    });
  });
});

describe("comprovantesStore — ciclo de vida", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(comprovantesStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa gerar um segundo comprovante para a mesma OS", async () => {
    const existente = comprovantesStore.listar()[0];

    const r = await comprovantesStore.gerar({
      os_id: existente.os_id,
      cliente_id: existente.cliente_id,
      resumo_servico: "Tentativa duplicada",
    });

    expect(r).toEqual({ ok: false, motivo: "Esta OS já tem um comprovante gerado." });
  });

  it("assina um comprovante pendente e grava nome e data", async () => {
    const pendente = comprovantesStore.listar().find((c) => c.status === "pendente");
    expect(pendente, "esperava um comprovante pendente no dublê").toBeDefined();

    const r = await comprovantesStore.assinar(pendente!.id, ASSINATURA);

    expect(r.ok).toBe(true);
    const atual = comprovantesStore.obter(pendente!.id);
    expect(atual?.status).toBe("assinado");
    expect(atual?.assinante_nome).toBe("Maria Souza");
    expect(atual?.assinado_em).not.toBeNull();
  });

  it("não assina um comprovante que já saiu de pendente", async () => {
    const assinado = comprovantesStore.listar().find((c) => c.status === "assinado");
    expect(assinado, "esperava um comprovante assinado no dublê").toBeDefined();

    const r = await comprovantesStore.assinar(assinado!.id, ASSINATURA);

    expect(r).toEqual({ ok: false, motivo: "Só comprovantes pendentes podem ser assinados." });
  });

  it("exige nome e assinatura antes de gravar", async () => {
    const pendente = comprovantesStore.listar().find((c) => c.status === "pendente");
    expect(pendente).toBeDefined();

    const semNome = await comprovantesStore.assinar(pendente!.id, {
      ...ASSINATURA,
      assinante_nome: "   ",
    });
    expect(semNome).toEqual({ ok: false, motivo: "Informe o nome do assinante." });

    const semTraco = await comprovantesStore.assinar(pendente!.id, {
      ...ASSINATURA,
      assinatura_url: "",
    });
    expect(semTraco).toEqual({ ok: false, motivo: "Capture a assinatura antes de confirmar." });
  });

  it("recusa sem motivo é permitido — o porquê pode vir por fora", async () => {
    const pendente = comprovantesStore.listar().find((c) => c.status === "pendente");
    expect(pendente).toBeDefined();

    const r = await comprovantesStore.recusar(pendente!.id, null);

    expect(r.ok).toBe(true);
    expect(comprovantesStore.obter(pendente!.id)?.status).toBe("recusado");
  });
});
