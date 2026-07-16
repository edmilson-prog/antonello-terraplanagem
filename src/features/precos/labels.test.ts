import { describe, it, expect } from "vitest";
import {
  margemPercentual,
  MARGEM_MINIMA_PADRAO,
  descreverHistorico,
  TIPO_HISTORICO_LABEL,
} from "@/features/precos/labels";
import { equipamentos } from "@/mocks/equipamentos";
import { formatBRL } from "@/features/retaguarda/format";
import type { HistoricoPreco, PrecoHoraMaquina, PrecoFundacao, PrecoMobilizacao } from "@/shared/types";

describe("margemPercentual", () => {
  it("calcula a margem percentual entre preço e custo de referência", () => {
    expect(margemPercentual(360, 71.25)).toBeCloseTo(0.8021, 4);
  });

  it("retorna negativo quando o custo supera o preço", () => {
    expect(margemPercentual(100, 150)).toBeCloseTo(-0.5, 4);
  });
});

describe("MARGEM_MINIMA_PADRAO", () => {
  it("é 30%", () => {
    expect(MARGEM_MINIMA_PADRAO).toBe(0.3);
  });
});

describe("TIPO_HISTORICO_LABEL", () => {
  it("cobre os 3 tipos", () => {
    expect(TIPO_HISTORICO_LABEL.hora_maquina).toBe("Hora-Máquina");
    expect(TIPO_HISTORICO_LABEL.fundacao).toBe("Por Metro");
    expect(TIPO_HISTORICO_LABEL.mobilizacao).toBe("Mobilização");
  });
});

describe("descreverHistorico", () => {
  it("descreve um snapshot de hora-máquina, resolvendo o nome do equipamento", () => {
    const snap: PrecoHoraMaquina = {
      id: "phm-001",
      equipamento_id: "eq-001",
      tipo_equipamento: null,
      valor_hora_seca: 280,
      valor_hora_operada: 360,
      ativo: true,
      created_at: "2025-01-15T12:00:00.000Z",
      updated_at: "2026-03-10T09:00:00.000Z",
    };
    const entrada: HistoricoPreco = {
      id: "h1",
      tipo: "hora_maquina",
      preco_id: "phm-001",
      snapshot: snap,
      alterado_em: "2026-07-01T10:00:00.000Z",
    };
    const { titulo, detalhe } = descreverHistorico(entrada, equipamentos);
    expect(titulo).toBe("ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D");
    expect(detalhe).toContain(formatBRL(280));
    expect(detalhe).toContain(formatBRL(360));
  });

  it("descreve um snapshot por metro (fundação)", () => {
    const snap: PrecoFundacao = {
      id: "pf-001",
      diametro_broca_mm: 300,
      valor_metro: 90,
      descricao: "Estaca escavada Ø300mm",
      ativo: true,
      created_at: "2025-03-01T12:00:00.000Z",
      updated_at: "2026-01-20T12:00:00.000Z",
    };
    const entrada: HistoricoPreco = {
      id: "h2",
      tipo: "fundacao",
      preco_id: "pf-001",
      snapshot: snap,
      alterado_em: "2026-07-01T10:00:00.000Z",
    };
    const { titulo, detalhe } = descreverHistorico(entrada, []);
    expect(titulo).toBe("Ø300mm");
    expect(detalhe).toContain("Estaca escavada Ø300mm");
  });

  it("descreve um snapshot de mobilização", () => {
    const snap: PrecoMobilizacao = {
      id: "pm-001",
      descricao: "Mobilização escavadeira até 50km",
      valor: 850,
      ativo: true,
      created_at: "2025-04-01T12:00:00.000Z",
      updated_at: "2026-02-15T12:00:00.000Z",
    };
    const entrada: HistoricoPreco = {
      id: "h3",
      tipo: "mobilizacao",
      preco_id: "pm-001",
      snapshot: snap,
      alterado_em: "2026-07-01T10:00:00.000Z",
    };
    const { titulo, detalhe } = descreverHistorico(entrada, []);
    expect(titulo).toBe("Mobilização escavadeira até 50km");
    expect(detalhe).toContain(formatBRL(850));
  });
});
