import { describe, it, expect } from "vitest";
import { registrosManutencao } from "./registros-manutencao";
import { equipamentos } from "./equipamentos";

describe("mocks/registros-manutencao", () => {
  it("tem 5 registros", () => {
    expect(registrosManutencao).toHaveLength(5);
  });

  it("rm-001 (eq-001) está vencido: horímetro atual passou do previsto", () => {
    const registro = registrosManutencao.find((r) => r.id === "rm-001")!;
    const equipamento = equipamentos.find((e) => e.id === registro.equipamento_id)!;
    expect(equipamento.horimetro_atual).toBeGreaterThan(registro.horimetro_previsto);
  });

  it("rm-003 (eq-002) está próximo: faltam 20h ou menos", () => {
    const registro = registrosManutencao.find((r) => r.id === "rm-003")!;
    const equipamento = equipamentos.find((e) => e.id === registro.equipamento_id)!;
    const faltam = registro.horimetro_previsto - equipamento.horimetro_atual;
    expect(faltam).toBeGreaterThan(0);
    expect(faltam).toBeLessThanOrEqual(20);
  });

  it("rm-005 (eq-006) está em dia: faltam mais de 20h", () => {
    const registro = registrosManutencao.find((r) => r.id === "rm-005")!;
    const equipamento = equipamentos.find((e) => e.id === registro.equipamento_id)!;
    const faltam = registro.horimetro_previsto - equipamento.horimetro_atual;
    expect(faltam).toBeGreaterThan(20);
  });

  it("rm-002 está realizado, recente e com custo registrado", () => {
    const registro = registrosManutencao.find((r) => r.id === "rm-002")!;
    expect(registro.status).toBe("realizada");
    expect(registro.horimetro_realizado).not.toBeNull();
    expect(registro.custo).toBeGreaterThan(0);
  });

  it("rm-004 está realizado sem custo registrado", () => {
    const registro = registrosManutencao.find((r) => r.id === "rm-004")!;
    expect(registro.status).toBe("realizada");
    expect(registro.custo).toBeNull();
  });

  it("apenas um registro 'prevista' por par plano/equipamento", () => {
    const chaves = registrosManutencao
      .filter((r) => r.status === "prevista")
      .map((r) => `${r.plano_id}:${r.equipamento_id}`);
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});
