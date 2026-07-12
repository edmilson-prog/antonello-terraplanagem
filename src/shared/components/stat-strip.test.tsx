import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatStrip } from "./stat-strip";

describe("StatStrip", () => {
  it("renderiza rótulo, valor e rodapé de cada item", () => {
    render(
      <StatStrip
        itens={[
          { rotulo: "Itens", valor: "3", icone: "lucide:list", rodape: "no orçamento" },
          { rotulo: "Total", valor: "R$ 1.200,00", icone: "lucide:banknote", alerta: true },
        ]}
      />,
    );
    expect(screen.getByText("Itens")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("no orçamento")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.200,00")).toBeInTheDocument();
  });
});
