import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FrotaSection } from "./frota-section";

describe("FrotaSection", () => {
  it("renderiza as 3 máquinas de exemplo com status", () => {
    render(<FrotaSection />);
    expect(screen.getByText("Escavadeira CAT 320")).toBeInTheDocument();
    expect(screen.getByText("Retroescavadeira JCB 3CX")).toBeInTheDocument();
    expect(screen.getByText("Pá Carregadeira XCMG")).toBeInTheDocument();
    expect(screen.getAllByText("Disponível")).toHaveLength(2);
    expect(screen.getByText("Em uso")).toBeInTheDocument();
  });
});
