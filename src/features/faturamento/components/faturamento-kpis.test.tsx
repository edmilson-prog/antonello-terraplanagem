import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FaturamentoKpis } from "./faturamento-kpis";

describe("FaturamentoKpis", () => {
  it("renderiza os 4 KPIs com os valores formatados", () => {
    render(
      <FaturamentoKpis
        faturadoNoMes={86200}
        nfsNoMes={12}
        aFaturarValor={26200}
        aFaturarRodape="2 rascunhos sem confirmar"
        ticketMedio={7183.33}
        seriesValor={[18, 16, 17, 12, 13, 9]}
        seriesQtd={[3, 2, 4, 1, 2, 12]}
      />,
    );
    expect(screen.getByText("Faturado no mês")).toBeInTheDocument();
    expect(screen.getByText("R$ 86.200,00")).toBeInTheDocument();
    expect(screen.getByText("NFs emitidas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("A faturar")).toBeInTheDocument();
    expect(screen.getByText("R$ 26.200,00")).toBeInTheDocument();
    expect(screen.getByText("2 rascunhos sem confirmar")).toBeInTheDocument();
    expect(screen.getByText("Ticket médio")).toBeInTheDocument();
    expect(screen.getByText("R$ 7.183,33")).toBeInTheDocument();
  });
});
