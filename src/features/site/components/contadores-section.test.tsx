import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ContadoresSection } from "./contadores-section";

describe("ContadoresSection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chega ao valor final de cada contador quando prefers-reduced-motion está ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { container } = render(<ContadoresSection />);

    expect(screen.getByText("Anos de estrada")).toBeInTheDocument();
    expect(screen.getByText("Equipamentos próprios")).toBeInTheDocument();
    expect(screen.getByText("Obras entregues")).toBeInTheDocument();
    expect(screen.getByText("Operadas por ano")).toBeInTheDocument();
    expect(container.textContent).toContain("20+");
    expect(container.textContent).toContain("180+");
    expect(container.textContent).toContain("2.140h");
  });
});
