import { describe, it, expect } from "vitest";
import {
  agruparPorDia,
  diasComApontamento,
  finalizadosDoOperador,
  finalizadosNoDia,
  finalizadosNoMes,
  horasPorOS,
  horasPorSemana,
  somarHoras,
} from "./resumo-horas";
import type { Apontamento } from "@/shared/types";

// Datas locais: o teste monta o ISO a partir de um Date local para não depender
// do fuso da máquina que roda a suíte.
function isoLocal(ano: number, mes: number, dia: number, hora = 9): string {
  return new Date(ano, mes - 1, dia, hora, 0, 0).toISOString();
}

function apontamento(over: Partial<Apontamento> = {}): Apontamento {
  const base = isoLocal(2026, 7, 10);
  return {
    id: crypto.randomUUID(),
    equipamento_id: "eq-1",
    operador_id: "op-1",
    os_id: "os-1",
    horimetro_inicial: 100,
    horimetro_final: 108,
    horas_trabalhadas: 8,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade: "operada",
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: base,
    finalizado_em: base,
    created_at: base,
    updated_at: base,
    ...over,
  };
}

describe("finalizadosDoOperador", () => {
  it("ignora apontamentos de outro operador e os ainda em andamento", () => {
    const lista = [
      apontamento(),
      apontamento({ operador_id: "op-2" }),
      apontamento({ status: "em_andamento", horas_trabalhadas: null, finalizado_em: null }),
    ];
    expect(finalizadosDoOperador(lista, "op-1")).toHaveLength(1);
  });
});

describe("somarHoras", () => {
  it("soma com uma casa decimal", () => {
    const lista = [
      apontamento({ horas_trabalhadas: 7.5 }),
      apontamento({ horas_trabalhadas: 3.2 }),
    ];
    expect(somarHoras(lista)).toBe(10.7);
  });

  it("trata horas nulas como zero", () => {
    expect(somarHoras([apontamento({ horas_trabalhadas: null })])).toBe(0);
  });
});

describe("finalizadosNoDia", () => {
  it("usa o dia LOCAL do operador, não o UTC", () => {
    // 22h no horário local — em UTC-3 isso vira o dia seguinte em Z.
    const tarde = isoLocal(2026, 7, 10, 22);
    const lista = [apontamento({ finalizado_em: tarde, iniciado_em: tarde })];
    expect(finalizadosNoDia(lista, "op-1", new Date(2026, 6, 10))).toHaveLength(1);
    expect(finalizadosNoDia(lista, "op-1", new Date(2026, 6, 11))).toHaveLength(0);
  });
});

describe("finalizadosNoMes", () => {
  it("filtra pelo mês da data de referência", () => {
    const lista = [
      apontamento({ finalizado_em: isoLocal(2026, 7, 3) }),
      apontamento({ finalizado_em: isoLocal(2026, 8, 3) }),
    ];
    expect(finalizadosNoMes(lista, "op-1", new Date(2026, 6, 15))).toHaveLength(1);
  });
});

describe("agruparPorDia", () => {
  it("agrupa do dia mais recente para o mais antigo", () => {
    const lista = [
      apontamento({ finalizado_em: isoLocal(2026, 7, 8) }),
      apontamento({ finalizado_em: isoLocal(2026, 7, 10) }),
      apontamento({ finalizado_em: isoLocal(2026, 7, 10, 15) }),
    ];
    const grupos = agruparPorDia(lista);
    expect(grupos.map((g) => g.dia)).toEqual(["2026-07-10", "2026-07-08"]);
    expect(grupos[0]?.apontamentos).toHaveLength(2);
  });
});

describe("horasPorOS", () => {
  it("agrega por OS e ordena da maior para a menor", () => {
    const lista = [
      apontamento({ os_id: "os-a", horas_trabalhadas: 4 }),
      apontamento({ os_id: "os-b", horas_trabalhadas: 9 }),
      apontamento({ os_id: "os-a", horas_trabalhadas: 2 }),
    ];
    expect(horasPorOS(lista)).toEqual([
      { osId: "os-b", horas: 9 },
      { osId: "os-a", horas: 6 },
    ]);
  });

  it("mantém apontamentos sem OS em um grupo próprio", () => {
    const resultado = horasPorOS([apontamento({ os_id: null, horas_trabalhadas: 5 })]);
    expect(resultado).toEqual([{ osId: null, horas: 5 }]);
  });
});

describe("horasPorSemana", () => {
  it("agrupa pela segunda-feira da semana, em ordem crescente", () => {
    // 08/07/2026 é quarta; 13/07/2026 é segunda.
    const lista = [
      apontamento({ finalizado_em: isoLocal(2026, 7, 8), horas_trabalhadas: 3 }),
      apontamento({ finalizado_em: isoLocal(2026, 7, 10), horas_trabalhadas: 5 }),
      apontamento({ finalizado_em: isoLocal(2026, 7, 13), horas_trabalhadas: 8 }),
    ];
    expect(horasPorSemana(lista)).toEqual([
      { inicio: "2026-07-06", horas: 8 },
      { inicio: "2026-07-13", horas: 8 },
    ]);
  });
});

describe("diasComApontamento", () => {
  it("conta dias distintos", () => {
    const lista = [
      apontamento({ finalizado_em: isoLocal(2026, 7, 10) }),
      apontamento({ finalizado_em: isoLocal(2026, 7, 10, 16) }),
      apontamento({ finalizado_em: isoLocal(2026, 7, 11) }),
    ];
    expect(diasComApontamento(lista)).toBe(2);
  });
});
