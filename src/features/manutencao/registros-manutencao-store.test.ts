import { describe, it, expect, beforeEach } from "vitest";
import { criarRegistrosManutencaoStore } from "./registros-manutencao-store";
import type { RegistroManutencao } from "@/shared/types";

const seed: RegistroManutencao[] = [
  {
    id: "rm-t01",
    equipamento_id: "eq-1",
    plano_id: "pm-1",
    horimetro_previsto: 1000,
    horimetro_realizado: null,
    status: "prevista",
    custo: null,
    observacao: null,
    realizada_em: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rm-t02",
    equipamento_id: "eq-2",
    plano_id: "pm-2",
    horimetro_previsto: 500,
    horimetro_realizado: 505,
    status: "realizada",
    custo: 300,
    observacao: null,
    realizada_em: "2025-12-01T00:00:00.000Z",
    created_at: "2025-11-01T00:00:00.000Z",
    updated_at: "2025-12-01T00:00:00.000Z",
  },
];

describe("criarRegistrosManutencaoStore", () => {
  let store: ReturnType<typeof criarRegistrosManutencaoStore>;

  beforeEach(() => {
    store = criarRegistrosManutencaoStore(seed);
  });

  it("listar retorna 2 itens", () => {
    expect(store.listar()).toHaveLength(2);
  });

  it("criarPrevista adiciona um novo registro 'prevista' no início da lista", () => {
    const novo = store.criarPrevista({
      equipamento_id: "eq-3",
      plano_id: "pm-3",
      horimetro_previsto: 2000,
    });
    expect(novo.status).toBe("prevista");
    expect(novo.horimetro_realizado).toBeNull();
    expect(store.listar()[0].id).toBe(novo.id);
  });

  it("registrarRealizada transiciona prevista → realizada com os dados informados", () => {
    const r = store.registrarRealizada("rm-t01", {
      horimetroRealizado: 1010,
      intervaloHoras: 250,
      custo: 150,
      observacao: "Ok",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.registro.status).toBe("realizada");
      expect(r.registro.horimetro_realizado).toBe(1010);
      expect(r.registro.custo).toBe(150);
      expect(r.registro.realizada_em).not.toBeNull();
    }
  });

  it("registrarRealizada cria o próximo ciclo 'prevista' com horimetro_previsto = realizado + intervalo", () => {
    store.registrarRealizada("rm-t01", { horimetroRealizado: 1010, intervaloHoras: 250 });
    const proximo = store
      .listar()
      .find((r) => r.plano_id === "pm-1" && r.equipamento_id === "eq-1" && r.status === "prevista");
    expect(proximo?.horimetro_previsto).toBe(1260);
    expect(proximo?.horimetro_realizado).toBeNull();
  });

  it("registrarRealizada normaliza observação vazia para null e custo ausente para null", () => {
    const r = store.registrarRealizada("rm-t01", {
      horimetroRealizado: 1010,
      intervaloHoras: 250,
      observacao: "   ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.registro.observacao).toBeNull();
      expect(r.registro.custo).toBeNull();
    }
  });

  it("registrarRealizada em registro já realizado retorna ok:false", () => {
    const r = store.registrarRealizada("rm-t02", { horimetroRealizado: 600, intervaloHoras: 500 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("já");
  });

  it("registrarRealizada em id inexistente retorna ok:false", () => {
    const r = store.registrarRealizada("xxx", { horimetroRealizado: 600, intervaloHoras: 500 });
    expect(r.ok).toBe(false);
  });

  it("não muta a seed original", () => {
    const original = JSON.parse(JSON.stringify(seed));
    store.registrarRealizada("rm-t01", { horimetroRealizado: 1010, intervaloHoras: 250 });
    store.criarPrevista({ equipamento_id: "eq-3", plano_id: "pm-3", horimetro_previsto: 2000 });
    expect(seed).toEqual(original);
  });
});
