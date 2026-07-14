import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ServicosSection } from "./servicos-section";

describe("ServicosSection", () => {
  it("renderiza os 6 serviços com título e descrição", () => {
    render(<ServicosSection />);
    expect(screen.getByText("Terraplenagem")).toBeInTheDocument();
    expect(screen.getByText("Escavação e drenagem")).toBeInTheDocument();
    expect(screen.getByText("Fundações e estacas")).toBeInTheDocument();
    expect(screen.getByText("Nivelamento de pátios")).toBeInTheDocument();
    expect(screen.getByText("Abertura de acessos")).toBeInTheDocument();
    expect(screen.getByText("Limpeza de terreno")).toBeInTheDocument();
    expect(screen.getByText(/Corte, aterro e conformação de platôs/)).toBeInTheDocument();
  });
});
