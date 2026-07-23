import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { toast } from "sonner";
import { AbastecimentoForm } from "./abastecimento-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function renderComRouter(onCancel: () => void = () => {}) {
  const rootRoute = createRootRoute({
    component: () => <AbastecimentoForm onCancel={onCancel} />,
  });
  const router = createRouter({ routeTree: rootRoute });
  const utils = render(<RouterProvider router={router} />);
  await screen.findByText("Novo abastecimento");
  return utils;
}

function escolherEquipamento(nome: string) {
  fireEvent.click(screen.getByText("Selecione…"));
  fireEvent.click(screen.getByRole("option", { name: nome }));
}

describe("AbastecimentoForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("resumo ao vivo estima o custo a partir de litros × preço quando o custo total não é informado", async () => {
    await renderComRouter();

    fireEvent.change(screen.getByLabelText("Litros *"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Preço/litro (R$) — opcional"), {
      target: { value: "6" },
    });

    expect(await screen.findByText("R$ 600,00")).toBeInTheDocument();
    expect(screen.getByText("estimado: litros × preço/litro")).toBeInTheDocument();
  });

  it("custo total informado manualmente tem prioridade sobre a estimativa", async () => {
    await renderComRouter();

    fireEvent.change(screen.getByLabelText("Litros *"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Preço/litro (R$) — opcional"), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByLabelText("Custo total (R$) — opcional"), {
      target: { value: "550" },
    });

    expect(await screen.findByText("R$ 550,00")).toBeInTheDocument();
    expect(screen.queryByText("estimado: litros × preço/litro")).not.toBeInTheDocument();
  });

  it("registra o abastecimento com sucesso e navega de volta para Diesel", async () => {
    await renderComRouter();

    escolherEquipamento("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    fireEvent.change(screen.getByLabelText("Litros *"), { target: { value: "120" } });
    // eq-001 (CAT 320D) já tem abastecimento em horímetro 8520 no mock — precisa ser maior.
    fireEvent.change(screen.getByLabelText("Horímetro *"), { target: { value: "8600" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar abastecimento" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Abastecimento registrado.");
    });
  });

  it("bloqueia horímetro menor que o último abastecimento do equipamento", async () => {
    await renderComRouter();

    escolherEquipamento("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    fireEvent.change(screen.getByLabelText("Litros *"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Horímetro *"), { target: { value: "0" } });

    fireEvent.click(screen.getByRole("button", { name: "Registrar abastecimento" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "O horímetro não pode ser menor que o último abastecimento deste equipamento.",
      );
    });
  });
});
