import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ComponenteCustoForm } from "./componente-custo-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ComponenteCustoForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação calcula o impacto no custo/h ao vivo (base mensal)", () => {
    render(<ComponenteCustoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Descrição *"), {
      target: { value: "Parcela FINAME" },
    });
    // CurrencyInput interpreta os dígitos digitados como centavos (ver
    // features/precos/money.ts) — "420000" representa R$ 4.200,00.
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "420000" } });
    fireEvent.change(screen.getByLabelText("Horas/mês de referência"), {
      target: { value: "200" },
    });

    expect(screen.getByText("R$ 21,00")).toBeInTheDocument();
  });

  it("na criação calcula o impacto no custo/h ao vivo (variável por hora)", () => {
    render(<ComponenteCustoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    fireEvent.click(screen.getByLabelText("Base do valor *"));
    fireEvent.click(screen.getByRole("option", { name: "Variável por hora" }));

    fireEvent.change(screen.getByLabelText("Descrição *"), { target: { value: "Operador" } });
    // "3800" via CurrencyInput (centavos) => R$ 38,00 — nesse ramo o impacto é
    // o próprio valor, sem dividir por horas de referência.
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "3800" } });

    expect(screen.getByText("R$ 38,00")).toBeInTheDocument();
  });

  it("mostra R$ 0,00 (sem NaN/Infinity) quando horas de referência é zero", () => {
    render(<ComponenteCustoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Descrição *"), { target: { value: "Seguro" } });
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "38000" } });
    fireEvent.change(screen.getByLabelText("Horas/mês de referência"), {
      target: { value: "0" },
    });

    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <ComponenteCustoForm
        inicial={{
          id: "cc-teste",
          equipamento_id: "eq-001",
          descricao: "Componente Existente",
          tipo: "fixo_mensal",
          valor: 100,
          categoria: null,
          competencia: null,
          observacao: null,
          ativo: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Impacto no custo/h")).not.toBeInTheDocument();
  });

  it("cadastra o componente e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<ComponenteCustoForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.click(screen.getByLabelText("Equipamento *"));
    fireEvent.click(await screen.findAllByRole("option").then((opts) => opts[0]));
    fireEvent.change(screen.getByLabelText("Descrição *"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Componente cadastrado.");
  });
});
