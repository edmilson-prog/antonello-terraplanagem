import { describe, it, expect, vi, beforeEach } from "vitest";
import { avisosWhatsAppStore } from "./avisos-whatsapp-store";
import { supabase } from "@/lib/supabase";
import type { Cliente, OrdemServico } from "@/shared/types";

function criarOS(id: string): OrdemServico {
  return {
    id,
    numero: `OS-TESTE-${id}`,
    cliente_id: "cl-teste",
    obra_nome: "Obra Teste Aviso",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: null,
    observacao: null,
    diametro_broca_mm: null,
    aberta_em: "2026-07-01T00:00:00.000Z",
    fechada_em: "2026-07-02T00:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-02T00:00:00.000Z",
  };
}

const clienteComTelefone: Cliente = {
  id: "cl-teste",
  nome: "Cliente Teste",
  documento: null,
  telefone: "44999990000",
  ativo: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const clienteSemTelefone: Cliente = {
  ...clienteComTelefone,
  id: "cl-teste-sem-tel",
  telefone: null,
};

// Builder falso usado só no teste de falha de insert — imita o formato que o
// supabase-js real retorna quando o insert falha (data: null, error preenchido),
// sem depender do fake harness do vitest.setup.ts (que sempre resolve error: null).
type ResultadoFrom = ReturnType<typeof supabase.from>;

function criarBuilderComErroDeInsert(mensagemErro: string): ResultadoFrom {
  const builder = {
    insert: () => builder,
    select: () => builder,
    single: () => builder,
    returns: () => builder,
    then: (resolve: (valor: { data: null; error: { message: string } }) => unknown) =>
      Promise.resolve(resolve({ data: null, error: { message: mensagemErro } })),
  };
  return builder as unknown as ResultadoFrom;
}

describe("avisosWhatsAppStore", () => {
  beforeEach(() => {
    vi.mocked(supabase.functions.invoke).mockReset();
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: { ok: true }, error: null });
  });

  it("cliente sem telefone válido: grava falha_telefone_invalido sem chamar a edge function", async () => {
    const os = criarOS("os-teste-sem-tel");
    const r = await avisosWhatsAppStore.dispararAviso(os, clienteSemTelefone);
    expect(r.ok).toBe(false);
    expect(r.aviso?.status).toBe("falha_telefone_invalido");
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("telefone válido e envio ok: grava enviado com a mensagem", async () => {
    const os = criarOS("os-teste-ok");
    const r = await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.aviso.status).toBe("enviado");
      expect(r.aviso.provedor).toBe("waha");
      expect(r.aviso.mensagem_preview.length).toBeGreaterThan(0);
    }
  });

  it("edge function reporta sessão desconectada: grava falha_sessao_desconectada", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { ok: false, motivo: "sessao_desconectada" },
      error: null,
    });
    const os = criarOS("os-teste-sessao");
    const r = await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    expect(r.ok).toBe(false);
    expect(r.aviso?.status).toBe("falha_sessao_desconectada");
  });

  it("segunda chamada pra mesma OS é bloqueada sem chamar a edge function de novo", async () => {
    const os = criarOS("os-teste-dedup");
    await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    vi.mocked(supabase.functions.invoke).mockClear();
    const r2 = await avisosWhatsAppStore.dispararAviso(os, clienteComTelefone);
    expect(r2.ok).toBe(false);
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("falha ao gravar o aviso no banco: retorna { ok: false } em vez de lançar", async () => {
    const os = criarOS("os-teste-insert-falha");
    const fromEspiao = vi
      .spyOn(supabase, "from")
      .mockReturnValueOnce(criarBuilderComErroDeInsert("insert falhou (teste)"));

    await expect(avisosWhatsAppStore.dispararAviso(os, clienteComTelefone)).resolves.toEqual({
      ok: false,
      motivo: "Não foi possível registrar o aviso. Tente novamente.",
    });

    fromEspiao.mockRestore();
  });
});
