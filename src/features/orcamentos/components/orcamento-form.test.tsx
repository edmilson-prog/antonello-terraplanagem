import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { toast } from "sonner";
import { OrcamentoForm } from "./orcamento-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

async function renderComRouter(onCancel: () => void = () => {}) {
  const rootRoute = createRootRoute({
    component: () => <OrcamentoForm onCancel={onCancel} />,
  });
  const router = createRouter({ routeTree: rootRoute });
  const utils = render(<RouterProvider router={router} />);
  // O RouterProvider resolve o match inicial de forma assíncrona (Transitioner) —
  // esperar algo estável antes de interagir evita queries síncronas contra um
  // DOM ainda não assentado.
  await screen.findByText("Nova proposta");
  return utils;
}

// Escolhe o equipamento no <select> "Item" do bloco Adicionar item. Radix
// também mantém um <select> nativo oculto com as mesmas opções (semântica de
// formulário) — por isso a busca pelo texto do equipamento precisa ficar
// restrita ao combobox visível, não a "getByText" solto.
function escolherEquipamentoNoItem(nomeEquipamento: string) {
  fireEvent.click(screen.getByText("Selecione"));
  fireEvent.click(screen.getByRole("option", { name: nomeEquipamento }));
}

describe("OrcamentoForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("começa sem itens, com o resumo ao vivo zerado", async () => {
    await renderComRouter();

    expect(screen.getByText("0 itens")).toBeInTheDocument();
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
    expect(screen.getByText(/Nenhum item ainda/)).toBeInTheDocument();
  });

  it("adiciona um item de hora-máquina do catálogo real e atualiza o resumo ao vivo", async () => {
    await renderComRouter();

    // Tipo já é "Hora-máquina" por padrão — só falta escolher o equipamento.
    escolherEquipamentoNoItem("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(
      await screen.findByText("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D — 1 h operada (estimado)"),
    ).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
    // eq-001 tem preço ativo (phm-001): 1h × R$ 360,00 (operada, padrão) —
    // aparece tanto no total da linha quanto no total da proposta (só 1 item).
    expect(screen.getAllByText("R$ 360,00")).toHaveLength(2);
  });

  it("remove um item e o resumo volta a zero", async () => {
    await renderComRouter();

    escolherEquipamentoNoItem("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(await screen.findByText("1 item")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remover item" }));

    expect(await screen.findByText("0 itens")).toBeInTheDocument();
    expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
    expect(screen.getByText(/Nenhum item ainda/)).toBeInTheDocument();
  });

  it("cria o orçamento com os itens adicionados na criação", async () => {
    await renderComRouter();

    fireEvent.change(screen.getByLabelText("Obra *"), {
      target: { value: "Terraplenagem — fase 2" },
    });
    fireEvent.click(screen.getByLabelText("Cliente *"));
    fireEvent.click(screen.getAllByRole("option")[0]);

    escolherEquipamentoNoItem("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(await screen.findByText("1 item")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Criar orçamento" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/^Orçamento criado/));
    });
  });
});
