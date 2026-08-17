import { describe, it, expect } from "vitest";
import {
  calcularStatusManutencao,
  planosParaEquipamento,
  statusPlano,
  statusEquipamento,
  alertasManutencao,
  resumoProximaManutencao,
} from "./derivacoes";
import type { Equipamento, PlanoManutencao, RegistroManutencao } from "@/shared/types";

describe("calcularStatusManutencao", () => {
  it("RF-004: previsto 1250, atual 1245, antecedência 20 → próxima (faltam 5h)", () => {
    expect(calcularStatusManutencao(1245, 1250, 20)).toBe("proxima");
  });

  it("atual igual ao previsto → vencida (faltam 0h)", () => {
    expect(calcularStatusManutencao(1250, 1250, 20)).toBe("vencida");
  });

  it("atual maior que o previsto → vencida", () => {
    expect(calcularStatusManutencao(1300, 1250, 20)).toBe("vencida");
  });

  it("faltam exatamente a antecedência → próxima (limite inclusivo)", () => {
    expect(calcularStatusManutencao(1230, 1250, 20)).toBe("proxima");
  });

  it("faltam mais que a antecedência → em dia", () => {
    expect(calcularStatusManutencao(1229, 1250, 20)).toBe("em_dia");
  });

  it("usa antecedência padrão de 20h quando omitida", () => {
    expect(calcularStatusManutencao(1230, 1250)).toBe("proxima");
    expect(calcularStatusManutencao(1229, 1250)).toBe("em_dia");
  });
});

function equipamento(overrides: Partial<Equipamento> = {}): Equipamento {
  return {
    id: "eq-x",
    nome: "Equipamento X",
    tipo: "escavadeira",
    capacidade: "10t",
    horimetro_atual: 1000,
    identificador: null,
    status: "disponivel",
    ativo: true,
    marca: null,
    ano: null,
    propriedade: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function plano(overrides: Partial<PlanoManutencao> = {}): PlanoManutencao {
  return {
    id: "pm-x",
    equipamento_id: "eq-x",
    tipo_equipamento: null,
    descricao: "Plano X",
    intervalo_horas: 250,
    ativo: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function registro(overrides: Partial<RegistroManutencao> = {}): RegistroManutencao {
  return {
    id: "rm-x",
    equipamento_id: "eq-x",
    plano_id: "pm-x",
    tipo: "preventiva",
    descricao: null,
    prioridade: "media",
    horimetro_previsto: 1250,
    horimetro_realizado: null,
    horimetro_abertura: null,
    status: "prevista",
    custo: null,
    fornecedor: null,
    observacao: null,
    realizada_em: null,
    aberta_em: "2026-01-01T00:00:00.000Z",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("planosParaEquipamento", () => {
  it("inclui plano vinculado diretamente pelo equipamento_id", () => {
    const e = equipamento({ id: "eq-1" });
    const p = plano({ equipamento_id: "eq-1", tipo_equipamento: null });
    expect(planosParaEquipamento(e, [p])).toEqual([p]);
  });

  it("inclui plano vinculado pelo tipo_equipamento", () => {
    const e = equipamento({ id: "eq-1", tipo: "trator_esteira" });
    const p = plano({ equipamento_id: null, tipo_equipamento: "trator_esteira" });
    expect(planosParaEquipamento(e, [p])).toEqual([p]);
  });

  it("ignora plano inativo", () => {
    const e = equipamento({ id: "eq-1" });
    const p = plano({ equipamento_id: "eq-1", ativo: false });
    expect(planosParaEquipamento(e, [p])).toEqual([]);
  });

  it("ignora plano de outro equipamento/tipo", () => {
    const e = equipamento({ id: "eq-1", tipo: "escavadeira" });
    const p = plano({ equipamento_id: "eq-2", tipo_equipamento: "carregadeira" });
    expect(planosParaEquipamento(e, [p])).toEqual([]);
  });
});

describe("statusPlano", () => {
  it("retorna null quando não há registro 'prevista' para o par plano/equipamento", () => {
    const e = equipamento();
    const p = plano();
    expect(statusPlano(p, e, [])).toBeNull();
  });

  it("retorna o status e o registro quando há registro 'prevista'", () => {
    const e = equipamento({ horimetro_atual: 1245 });
    const p = plano();
    const r = registro({ horimetro_previsto: 1250 });
    const resultado = statusPlano(p, e, [r]);
    expect(resultado?.status).toBe("proxima");
    expect(resultado?.registro).toBe(r);
  });
});

describe("statusEquipamento", () => {
  it("retorna null quando o equipamento não tem plano aplicável", () => {
    const e = equipamento({ id: "eq-1" });
    expect(statusEquipamento(e, [], [])).toBeNull();
  });

  it("retorna null quando há plano aplicável mas sem registro 'prevista'", () => {
    const e = equipamento({ id: "eq-1" });
    const p = plano({ id: "pm-1", equipamento_id: "eq-1" });
    expect(statusEquipamento(e, [p], [])).toBeNull();
  });

  it("retorna o pior status entre múltiplos planos aplicáveis", () => {
    const e = equipamento({ id: "eq-1", horimetro_atual: 1000 });
    const p1 = plano({ id: "pm-1", equipamento_id: "eq-1" });
    const p2 = plano({ id: "pm-2", equipamento_id: "eq-1" });
    const r1 = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 2000,
    }); // em_dia
    const r2 = registro({
      id: "rm-2",
      plano_id: "pm-2",
      equipamento_id: "eq-1",
      horimetro_previsto: 990,
    }); // vencida
    expect(statusEquipamento(e, [p1, p2], [r1, r2])).toBe("vencida");
  });
});

describe("alertasManutencao", () => {
  it("gera um item por (equipamento, plano) em próxima/vencida e ignora em dia", () => {
    const e1 = equipamento({ id: "eq-1", horimetro_atual: 1245 }); // proxima
    const e2 = equipamento({ id: "eq-2", horimetro_atual: 100 }); // em dia
    const p1 = plano({ id: "pm-1", equipamento_id: "eq-1" });
    const p2 = plano({ id: "pm-2", equipamento_id: "eq-2" });
    const r1 = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 1250,
    });
    const r2 = registro({
      id: "rm-2",
      plano_id: "pm-2",
      equipamento_id: "eq-2",
      horimetro_previsto: 2000,
    });
    const alertas = alertasManutencao([e1, e2], [p1, p2], [r1, r2]);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].equipamento.id).toBe("eq-1");
    expect(alertas[0].status).toBe("proxima");
  });

  it("ignora equipamento inativo", () => {
    const e = equipamento({ id: "eq-1", ativo: false, horimetro_atual: 9999 });
    const p = plano({ id: "pm-1", equipamento_id: "eq-1" });
    const r = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 100,
    });
    expect(alertasManutencao([e], [p], [r])).toEqual([]);
  });

  it("ordena vencida antes de próxima", () => {
    const e1 = equipamento({ id: "eq-1", horimetro_atual: 1245 }); // proxima
    const e2 = equipamento({ id: "eq-2", horimetro_atual: 1300 }); // vencida
    const p1 = plano({ id: "pm-1", equipamento_id: "eq-1" });
    const p2 = plano({ id: "pm-2", equipamento_id: "eq-2" });
    const r1 = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 1250,
    });
    const r2 = registro({
      id: "rm-2",
      plano_id: "pm-2",
      equipamento_id: "eq-2",
      horimetro_previsto: 1250,
    });
    const alertas = alertasManutencao([e1, e2], [p1, p2], [r1, r2]);
    expect(alertas.map((a) => a.status)).toEqual(["vencida", "proxima"]);
  });
});

describe("resumoProximaManutencao", () => {
  it("retorna null quando não há plano aplicável", () => {
    const e = equipamento({ id: "eq-1" });
    expect(resumoProximaManutencao(e, [], [])).toBeNull();
  });

  it("retorna null quando há plano mas sem registro 'prevista'", () => {
    const e = equipamento({ id: "eq-1" });
    const p = plano({ id: "pm-1", equipamento_id: "eq-1" });
    expect(resumoProximaManutencao(e, [p], [])).toBeNull();
  });

  it("retorna o plano mais urgente (menor horas restantes) entre vários aplicáveis", () => {
    const e = equipamento({ id: "eq-1", horimetro_atual: 1000 });
    const p1 = plano({
      id: "pm-1",
      equipamento_id: "eq-1",
      intervalo_horas: 250,
      descricao: "Troca de óleo",
    });
    const p2 = plano({
      id: "pm-2",
      equipamento_id: "eq-1",
      intervalo_horas: 500,
      descricao: "Revisão geral",
    });
    const r1 = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 1100,
    }); // faltam 100
    const r2 = registro({
      id: "rm-2",
      plano_id: "pm-2",
      equipamento_id: "eq-1",
      horimetro_previsto: 1050,
    }); // faltam 50 — mais urgente
    const resumo = resumoProximaManutencao(e, [p1, p2], [r1, r2]);
    expect(resumo?.descricao).toBe("Revisão geral");
    expect(resumo?.intervalo).toBe(500);
    expect(resumo?.previsto).toBe(1050);
    expect(resumo?.restantes).toBe(50);
    // 50h restantes > ANTECEDENCIA_HORAS_PADRAO (20h) → em_dia, não "proxima".
    expect(resumo?.status).toBe("em_dia");
  });

  it("status 'vencida' quando as horas restantes são <= 0", () => {
    const e = equipamento({ id: "eq-1", horimetro_atual: 1300 });
    const p = plano({ id: "pm-1", equipamento_id: "eq-1" });
    const r = registro({
      id: "rm-1",
      plano_id: "pm-1",
      equipamento_id: "eq-1",
      horimetro_previsto: 1250,
    });
    const resumo = resumoProximaManutencao(e, [p], [r]);
    expect(resumo?.status).toBe("vencida");
    expect(resumo?.restantes).toBe(-50);
  });
});
