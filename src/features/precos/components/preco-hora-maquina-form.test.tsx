import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { PrecoHoraMaquinaForm } from "@/features/precos/components/preco-hora-maquina-form";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import type { PrecoHoraMaquina } from "@/shared/types";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const PRECO: PrecoHoraMaquina = {
  id: "phm-001",
  equipamento_id: "eq-001",
  tipo_equipamento: null,
  valor_hora_seca: 280,
  valor_hora_operada: 360,
  ativo: true,
  created_at: "2025-01-15T12:00:00.000Z",
  updated_at: "2026-03-10T09:00:00.000Z",
};

describe("PrecoHoraMaquinaForm — histórico", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    historicoPrecosStore.listar().length = 0;
  });

  it("registra o snapshot anterior no histórico ao salvar uma edição", async () => {
    render(<PrecoHoraMaquinaForm inicial={PRECO} onSuccess={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    // handleSubmit (zodResolver) valida assincronamente — aguarda o efeito
    // colateral síncrono do onSubmit (toast) antes de checar o histórico.
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const itens = historicoPrecosStore.listar();
    expect(itens).toHaveLength(1);
    expect(itens[0].tipo).toBe("hora_maquina");
    expect(itens[0].snapshot).toEqual(PRECO);
  });

  it("não registra histórico ao criar um preço novo", async () => {
    const onSuccess = vi.fn();
    render(<PrecoHoraMaquinaForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.click(screen.getByLabelText("Equipamento *"));
    fireEvent.click(await screen.findAllByRole("option").then((opts) => opts[0]));
    // CurrencyInput interpreta os dígitos digitados como centavos (ver
    // features/precos/money.ts) — "28000" vira R$ 280,00, "36000" vira R$ 360,00.
    fireEvent.change(screen.getByLabelText("Valor hora seca *"), { target: { value: "28000" } });
    fireEvent.change(screen.getByLabelText("Valor hora operada *"), {
      target: { value: "36000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    // Confirma que o submit de fato aconteceu (senão a asserção abaixo não
    // prova nada — a validação teria bloqueado o onSubmit antes de qualquer
    // registro no histórico).
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(historicoPrecosStore.listar()).toHaveLength(0);
  });
});
