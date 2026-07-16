import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RecebimentosPorFormaCard } from "@/features/financeiro/components/recebimentos-por-forma-card";

describe("RecebimentosPorFormaCard", () => {
  it("mostra estado vazio quando não há recebimentos", () => {
    render(<RecebimentosPorFormaCard itens={[]} />);
    expect(screen.getByText("Nenhum recebimento registrado ainda.")).toBeInTheDocument();
  });

  it("lista as formas com valor e quantidade", () => {
    render(
      <RecebimentosPorFormaCard
        itens={[
          { forma: "pix", valor: 38400, quantidade: 12 },
          { forma: "boleto", valor: 18700, quantidade: 7 },
        ]}
      />,
    );
    expect(screen.getByText("PIX")).toBeInTheDocument();
    expect(screen.getByText("R$ 38.400,00")).toBeInTheDocument();
    expect(screen.getByText("12 recebimentos")).toBeInTheDocument();
    expect(screen.getByText("Boleto")).toBeInTheDocument();
    expect(screen.getByText("7 recebimentos")).toBeInTheDocument();
  });

  it("usa singular para quantidade 1", () => {
    render(<RecebimentosPorFormaCard itens={[{ forma: "dinheiro", valor: 100, quantidade: 1 }]} />);
    expect(screen.getByText("1 recebimento")).toBeInTheDocument();
  });
});
