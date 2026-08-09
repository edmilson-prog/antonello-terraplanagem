import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useColumnWidths, LARGURA_MINIMA_COLUNA } from "./use-column-widths";

const STORAGE_KEY = "antonello.colunas.lista-teste";

describe("useColumnWidths", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("só persiste ao chamar persistir e recarrega o valor salvo", () => {
    const { result } = renderHook(() => useColumnWidths("lista-teste"));

    act(() => result.current.definir("Cliente", 260));
    expect(result.current.ajustes).toEqual({ Cliente: 260 });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();

    act(() => result.current.persistir());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ Cliente: 260 }));

    const recarregado = renderHook(() => useColumnWidths("lista-teste"));
    expect(recarregado.result.current.ajustes).toEqual({ Cliente: 260 });
    expect(recarregado.result.current.temAjustes).toBe(true);
  });

  it("aplica a largura mínima", () => {
    const { result } = renderHook(() => useColumnWidths("lista-teste"));
    act(() => result.current.definir("Obra", 10));
    expect(result.current.ajustes.Obra).toBe(LARGURA_MINIMA_COLUNA);
  });

  it("limpa uma coluna ou todas, persistindo na hora", () => {
    const { result } = renderHook(() => useColumnWidths("lista-teste"));

    act(() => {
      result.current.definir("Cliente", 200);
      result.current.definir("Obra", 300);
      result.current.persistir();
    });

    act(() => result.current.limpar("Obra"));
    expect(result.current.ajustes).toEqual({ Cliente: 200 });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ Cliente: 200 }));

    act(() => result.current.limpar());
    expect(result.current.temAjustes).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignora conteúdo inválido no localStorage", () => {
    window.localStorage.setItem(STORAGE_KEY, '{"Cliente":"larga","Obra":10,"OS":180}');
    const { result } = renderHook(() => useColumnWidths("lista-teste"));
    expect(result.current.ajustes).toEqual({ OS: 180 });
  });

  it("sem storageKey mantém o ajuste só em memória", () => {
    const { result } = renderHook(() => useColumnWidths());
    act(() => {
      result.current.definir("OS", 140);
      result.current.persistir();
    });
    expect(result.current.ajustes).toEqual({ OS: 140 });
    expect(window.localStorage.length).toBe(0);
  });
});
