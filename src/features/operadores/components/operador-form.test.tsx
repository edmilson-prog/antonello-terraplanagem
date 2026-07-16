import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { OperadorForm } from "./operador-form";
import { operadoresStore } from "@/features/operadores/operadores-store";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("OperadorForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<OperadorForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo operador")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Adelar Machado" } });
    fireEvent.change(screen.getByLabelText("Base"), { target: { value: "Santo Ângelo — RS" } });

    expect(screen.getByText("ADELAR MACHADO")).toBeInTheDocument();
    expect(screen.getByText("Santo Ângelo — RS")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <OperadorForm
        inicial={{
          id: "op-teste",
          nome: "Operador Existente",
          telefone: null,
          cpf: "11111111111",
          ativo: true,
          vinculo: null,
          data_nascimento: null,
          cnh_categoria: null,
          cnh_validade: null,
          base: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Novo operador")).not.toBeInTheDocument();
  });

  it("cadastra o operador e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<OperadorForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Teste Operador" } });
    fireEvent.change(screen.getByLabelText("CPF *"), { target: { value: "52998224725" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Operador cadastrado.");
  });

  it("na edição envia só os campos originais (sem equipamentos_ids/vinculo/CNH/base)", async () => {
    const updateSpy = vi.spyOn(operadoresStore, "update").mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    render(
      <OperadorForm
        inicial={{
          id: "op-teste",
          nome: "Operador Existente",
          telefone: null,
          cpf: "52998224725",
          ativo: true,
          vinculo: null,
          data_nascimento: null,
          cnh_categoria: null,
          cnh_validade: null,
          base: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={onSuccess}
        onCancel={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText("Telefone"), {
      target: { value: "44999990000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updateSpy).toHaveBeenCalledTimes(1);
    const [id, payload] = updateSpy.mock.calls[0];
    expect(id).toBe("op-teste");
    expect(payload).toEqual({
      nome: "Operador Existente",
      cpf: "52998224725",
      telefone: "44999990000",
      ativo: true,
    });

    updateSpy.mockRestore();
  });
});
