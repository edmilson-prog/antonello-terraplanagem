import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ContaPagarForm } from "./conta-pagar-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ContaPagarForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<ContaPagarForm onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo pagamento")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Fornecedor / beneficiário *"), {
      target: { value: "Posto Missões" },
    });
    fireEvent.change(screen.getByLabelText("Documento"), { target: { value: "NF 5540" } });

    expect(screen.getByText("Posto Missões")).toBeInTheDocument();
    expect(screen.getByText("NF 5540")).toBeInTheDocument();
  });

  it("registra a conta e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<ContaPagarForm onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Descrição *"), {
      target: { value: "Abastecimento Julho" },
    });
    fireEvent.change(screen.getByLabelText("Fornecedor / beneficiário *"), {
      target: { value: "Posto Missões" },
    });
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "1500" } });
    fireEvent.change(screen.getByLabelText("Vencimento *"), {
      target: { value: "2026-08-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lançar pagamento" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Conta a pagar registrada.");
  });
});
