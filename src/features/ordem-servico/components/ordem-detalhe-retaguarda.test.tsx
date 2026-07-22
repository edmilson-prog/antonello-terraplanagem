import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { toast } from "sonner";
import { OrdemDetalheRetaguarda } from "./ordem-detalhe-retaguarda";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

function renderComRouter(ordemId: string) {
  const rootRoute = createRootRoute({
    component: () => <OrdemDetalheRetaguarda ordemId={ordemId} />,
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
}

describe("OrdemDetalheRetaguarda", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("OS aberta sem orçamento/faturamento vinculado: KPIs financeiros zerados, sem card de Faturamento", async () => {
    renderComRouter("os-001");

    expect(await screen.findByText("Valor previsto")).toBeInTheDocument();
    expect(screen.getByText("sem orçamento vinculado")).toBeInTheDocument();
    expect(screen.getByText("ainda não gerado")).toBeInTheDocument();
    expect(screen.queryByText("Faturamento")).not.toBeInTheDocument();

    // Histórico traz ao menos o evento de abertura da OS.
    expect(screen.getByText("OS aberta")).toBeInTheDocument();
  });

  it("OS fechada com faturamento vinculado: mostra o link do faturamento real", async () => {
    renderComRouter("os-003");

    expect(await screen.findByText(/Ver faturamento FAT-2026-0001/)).toBeInTheDocument();
    expect(screen.getByText("R$ 5.220,00")).toBeInTheDocument();
  });

  it("OS fechada com orçamento de origem mas sem faturamento: mostra valor previsto e botão de gerar", async () => {
    renderComRouter("os-010");

    expect(await screen.findByText("R$ 4.500,00")).toBeInTheDocument();
    // Aparece no quickfact do hero e no evento "aprovado" do Histórico.
    expect(screen.getAllByText("ORC-2026-0003").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Orçamento ORC-2026-0003 aprovado/)).toBeInTheDocument();

    const botaoGerar = screen.getByRole("button", { name: "Gerar faturamento" });
    fireEvent.click(botaoGerar);

    expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/^Rascunho FAT-/));
  });
});
