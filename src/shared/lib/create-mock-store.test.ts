import { describe, it, expect } from "vitest";
import { createMockStore } from "./create-mock-store";

type Item = {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

const seed: Item[] = [
  { id: "a", nome: "Alpha", ativo: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-01T00:00:00.000Z" },
];

describe("createMockStore", () => {
  it("getAll retorna a seed inicial", () => {
    const store = createMockStore<Item>(seed);
    expect(store.getAll()).toHaveLength(1);
    expect(store.getAll()[0].nome).toBe("Alpha");
  });

  it("getById encontra por id", () => {
    const store = createMockStore<Item>(seed);
    expect(store.getById("a")?.nome).toBe("Alpha");
    expect(store.getById("inexistente")).toBeUndefined();
  });

  it("create adiciona com id e timestamps gerados", () => {
    const store = createMockStore<Item>(seed);
    const criado = store.create({ nome: "Beta", ativo: true });
    expect(criado.id).toBeTruthy();
    expect(criado.created_at).toBeTruthy();
    expect(criado.updated_at).toBe(criado.created_at);
    expect(store.getAll()).toHaveLength(2);
    expect(store.getById(criado.id)?.nome).toBe("Beta");
  });

  it("update aplica patch e atualiza updated_at sem tocar created_at", () => {
    const store = createMockStore<Item>(seed);
    store.update("a", { nome: "Alpha 2" });
    const item = store.getById("a");
    expect(item?.nome).toBe("Alpha 2");
    expect(item?.created_at).toBe("2024-01-01T00:00:00.000Z");
    expect(item?.updated_at).not.toBe("2024-01-01T00:00:00.000Z");
  });

  it("setAtivo alterna o flag ativo", () => {
    const store = createMockStore<Item>(seed);
    store.setAtivo("a", false);
    expect(store.getById("a")?.ativo).toBe(false);
    store.setAtivo("a", true);
    expect(store.getById("a")?.ativo).toBe(true);
  });

  it("não muta a seed original", () => {
    const original = [...seed];
    const store = createMockStore<Item>(seed);
    store.create({ nome: "Gamma", ativo: true });
    expect(seed).toEqual(original);
    expect(seed).toHaveLength(1);
  });
});
