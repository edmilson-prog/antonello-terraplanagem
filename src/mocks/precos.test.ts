import { describe, expect, it } from "vitest";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import { precosMobilizacao } from "@/mocks/precos-mobilizacao";
import { equipamentos } from "@/mocks/equipamentos";

describe("mocks de preço hora-máquina", () => {
  it("tem exatamente uma FK preenchida por registro", () => {
    for (const p of precosHoraMaquina) {
      const temEquip = p.equipamento_id !== null;
      const temTipo = p.tipo_equipamento !== null;
      expect(temEquip !== temTipo).toBe(true); // XOR
    }
  });
  it("referencia equipamentos existentes quando vinculado por equipamento", () => {
    const ids = new Set(equipamentos.map((e) => e.id));
    for (const p of precosHoraMaquina) {
      if (p.equipamento_id) expect(ids.has(p.equipamento_id)).toBe(true);
    }
  });
  it("tem valores seca e operada positivos", () => {
    for (const p of precosHoraMaquina) {
      expect(p.valor_hora_seca).toBeGreaterThan(0);
      expect(p.valor_hora_operada).toBeGreaterThan(0);
    }
  });
  it("inclui edge cases: ao menos 1 inativo, 1 por tipo, 1 com seca === operada", () => {
    expect(precosHoraMaquina.some((p) => !p.ativo)).toBe(true);
    expect(precosHoraMaquina.some((p) => p.tipo_equipamento !== null)).toBe(true);
    expect(
      precosHoraMaquina.some((p) => p.valor_hora_seca === p.valor_hora_operada),
    ).toBe(true);
  });
});

describe("mocks de preço fundação", () => {
  it("tem diâmetro e valor por metro positivos", () => {
    for (const p of precosFundacao) {
      expect(p.diametro_broca_mm).toBeGreaterThan(0);
      expect(p.valor_metro).toBeGreaterThan(0);
    }
  });
  it("inclui ao menos 1 inativo", () => {
    expect(precosFundacao.some((p) => !p.ativo)).toBe(true);
  });
});

describe("mocks de mobilização", () => {
  it("tem valor positivo e descrição não vazia", () => {
    for (const p of precosMobilizacao) {
      expect(p.valor).toBeGreaterThan(0);
      expect(p.descricao.trim().length).toBeGreaterThan(0);
    }
  });
});
