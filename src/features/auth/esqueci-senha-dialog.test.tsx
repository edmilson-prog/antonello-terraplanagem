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
});
