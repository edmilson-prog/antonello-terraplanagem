import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Notificacao } from "@/shared/types";

/*
 * O que estes testes protegem: o comportamento offline. A parte online é uma
 * chamada de RPC; o que pode dar errado de verdade é o operador em campo sem
 * sinal — tela vazia, ou notificação que "volta a ser nova" depois de ele já
 * ter marcado como lida.
 */

const ctx = vi.hoisted(() => ({
  rpc: vi.fn(),
  sessao: {
    token: "tok-1",
    operadorId: "op-1",
    operadorNome: "Adelar",
    expiraEm: "2099-01-01T00:00:00.000Z",
  } as { token: string; operadorId: string; operadorNome: string; expiraEm: string } | null,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: { rpc: (...args: unknown[]) => ctx.rpc(...args) },
  sessaoRestaurada: Promise.resolve({ data: { session: null } }),
}));

vi.mock("@/features/auth/operador-session", () => ({
  lerSessaoOperador: () => ctx.sessao,
  getOperadorLogadoId: () => ctx.sessao?.operadorId ?? "",
}));

const CHAVE_CACHE = "antonello.notificacoes";
const CHAVE_FILA = "antonello.notificacoes.fila_lidas";

function notificacao(over: Partial<Notificacao> = {}): Notificacao {
  return {
    id: "nt-1",
    operador_id: "op-1",
    usuario_id: null,
    categoria: "operacao",
    prioridade: "normal",
    acao: null,
    canais: null,
    agendada_para: null,
    enviada_em: "2026-08-09T10:38:00.000Z",
    tipo: "os_atribuida",
    titulo: "Nova OS atribuída a você",
    mensagem: "OS-024 · Nivelamento de pátio",
    os_id: null,
    origem_id: null,
    lida_em: null,
    created_at: "2026-08-09T10:38:00.000Z",
    updated_at: "2026-08-09T10:38:00.000Z",
    ...over,
  };
}

const DUAS_NAO_LIDAS = [notificacao({ id: "a" }), notificacao({ id: "b" })];

/** Importa o store zerado — o estado dele é de módulo. */
async function carregarStore() {
  vi.resetModules();
  return import("@/features/notificacoes/notificacoes-store");
}

function respostaOk(data: unknown) {
  return { data, error: null };
}
const RESPOSTA_ERRO = { data: null, error: { message: "network" } };

beforeEach(() => {
  window.localStorage.clear();
  ctx.rpc.mockReset();
  ctx.sessao = {
    token: "tok-1",
    operadorId: "op-1",
    operadorNome: "Adelar",
    expiraEm: "2099-01-01T00:00:00.000Z",
  };
});

describe("carregar", () => {
  it("busca da RPC e guarda no aparelho", async () => {
    ctx.rpc.mockResolvedValue(respostaOk(DUAS_NAO_LIDAS));
    const store = await carregarStore();

    await store.carregar();

    expect(store.notificacoesStore.listar()).toHaveLength(2);
    expect(ctx.rpc).toHaveBeenCalledWith("listar_notificacoes", {
      p_token: "tok-1",
      p_limite: 50,
    });

    const cache = JSON.parse(window.localStorage.getItem(CHAVE_CACHE)!);
    expect(cache.operadorId).toBe("op-1");
    expect(cache.itens).toHaveLength(2);
  });

  it("sem sinal, mostra o que estava salvo e se declara offline", async () => {
    window.localStorage.setItem(
      CHAVE_CACHE,
      JSON.stringify({ operadorId: "op-1", itens: DUAS_NAO_LIDAS }),
    );
    ctx.rpc.mockResolvedValue(RESPOSTA_ERRO);
    const store = await carregarStore();

    await store.carregar();

    expect(store.notificacoesStore.listar()).toHaveLength(2);
  });

  it("ignora cache que é de outro operador do mesmo aparelho", async () => {
    window.localStorage.setItem(
      CHAVE_CACHE,
      JSON.stringify({ operadorId: "op-OUTRO", itens: DUAS_NAO_LIDAS }),
    );
    ctx.rpc.mockResolvedValue(RESPOSTA_ERRO);
    const store = await carregarStore();

    await store.carregar();

    expect(store.notificacoesStore.listar()).toEqual([]);
  });

  it("sem sessão não chama a RPC", async () => {
    ctx.sessao = null;
    const store = await carregarStore();

    await store.carregar();

    expect(ctx.rpc).not.toHaveBeenCalled();
  });
});

describe("marcarLidas", () => {
  it("marca na hora, sem esperar a rede", async () => {
    ctx.rpc.mockResolvedValue(respostaOk(DUAS_NAO_LIDAS));
    const store = await carregarStore();
    await store.carregar();

    await store.marcarLidas();

    expect(store.notificacoesStore.listar().every((n) => n.lida_em !== null)).toBe(true);
    expect(ctx.rpc).toHaveBeenCalledWith("marcar_notificacoes_lidas", {
      p_token: "tok-1",
      p_ids: ["a", "b"],
    });
  });

  it("enfileira quando a rede falha", async () => {
    ctx.rpc.mockImplementation((nome: string) =>
      Promise.resolve(nome === "listar_notificacoes" ? respostaOk(DUAS_NAO_LIDAS) : RESPOSTA_ERRO),
    );
    const store = await carregarStore();
    await store.carregar();

    await store.marcarLidas();

    expect(JSON.parse(window.localStorage.getItem(CHAVE_FILA)!)).toEqual(["a", "b"]);
    // A tela não pode voltar atrás só porque o envio falhou.
    expect(store.notificacoesStore.listar().every((n) => n.lida_em !== null)).toBe(true);
  });

  it("não deixa a notificação voltar a ser nova no refresh seguinte", async () => {
    ctx.rpc.mockImplementation((nome: string) =>
      Promise.resolve(nome === "listar_notificacoes" ? respostaOk(DUAS_NAO_LIDAS) : RESPOSTA_ERRO),
    );
    const store = await carregarStore();
    await store.carregar();
    await store.marcarLidas();

    // O servidor ainda devolve as duas como NÃO lidas — a fila local é que sabe.
    await store.carregar();

    expect(store.notificacoesStore.listar().every((n) => n.lida_em !== null)).toBe(true);
  });

  it("não chama a RPC quando não há nada por marcar", async () => {
    ctx.rpc.mockResolvedValue(
      respostaOk([notificacao({ id: "a", lida_em: "2026-08-09T11:00:00.000Z" })]),
    );
    const store = await carregarStore();
    await store.carregar();
    ctx.rpc.mockClear();

    await store.marcarLidas();

    expect(ctx.rpc).not.toHaveBeenCalled();
  });
});

describe("sincronizarFilaLidas", () => {
  it("esvazia a fila quando o envio passa", async () => {
    window.localStorage.setItem(CHAVE_FILA, JSON.stringify(["a", "b"]));
    ctx.rpc.mockResolvedValue(respostaOk(null));
    const store = await carregarStore();

    await store.sincronizarFilaLidas();

    expect(ctx.rpc).toHaveBeenCalledWith("marcar_notificacoes_lidas", {
      p_token: "tok-1",
      p_ids: ["a", "b"],
    });
    expect(window.localStorage.getItem(CHAVE_FILA)).toBeNull();
  });

  it("mantém a fila quando o envio falha de novo", async () => {
    window.localStorage.setItem(CHAVE_FILA, JSON.stringify(["a"]));
    ctx.rpc.mockResolvedValue(RESPOSTA_ERRO);
    const store = await carregarStore();

    await store.sincronizarFilaLidas();

    expect(JSON.parse(window.localStorage.getItem(CHAVE_FILA)!)).toEqual(["a"]);
  });
});

describe("limparNotificacoesLocais", () => {
  it("não deixa rastro para o próximo operador do aparelho", async () => {
    ctx.rpc.mockResolvedValue(respostaOk(DUAS_NAO_LIDAS));
    const store = await carregarStore();
    await store.carregar();
    window.localStorage.setItem(CHAVE_FILA, JSON.stringify(["a"]));

    store.limparNotificacoesLocais();

    expect(store.notificacoesStore.listar()).toEqual([]);
    expect(window.localStorage.getItem(CHAVE_CACHE)).toBeNull();
    expect(window.localStorage.getItem(CHAVE_FILA)).toBeNull();
  });
});
