import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  apontamentosStore,
  apontamentosDoOperador,
  apontamentoEmAndamentoDoOperador,
} from "./apontamentos-store";
import { gravarSessaoOperador, encerrarSessaoOperador } from "@/features/auth/operador-session";
import type { Apontamento } from "@/shared/types";

/*
 * O store agora fala com o banco: pelas RPCs do operador quando há sessão por
 * PIN, e pela tabela quando é a retaguarda. O dublê do Supabase em
 * vitest.setup.ts implementa as duas pontas — a fonte da verdade das regras é o
 * SQL em supabase/migrations/20260812120000_operador_dados_rpcs.sql.
 */

function entrarComo(operadorId: string) {
  gravarSessaoOperador({
    token: "token-de-teste",
    operadorId,
    operadorNome: "Teste",
    expiraEm: new Date(Date.now() + 60_000).toISOString(),
  });
}

describe("apontamentosStore — caminho do operador (RPC por token)", () => {
  beforeEach(async () => {
    entrarComo("op-001");
    await apontamentosStore.retry();
  });

  afterEach(() => {
    encerrarSessaoOperador();
  });

  it("carrega os apontamentos do operador logado", async () => {
    const lista = apontamentosStore.listar();
    expect(lista.length).toBeGreaterThan(0);
    expect(apontamentosDoOperador(lista, "op-001").length).toBeGreaterThan(0);
    expect(apontamentosStore.useEstado === undefined).toBe(false);
  });

  it("traz também os apontamentos dos colegas nas OS em que o operador trabalha", async () => {
    // ap-006 é de op-002 em os-001, a OS colaborativa onde op-001 tem ap-001.
    // Sem isso, "horas da equipe" na tela de detalhe viraria "minhas horas".
    const doColega = apontamentosStore.listar().find((a) => a.operador_id === "op-002");
    expect(doColega).toBeDefined();
  });

  it("iniciar grava pelo servidor e devolve o apontamento já sincronizado", async () => {
    encerrarSessaoOperador();
    entrarComo("op-sem-apontamento");
    await apontamentosStore.retry();

    const novo = await apontamentosStore.iniciar({
      equipamento_id: "eq-9",
      horimetro_inicial: 10,
      observacao: "   ",
    });

    expect(novo.status).toBe("em_andamento");
    expect(novo.operador_id).toBe("op-sem-apontamento");
    // Veio do banco, não da fila local: nada pendente de sincronizar.
    expect(novo.pendente_sync).toBe(false);
    expect(novo.observacao).toBeNull();
    expect(novo.os_id).toBeNull();
    expect(apontamentosStore.obter(novo.id)).toBeDefined();
  });

  it("iniciar recusa um segundo apontamento em andamento", async () => {
    encerrarSessaoOperador();
    entrarComo("op-duplicado");
    await apontamentosStore.retry();

    await apontamentosStore.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 });
    await expect(
      apontamentosStore.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 20 }),
    ).rejects.toThrow(/apontamento em andamento/i);
  });

  it("iniciar sem sessão de operador falha em vez de gravar como anônimo", async () => {
    encerrarSessaoOperador();
    await expect(
      apontamentosStore.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 }),
    ).rejects.toThrow(/Nenhum operador logado/);
  });

  it("finalizar calcula horas, mescla a nota de fechamento e fecha", async () => {
    encerrarSessaoOperador();
    entrarComo("op-fechamento");
    await apontamentosStore.retry();

    const novo = await apontamentosStore.iniciar({
      equipamento_id: "eq-9",
      horimetro_inicial: 100,
      observacao: "Abertura",
    });
    const r = await apontamentosStore.finalizar(novo.id, {
      horimetro_final: 108.5,
      metros_executados: 12.5,
      observacao: "Fechamento",
    });

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.apontamento.status).toBe("finalizado");
      expect(r.apontamento.horas_trabalhadas).toBe(8.5);
      expect(r.apontamento.metros_executados).toBe(12.5);
      expect(r.apontamento.observacao).toBe("Abertura\nFechamento");
      expect(r.apontamento.finalizado_em).not.toBeNull();
    }
  });

  it("finalizar recusa horímetro final menor que o inicial, sem mexer no registro", async () => {
    encerrarSessaoOperador();
    entrarComo("op-menor");
    await apontamentosStore.retry();

    const novo = await apontamentosStore.iniciar({
      equipamento_id: "eq-9",
      horimetro_inicial: 100,
    });
    const r = await apontamentosStore.finalizar(novo.id, { horimetro_final: 90 });

    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toBe("final_menor_que_inicial");
    expect(apontamentosStore.obter(novo.id)?.status).toBe("em_andamento");
  });

  it("finalizar distingue apontamento inexistente de já finalizado", async () => {
    encerrarSessaoOperador();
    entrarComo("op-refechar");
    await apontamentosStore.retry();

    const inexistente = await apontamentosStore.finalizar("nao-existe", { horimetro_final: 200 });
    expect(inexistente.ok).toBe(false);
    if (!inexistente.ok) expect(inexistente.erro).toBe("nao_encontrado");

    const novo = await apontamentosStore.iniciar({
      equipamento_id: "eq-9",
      horimetro_inicial: 100,
    });
    await apontamentosStore.finalizar(novo.id, { horimetro_final: 110 });

    // Reenvio da fila offline com o mesmo horímetro: no-op bem-sucedido.
    const reenvio = await apontamentosStore.finalizar(novo.id, { horimetro_final: 110 });
    expect(reenvio.ok).toBe(true);

    // Horímetro diferente são duas leituras conflitantes — aí é erro.
    const conflito = await apontamentosStore.finalizar(novo.id, { horimetro_final: 999 });
    expect(conflito.ok).toBe(false);
    if (!conflito.ok) expect(conflito.erro).toBe("ja_finalizado");
  });
});

describe("apontamentosStore — caminho da retaguarda (tabela)", () => {
  it("sem sessão de operador, lê a tabela inteira", async () => {
    encerrarSessaoOperador();
    await apontamentosStore.retry();

    const lista = apontamentosStore.listar();
    const operadores = new Set(lista.map((a) => a.operador_id));
    // A retaguarda enxerga todos os operadores, não só um.
    expect(operadores.size).toBeGreaterThan(1);
  });
});

describe("filtros puros", () => {
  const lista: Apontamento[] = [
    { id: "a1", operador_id: "op-001", status: "em_andamento" } as Apontamento,
    { id: "a2", operador_id: "op-002", status: "finalizado" } as Apontamento,
  ];

  it("apontamentosDoOperador filtra por operador", () => {
    expect(apontamentosDoOperador(lista, "op-001").map((a) => a.id)).toEqual(["a1"]);
    expect(apontamentosDoOperador(lista, "op-002").map((a) => a.id)).toEqual(["a2"]);
  });

  it("apontamentoEmAndamentoDoOperador encontra o em_andamento do operador, ou null", () => {
    expect(apontamentoEmAndamentoDoOperador(lista, "op-001")?.id).toBe("a1");
    expect(apontamentoEmAndamentoDoOperador(lista, "op-002")).toBeNull();
    expect(apontamentoEmAndamentoDoOperador(lista, "op-999")).toBeNull();
  });
});
