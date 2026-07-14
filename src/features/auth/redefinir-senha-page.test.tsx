import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedefinirSenhaPage } from "./redefinir-senha-page";
import { supabase } from "@/lib/supabase";

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("RedefinirSenhaPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(supabase.auth.getSession).mockReset();
    vi.mocked(supabase.auth.updateUser).mockReset();
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: {}, error: null } as never);
  });

  it("com sessão de recuperação válida, salva a nova senha e navega para /admin", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "x" } as never },
      error: null,
    });

    render(<RedefinirSenhaPage />);
    await screen.findByText("Definir nova senha");

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "senha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: "/admin" }));
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "senha123" });
  });

  it("sem sessão de recuperação, mostra o estado de link inválido", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<RedefinirSenhaPage />);

    await screen.findByText("Este link expirou ou já foi usado.");
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("bloqueia o envio quando as senhas não coincidem, sem chamar updateUser", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "x" } as never },
      error: null,
    });

    render(<RedefinirSenhaPage />);
    await screen.findByText("Definir nova senha");

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "outraSenha" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });
});
