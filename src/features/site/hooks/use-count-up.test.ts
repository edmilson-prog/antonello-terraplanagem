import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useCountUp } from "./use-count-up";

describe("useCountUp", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("não anima enquanto ativo é false", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { result } = renderHook(() => useCountUp(100, false));
    expect(result.current).toBe(0);
  });

  it("anima até o valor alvo quando ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    let callback: FrameRequestCallback | null = null;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callback = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.spyOn(performance, "now").mockReturnValue(0);

    const { result } = renderHook(() => useCountUp(100, true));

    expect(callback).not.toBeNull();
    vi.spyOn(performance, "now").mockReturnValue(2000); // além da duração padrão (1500ms)
    act(() => {
      callback?.(2000);
    });

    expect(result.current).toBe(100);
  });

  it("aplica o valor final direto quando prefers-reduced-motion está ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { result } = renderHook(() => useCountUp(42, true));
    expect(result.current).toBe(42);
  });
});
