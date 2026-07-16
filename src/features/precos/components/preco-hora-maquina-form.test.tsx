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

  it("não registra histórico ao criar um preço novo", () => {
    render(<PrecoHoraMaquinaForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(historicoPrecosStore.listar()).toHaveLength(0);
  });
});
