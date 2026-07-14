import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EsqueciSenhaDialog } from "./esqueci-senha-dialog";
import { supabase } from "@/lib/supabase";

describe("EsqueciSenhaDialog", () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockReset();
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as never);
  });

  it("envia o e-mail e mostra a confirmação", async () => {
    render(<EsqueciSenhaDialog aberto onOpenChange={() => {}} emailInicial="joao@antonello.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    await waitFor(() =>
      expect(
        screen.getByText(/Se esse e-mail estiver cadastrado, enviamos um link/),
      ).toBeInTheDocument(),
    );
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "joao@antonello.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/redefinir-senha") }),
    );
  });

  it("mostra erro inline quando a chamada falha", async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValueOnce(new Error("rede"));
    render(<EsqueciSenhaDialog aberto onOpenChange={() => {}} emailInicial="joao@antonello.com" />);

    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    await waitFor(() =>
      expect(
        screen.getByText("Não foi possível enviar o link agora. Tente novamente em instantes."),
      ).toBeInTheDocument(),
    );
  });

  it("pré-preenche o e-mail com emailInicial já na primeira abertura (não só a partir da segunda)", () => {
    const { rerender } = render(
      <EsqueciSenhaDialog aberto={false} onOpenChange={() => {}} emailInicial="" />,
    );

    // Usuário digita o e-mail no formulário de login e então abre o dialog pela
    // primeira vez: o componente já está montado (nunca desmontou), então o
    // useState inicial não roda de novo — precisa de um efeito para sincronizar.
    rerender(
      <EsqueciSenhaDialog
        aberto={true}
        onOpenChange={() => {}}
        emailInicial="novo@antonello.com"
      />,
    );

    expect(screen.getByLabelText("E-mail")).toHaveValue("novo@antonello.com");
  });
});
