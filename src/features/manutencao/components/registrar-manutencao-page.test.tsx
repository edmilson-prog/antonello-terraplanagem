import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { toast } from "sonner";
import { RegistrarManutencaoPage } from "./registrar-manutencao-page";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function renderComRouter(registroId: string) {
  const rootRoute = createRootRoute({
    component: () => <RegistrarManutencaoPage registroId={registroId} />,
  });
  const router = createRouter({ routeTree: rootRoute });
  const utils = render(<RouterProvider router={router} />);
  // O RouterProvider resolve o match inicial de forma assíncrona, e
  // equipamentosStore depende do carregamento assíncrono da sessão Supabase
  // (fake em vitest.setup.ts) — esperar algo estável antes de asserções
  // síncronas evita queries contra um DOM ainda não assentado.
  await waitFor(() => expect(document.body.textContent).not.toBe(""));
  return utils;
}

describe("RegistrarManutencaoPage", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("mostra o formulário pré-preenchido com o horímetro atual do equipamento (rm-001, vencida)", async () => {
    await renderComRouter("rm-001");

    expect(
      await screen.findByRole("heading", { name: "Registrar manutenção" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D")).toBeInTheDocument();
    expect(screen.getByText("Troca de óleo e filtros do motor")).toBeInTheDocument();
    expect(screen.getByLabelText("Horímetro no momento *")).toHaveValue(8432);
  });

  it("confirma o registro e reinicia o ciclo do plano", async () => {
    await renderComRouter("rm-001");
    await screen.findByRole("heading", { name: "Registrar manutenção" });

    fireEvent.change(screen.getByLabelText("Custo (R$) — opcional"), {
      target: { value: "850" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar manutenção" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Manutenção registrada. O ciclo foi reiniciado.");
    });
  });

  it("mostra estado de 'nada para registrar' quando o alerta já foi resolvido", async () => {
    await renderComRouter("rm-002");

    expect(await screen.findByText("Nada para registrar aqui")).toBeInTheDocument();
  });

  it("mostra estado de 'nada para registrar' para um registro que não está vencido/próximo", async () => {
    await renderComRouter("rm-005");

    expect(await screen.findByText("Nada para registrar aqui")).toBeInTheDocument();
  });
});
