import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { PrecoHoraMaquinaForm } from "@/features/precos/components/preco-hora-maquina-form";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import type { PrecoHoraMaquina } from "@/shared/types";

/*
 * Na Onda 20 o histórico de preços deixou de ser gravado por esta tela: quem
 * registra o snapshot anterior é o trigger `tg_registrar_historico_preco`, nas
 * três tabelas de preço.
 *
 * Isso muda o que faz sentido testar aqui. Antes o teste afirmava que o
 * formulário chamava `historicoPrecosStore.registrar()` — uma asserção sobre
 * fiação interna que, hoje, seria verdadeira e inútil (ou falsa e enganosa: a
 * tela poderia parar de registrar e o histórico continuaria certo). O que o
 * formulário ainda deve garantir é o que ele controla — salvar a edição e criar
 * o preço novo. A garantia do histórico é do banco, e é lá que ela é exercida.
 */

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

describe("PrecoHoraMaquinaForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
    vi.restoreAllMocks();
  });

  it("salva a edição no store, que é quem fala com o banco", async () => {
    const update = vi.spyOn(precoHoraMaquinaStore, "update").mockResolvedValue(undefined);

    render(<PrecoHoraMaquinaForm inicial={PRECO} onSuccess={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(update).toHaveBeenCalledWith(PRECO.id, expect.objectContaining({ ativo: true }));
  });

  it("cadastra um preço novo", async () => {
    const onSuccess = vi.fn();
    const create = vi
      .spyOn(precoHoraMaquinaStore, "create")
      .mockResolvedValue({ ...PRECO, id: "novo" });

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

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ valor_hora_seca: 280, valor_hora_operada: 360 }),
    );
  });
});
