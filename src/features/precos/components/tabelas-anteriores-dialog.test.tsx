import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { TabelasAnterioresDialog } from "@/features/precos/components/tabelas-anteriores-dialog";
import type {
  HistoricoPreco,
  PrecoHoraMaquina,
  PrecoFundacao,
  PrecoMobilizacao,
} from "@/shared/types";

const HORA_MAQUINA: PrecoHoraMaquina = {
  id: "phm-001",
  equipamento_id: "eq-001",
  tipo_equipamento: null,
  valor_hora_seca: 280,
  valor_hora_operada: 360,
  ativo: true,
  created_at: "2025-01-15T12:00:00.000Z",
  updated_at: "2026-03-10T09:00:00.000Z",
};

const FUNDACAO: PrecoFundacao = {
  id: "pf-001",
  diametro_broca_mm: 300,
  valor_metro: 90,
  descricao: "Estaca escavada Ø300mm",
  ativo: true,
  created_at: "2025-03-01T12:00:00.000Z",
  updated_at: "2026-01-20T12:00:00.000Z",
};

const MOBILIZACAO: PrecoMobilizacao = {
  id: "pm-001",
  descricao: "Mobilização escavadeira até 50km",
  valor: 850,
  ativo: true,
  created_at: "2025-04-01T12:00:00.000Z",
  updated_at: "2026-02-15T12:00:00.000Z",
};

/*
 * O histórico virou só-leitura na Onda 20: quem grava é o trigger no banco, não
 * a tela. Então o teste semeia a lista que o store expõe, em vez de chamar um
 * `registrar()` que não existe mais.
 */
function semear(...entradas: HistoricoPreco[]) {
  const lista = historicoPrecosStore.listar();
  lista.length = 0;
  lista.push(...entradas);
}

function entrada(
  tipo: HistoricoPreco["tipo"],
  snapshot: HistoricoPreco["snapshot"],
): HistoricoPreco {
  return {
    id: `hp-${tipo}`,
    tipo,
    preco_id: snapshot.id,
    snapshot,
    alterado_em: "2026-03-01T12:00:00.000Z",
  };
}

describe("TabelasAnterioresDialog", () => {
  beforeEach(() => {
    semear();
  });

  it("mostra estado vazio quando não há histórico", () => {
    render(<TabelasAnterioresDialog open onOpenChange={() => {}} />);
    expect(screen.getByText("Nenhuma alteração registrada")).toBeInTheDocument();
  });

  it("lista entradas de histórico dos 3 tipos", () => {
    semear(
      entrada("hora_maquina", HORA_MAQUINA),
      entrada("fundacao", FUNDACAO),
      entrada("mobilizacao", MOBILIZACAO),
    );
    render(<TabelasAnterioresDialog open onOpenChange={() => {}} />);

    expect(screen.getByText("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D")).toBeInTheDocument();
    expect(screen.getByText("Hora-Máquina")).toBeInTheDocument();

    expect(screen.getByText("Ø300mm")).toBeInTheDocument();
    expect(screen.getByText("Por Metro")).toBeInTheDocument();

    expect(screen.getByText("Mobilização escavadeira até 50km")).toBeInTheDocument();
    expect(screen.getByText("Mobilização")).toBeInTheDocument();
  });

  it("não renderiza o conteúdo quando open é false", () => {
    render(<TabelasAnterioresDialog open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("Tabelas anteriores")).not.toBeInTheDocument();
  });
});
