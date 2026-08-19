import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ClienteForm } from "./cliente-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ClienteForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<ClienteForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo cliente")).toBeInTheDocument();
    expect(screen.getAllByText("a definir")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Nome / razão social *"), {
      target: { value: "Construtora Vale Verde" },
    });
    fireEvent.change(screen.getByLabelText("Telefone"), {
      target: { value: "44999990000" },
    });

    expect(screen.getByText("CONSTRUTORA VALE VERDE")).toBeInTheDocument();
    expect(screen.getByText("44999990000")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <ClienteForm
        inicial={{
          id: "cl-teste",
          nome: "Cliente Existente",
          documento: null,
          telefone: null,
          tipo_pessoa: null,
          ativo: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
          nome_fantasia: null,
          segmento: null,
          email: null,
          endereco: null,
          cidade: null,
          contato_nome: null,
          contato_papel: null,
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Novo cliente")).not.toBeInTheDocument();
  });

  it("cadastra o cliente e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<ClienteForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome / razão social *"), {
      target: { value: "Cliente Teste" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Cliente cadastrado.");
  });
});
