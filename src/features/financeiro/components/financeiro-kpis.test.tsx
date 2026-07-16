import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FinanceiroKpis } from "@/features/financeiro/components/financeiro-kpis";

describe("FinanceiroKpis", () => {
  it("renderiza os 4 tiles com os valores formatados em BRL", () => {
    render(
      <FinanceiroKpis
        aReceberValor={61900}
        aReceberRodape="5 títulos · 2 vencidos"
        aReceberAlerta
        aPagarValor={52350}
        aPagarRodape="3 títulos em aberto"
        recebidoNoMes={86200}
        recebidoRodape="↑ vs. mês anterior"
        seriesRecebido={[10, 20, 30, 40, 50, 60]}
        saldoDoMes={33850}
        seriesSaldo={[5, 10, 15, 20, 25, 30]}
      />,
    );
    expect(screen.getByText("A receber")).toBeInTheDocument();
    expect(screen.getByText("R$ 61.900,00")).toBeInTheDocument();
    expect(screen.getByText("5 títulos · 2 vencidos")).toBeInTheDocument();
    expect(screen.getByText("A pagar")).toBeInTheDocument();
    expect(screen.getByText("R$ 52.350,00")).toBeInTheDocument();
    expect(screen.getByText("Recebido no mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 86.200,00")).toBeInTheDocument();
    expect(screen.getByText("Saldo do mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 33.850,00")).toBeInTheDocument();
  });
});
