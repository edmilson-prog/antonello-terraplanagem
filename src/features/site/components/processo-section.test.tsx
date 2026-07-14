import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProcessoSection } from "./processo-section";

describe("ProcessoSection", () => {
  it("renderiza os 4 passos numerados", () => {
    render(<ProcessoSection />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Visita e orçamento")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("OS aberta e planejada")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Execução apontada")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("Medição e NF")).toBeInTheDocument();
  });
});
