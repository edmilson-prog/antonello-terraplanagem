import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useColumnVisibility } from "./use-column-visibility";

const STORAGE_KEY = "antonello.colunas-ocultas.lista-teste";

describe("useColumnVisibility", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("alterna a coluna e persiste na hora", () => {
    const { result } = renderHook(() => useColumnVisibility("lista-teste"));

    act(() => result.current.alternar("Valor"));
    expect(result.current.ocultas).toEqual(["Valor"]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["Valor"]));

    act(() => result.current.alternar("Valor"));
    expect(result.current.ocultas).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("recarrega o que estava guardado e mostra todas de uma vez", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["Valor", "Período"]));
    const { result } = renderHook(() => useColumnVisibility("lista-teste"));
    expect(result.current.ocultas).toEqual(["Valor", "Período"]);

    act(() => result.current.mostrarTodas());
    expect(result.current.ocultas).toEqual([]);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignora conteúdo inválido no localStorage", () => {
    window.localStorage.setItem(STORAGE_KEY, '{"nao":"é uma lista"}');
    const { result } = renderHook(() => useColumnVisibility("lista-teste"));
    expect(result.current.ocultas).toEqual([]);
  });

  it("sem storageKey mantém a escolha só em memória", () => {
    const { result } = renderHook(() => useColumnVisibility());
    act(() => result.current.alternar("Valor"));
    expect(result.current.ocultas).toEqual(["Valor"]);
    expect(window.localStorage.length).toBe(0);
  });
});
