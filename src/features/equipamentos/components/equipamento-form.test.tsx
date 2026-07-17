import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { EquipamentoForm } from "./equipamento-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("EquipamentoForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<EquipamentoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo equipamento")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nome *"), {
      target: { value: "Escavadeira CAT 320" },
    });
    fireEvent.change(screen.getByLabelText("Capacidade *"), {
      target: { value: "18 toneladas" },
    });

    expect(screen.getByText("ESCAVADEIRA CAT 320")).toBeInTheDocument();
    expect(screen.getByText("18 toneladas")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <EquipamentoForm
        inicial={{
          id: "eq-teste",
          nome: "Equipamento Existente",
          tipo: "escavadeira",
          capacidade: "18t",
          horimetro_atual: 100,
          identificador: null,
          status: "disponivel",
          ativo: true,
          marca: null,
          ano: null,
          propriedade: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Novo equipamento")).not.toBeInTheDocument();
  });

  it("cadastra o equipamento e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<EquipamentoForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByLabelText("Capacidade *"), { target: { value: "10t" } });
    fireEvent.change(screen.getByLabelText("Marca / modelo *"), {
      target: { value: "Caterpillar 320" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Equipamento cadastrado.");
  });

  it("bloqueia o cadastro sem marca/modelo e mostra o erro", async () => {
    const onSuccess = vi.fn();
    render(<EquipamentoForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByLabelText("Capacidade *"), { target: { value: "10t" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(await screen.findByText("Informe a marca/modelo")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("na criação não mostra Status operacional, mas mostra na edição", () => {
    const { unmount } = render(
      <EquipamentoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />,
    );
    expect(screen.queryByText("Status operacional *")).not.toBeInTheDocument();
    unmount();

    render(
      <EquipamentoForm
        inicial={{
          id: "eq-teste",
          nome: "Equipamento Existente",
          tipo: "escavadeira",
          capacidade: "18t",
          horimetro_atual: 100,
          identificador: null,
          status: "disponivel",
          ativo: true,
          marca: null,
          ano: null,
          propriedade: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText("Status operacional *")).toBeInTheDocument();
  });
});
