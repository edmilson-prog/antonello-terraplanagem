import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { registrosManutencaoStore } from "./registros-manutencao-store";

/*
 * Registros de manutenção saíram do mock em memória para o Supabase na Onda 18,
 * então herdaram o risco que derrubou os outros stores: o bundle não tem
 * code-splitting, este módulo é importado no boot de qualquer rota — landing
 * pública, login, app de campo — e sem credencial a consulta volta 401, que
 * ficava preso na tela até um F5.
 *
 * Mesmo contrato de `contas-pagar-store.test.ts` (Onda 17) e de
 * `clientes-store.test.ts`, que documenta a regressão original. Aqui há uma
 * diferença: o store tem DOIS caminhos de leitura (tabela na retaguarda, RPC no
 * app de campo), então "tem credencial" não é sinônimo de "está logado no
 * Supabase Auth" — daí o guard olhar `credencialAtual() === "nenhuma"` e não a
 * sessão da retaguarda.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(registrosManutencaoStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("registrosManutencaoStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");

    await registrosManutencaoStore.retry();

    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra, sem esperar um reload", async () => {
    const espiao = vi.spyOn(supabase, "from");

    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });

    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("registros_manutencao");
    });
  });

  it("esvazia a lista quando a retaguarda sai", async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(registrosManutencaoStore.listar().length).toBeGreaterThan(0);
    });

    emitirAuthState("SIGNED_OUT", null);

    await vi.waitFor(() => {
      expect(registrosManutencaoStore.listar()).toHaveLength(0);
    });
  });
});

describe("registrosManutencaoStore — regras de conclusão", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(registrosManutencaoStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa registro inexistente", async () => {
    const r = await registrosManutencaoStore.registrarRealizada("nao-existe", {
      horimetroRealizado: 100,
    });
    expect(r).toEqual({ ok: false, motivo: "Registro de manutenção não encontrado." });
  });

  it("recusa concluir duas vezes a mesma manutenção", async () => {
    const realizada = registrosManutencaoStore.listar().find((r) => r.status === "realizada");
    // O dublê de Supabase semeia ao menos um registro já realizado; sem ele, a
    // regra não teria como ser exercitada.
    expect(realizada, "esperava um registro realizado no dublê").toBeDefined();

    const r = await registrosManutencaoStore.registrarRealizada(realizada!.id, {
      horimetroRealizado: 100,
    });
    expect(r).toEqual({ ok: false, motivo: "Esta manutenção já foi registrada como realizada." });
  });

  it("abre o próximo ciclo ao concluir uma preventiva de plano", async () => {
    const prevista = registrosManutencaoStore.listar().find((r) => r.status === "prevista");
    expect(prevista, "esperava um registro previsto no dublê").toBeDefined();

    const antes = registrosManutencaoStore.listar().length;
    const r = await registrosManutencaoStore.registrarRealizada(prevista!.id, {
      horimetroRealizado: 9000,
      intervaloHoras: 250,
    });

    expect(r.ok).toBe(true);
    const depois = registrosManutencaoStore.listar();
    expect(depois).toHaveLength(antes + 1);
    const sucessora = depois.find(
      (x) => x.status === "prevista" && x.plano_id === prevista!.plano_id && x.id !== prevista!.id,
    );
    expect(sucessora?.horimetro_previsto).toBe(9250);
  });

  it("conclui ordem sem plano sem deixar sucessora", async () => {
    const aberta = await registrosManutencaoStore.abrirManutencao({
      equipamento_id: "eq-001",
      tipo: "corretiva",
      descricao: "Vazamento no comando hidráulico",
      prioridade: "alta",
      horimetro_abertura: 8432,
      aberta_em: "2026-08-17T12:00:00.000Z",
      custo: 3400,
      fornecedor: "Oficina interna",
      observacao: null,
    });

    const antes = registrosManutencaoStore.listar().length;
    const r = await registrosManutencaoStore.registrarRealizada(aberta.id, {
      horimetroRealizado: 8440,
      intervaloHoras: null,
      custo: 3400,
    });

    expect(r.ok).toBe(true);
    expect(registrosManutencaoStore.listar()).toHaveLength(antes);
  });
});
