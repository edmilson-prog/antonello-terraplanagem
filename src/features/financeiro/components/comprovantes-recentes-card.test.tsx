import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComprovantesRecentesCard } from "@/features/financeiro/components/comprovantes-recentes-card";
import type { ContaReceber } from "@/shared/types";

const CONTA: ContaReceber = {
  id: "cr-004",
  faturamento_id: "fat-004", // existe em src/mocks/faturamentos.ts com numero "FAT-..."
  cliente_id: "cl-004",
  valor: 3500,
  vencimento: "2026-06-20",
  status: "liquidada",
  recebido_em: "2026-06-25",
  forma_recebimento: "pix",
  created_at: "2026-05-21T10:00:00.000Z",
  updated_at: "2026-06-25T14:00:00.000Z",
};

describe("ComprovantesRecentesCard", () => {
  it("mostra estado vazio quando não há itens", () => {
    render(<ComprovantesRecentesCard itens={[]} />);
    expect(screen.getByText("Nenhum comprovante recente.")).toBeInTheDocument();
  });

  it("lista um comprovante com forma, valor e data", () => {
    render(<ComprovantesRecentesCard itens={[CONTA]} />);
    expect(screen.getByText(/PIX recebido —/)).toBeInTheDocument();
    expect(screen.getByText("R$ 3.500,00")).toBeInTheDocument();
    expect(screen.getByText("25/06/2026")).toBeInTheDocument();
  });
});
