import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { FinanceiroPage } from "@/features/financeiro/components/financeiro-page";

function renderComRouter() {
  const rootRoute = createRootRoute({ component: FinanceiroPage });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
}

describe("FinanceiroPage", () => {
  it("mostra os 4 KPIs, as duas colunas de contas e os cards novos, sem abas", async () => {
    renderComRouter();

    expect(await screen.findByText("A receber")).toBeInTheDocument();
    expect(screen.getByText("A pagar")).toBeInTheDocument();
    expect(screen.getByText("Recebido no mês")).toBeInTheDocument();
    expect(screen.getByText("Saldo do mês")).toBeInTheDocument();

    expect(screen.getByText("Contas a receber")).toBeInTheDocument();
    expect(screen.getByText("Contas a pagar")).toBeInTheDocument();
    expect(screen.getByText("Recebimentos por forma")).toBeInTheDocument();
    expect(screen.getByText("Comprovantes recentes")).toBeInTheDocument();
    expect(screen.getByText("Caixa")).toBeInTheDocument();

    // Não há mais TabsList com "A Receber"/"A Pagar"/"Caixa" como abas clicáveis
    expect(screen.queryByRole("tab", { name: "A Receber" })).not.toBeInTheDocument();
  });
});
