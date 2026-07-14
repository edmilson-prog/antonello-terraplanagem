import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginPage } from "./login-page";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEY_LEMBRAR } from "@/lib/supabase-storage";

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    vi.mocked(supabase.auth.signInWithPassword).mockReset();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null },
      error: { message: "Credenciais inválidas" },
    } as never);
  });

  it("renderiza o rodapé de versão no painel de marca", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sistemas operacionais")).toBeInTheDocument();
    expect(screen.getByText("v0.21.0 · Ledger")).toBeInTheDocument();
  });

  it("alterna a visibilidade da senha", () => {
    render(<LoginPage />);
    const senha = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(senha.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha.type).toBe("text");
  });

  it("desmarcar 'Manter conectado' grava a preferência antes de submeter", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByLabelText("Manter conectado"));
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "joao@antonello.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY_LEMBRAR)).toBe("false"));
  });

  it("clique em 'Esqueci minha senha' abre o dialog", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
