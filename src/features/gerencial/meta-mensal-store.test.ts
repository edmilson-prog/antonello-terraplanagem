import { describe, it, expect } from "vitest";
import { criarMetaMensalStore } from "./meta-mensal-store";

describe("criarMetaMensalStore", () => {
  it("usa o valor padrão quando não há nada salvo", () => {
    const store = criarMetaMensalStore("teste:meta-1", 15000);
    expect(store.obter()).toBe(15000);
  });

  it("persiste e recupera o valor definido, mesmo em outra instância com a mesma chave", () => {
    const store = criarMetaMensalStore("teste:meta-2", 15000);
    store.definir(30000);
    expect(store.obter()).toBe(30000);

    const outraInstancia = criarMetaMensalStore("teste:meta-2", 15000);
    expect(outraInstancia.obter()).toBe(30000);
  });

  it("nunca aceita valor negativo — zera em vez disso", () => {
    const store = criarMetaMensalStore("teste:meta-3", 15000);
    store.definir(-500);
    expect(store.obter()).toBe(0);
  });

  it("chaves diferentes não se misturam", () => {
    const storeA = criarMetaMensalStore("teste:meta-4a", 1000);
    const storeB = criarMetaMensalStore("teste:meta-4b", 2000);
    storeA.definir(9999);
    expect(storeB.obter()).toBe(2000);
  });
});
