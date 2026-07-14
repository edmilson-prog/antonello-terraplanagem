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

  it("no tema claro (padrão), painel de marca fica à esquerda e formulário à direita", () => {
    const { container } = render(<LoginPage />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("md:translate-x-0");
    expect(aside?.className).not.toContain("md:translate-x-full");
  });

  it("alternar para tema escuro troca os painéis de lado", () => {
    const { container } = render(<LoginPage />);
    const aside = container.querySelector("aside");

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(aside?.className).toContain("md:translate-x-full");
  });

  it("alternar o tema troca a logo do cabeçalho mobile", () => {
    render(<LoginPage />);
    const logos = screen.getAllByAltText("Antonello Terraplanagem") as HTMLImageElement[];
    const logoMobile = logos.find((img) => img.className.includes("md:hidden"));
    expect(logoMobile?.src).toContain("logo-antonello-branco.png");

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(logoMobile?.src).toContain("logo-antonello-preto.png");
  });

  it("anuncia a troca de tema para leitores de tela", () => {
    render(<LoginPage />);
    expect(screen.getByText("Tema alterado para claro")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(screen.getByText("Tema alterado para escuro")).toBeInTheDocument();
  });
});
