import { describe, it, expect, beforeEach } from "vitest";
import {
  criarApontamentosStore,
  apontamentosDoOperador,
  apontamentoEmAndamentoDoOperador,
} from "./apontamentos-store";
import { gravarSessaoOperador } from "@/features/auth/operador-session";
import type { Apontamento } from "@/shared/types";

function seedBase(): Apontamento[] {
  return [
    {
      id: "a1",
      equipamento_id: "eq-1",
      operador_id: "op-001",
      os_id: null,
      horimetro_inicial: 100,
      horimetro_final: null,
      horas_trabalhadas: null,
      foto_inicial_url: null,
      foto_final_url: null,
      observacao: null,
      modalidade: null,
      metros_executados: null,
      status: "em_andamento",
      pendente_sync: false,
      iniciado_em: "2026-01-01T00:00:00.000Z",
      finalizado_em: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "a2",
      equipamento_id: "eq-2",
      operador_id: "op-002",
      os_id: null,
      horimetro_inicial: 50,
      horimetro_final: 58,
      horas_trabalhadas: 8,
      foto_inicial_url: null,
      foto_final_url: null,
      observacao: null,
      modalidade: null,
      metros_executados: null,
      status: "finalizado",
      pendente_sync: false,
      iniciado_em: "2026-01-01T00:00:00.000Z",
      finalizado_em: "2026-01-01T08:00:00.000Z",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T08:00:00.000Z",
    },
  ];
}

describe("apontamentosStore", () => {
  beforeEach(() => {
    gravarSessaoOperador({
      token: "t",
      operadorId: "op-001",
      operadorNome: "Teste",
      expiraEm: new Date(Date.now() + 1000).toISOString(),
    });
  });

  it("iniciar cria um apontamento em andamento no topo da lista", () => {
    const store = criarApontamentosStore([]);
    const novo = store.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 });
    expect(novo.status).toBe("em_andamento");
    expect(novo.operador_id).toBe("op-001");
    expect(novo.pendente_sync).toBe(true);
    expect(novo.horimetro_final).toBeNull();
    expect(novo.horas_trabalhadas).toBeNull();
    expect(store.listar()[0].id).toBe(novo.id);
  });

  it("iniciar normaliza observação vazia para null e os_id ausente para null", () => {
    const store = criarApontamentosStore([]);
    const novo = store.iniciar({
      equipamento_id: "eq-9",
      horimetro_inicial: 10,
      observacao: "   ",
    });
    expect(novo.observacao).toBeNull();
    expect(novo.os_id).toBeNull();
  });

  it("iniciar grava modalidade quando informada, e null quando omitida", () => {
    const store = criarApontamentosStore([]);
    const comModalidade = store.iniciar({
      equipamento_id: "eq-9",
      horimetro_inicial: 10,
      modalidade: "seca",
    });
    expect(comModalidade.modalidade).toBe("seca");
    const semModalidade = store.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 });
    expect(semModalidade.modalidade).toBeNull();
  });

  it("finalizar calcula horas e marca finalizado", () => {
    const store = criarApontamentosStore(seedBase());
    const r = store.finalizar("a1", { horimetro_final: 108.5 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.apontamento.status).toBe("finalizado");
      expect(r.apontamento.horas_trabalhadas).toBe(8.5);
      expect(r.apontamento.finalizado_em).not.toBeNull();
      expect(r.apontamento.pendente_sync).toBe(true);
    }
  });

  it("finalizar grava metros_executados quando informado, e mantém null quando omitido", () => {
    const store = criarApontamentosStore(seedBase());
    const r = store.finalizar("a1", { horimetro_final: 108.5, metros_executados: 12.5 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.apontamento.metros_executados).toBe(12.5);

    const store2 = criarApontamentosStore(seedBase());
    const r2 = store2.finalizar("a1", { horimetro_final: 108.5 });
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(r2.apontamento.metros_executados).toBeNull();
  });

  it("rejeita finalizar com final menor que inicial e não muta o registro", () => {
    const store = criarApontamentosStore(seedBase());
    const r = store.finalizar("a1", { horimetro_final: 90 });
    expect(r).toEqual({ ok: false, erro: "final_menor_que_inicial" });
    expect(store.obter("a1")?.status).toBe("em_andamento");
  });

  it("rejeita finalizar id inexistente e já finalizado", () => {
    const store = criarApontamentosStore(seedBase());
    expect(store.finalizar("zzz", { horimetro_final: 200 })).toEqual({
      ok: false,
      erro: "nao_encontrado",
    });
    expect(store.finalizar("a2", { horimetro_final: 60 })).toEqual({
      ok: false,
      erro: "ja_finalizado",
    });
  });

  it("apontamentosDoOperador filtra por operador", () => {
    const store = criarApontamentosStore(seedBase());
    expect(apontamentosDoOperador(store.listar(), "op-001").map((a) => a.id)).toEqual(["a1"]);
    expect(apontamentosDoOperador(store.listar(), "op-002").map((a) => a.id)).toEqual(["a2"]);
  });

  it("apontamentoEmAndamentoDoOperador encontra o em_andamento do operador, ou null", () => {
    const store = criarApontamentosStore(seedBase());
    expect(apontamentoEmAndamentoDoOperador(store.listar(), "op-001")?.id).toBe("a1");
    expect(apontamentoEmAndamentoDoOperador(store.listar(), "op-002")).toBeNull();
    expect(apontamentoEmAndamentoDoOperador(store.listar(), "op-999")).toBeNull();
  });

  it("não muta a seed original", () => {
    const seed = seedBase();
    const copia = JSON.parse(JSON.stringify(seed));
    const store = criarApontamentosStore(seed);
    store.iniciar({ equipamento_id: "eq-9", horimetro_inicial: 10 });
    store.finalizar("a1", { horimetro_final: 110 });
    expect(seed).toEqual(copia);
  });
});
