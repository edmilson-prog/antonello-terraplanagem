import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useRevealOnScroll } from "./use-reveal-on-scroll";

function Exemplo() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="alvo">
      {revelado ? "visivel" : "oculto"}
    </div>
  );
}

describe("useRevealOnScroll", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("revela imediatamente quando prefers-reduced-motion está ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    render(<Exemplo />);
    expect(screen.getByTestId("alvo")).toHaveTextContent("visivel");
  });

  it("revela quando o IntersectionObserver reporta interseção", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    let callback: IntersectionObserverCallback | null = null;
    class ObserverFalso {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", ObserverFalso);

    render(<Exemplo />);
    expect(screen.getByTestId("alvo")).toHaveTextContent("oculto");

    act(() => {
      callback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByTestId("alvo")).toHaveTextContent("visivel");
  });
});
