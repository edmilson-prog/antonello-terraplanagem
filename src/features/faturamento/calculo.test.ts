import { describe, it, expect } from "vitest";
import {
  round2,
  valorItem,
  precoHoraDoEquipamento,
  precoFundacaoDoDiametro,
  gerarItens,
  aplicarHoraTipo,
  calcularValorTotal,
  temPendencia,
} from "@/features/faturamento/calculo";
import { equipamentos } from "@/mocks/equipamentos";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import type { Apontamento, OrdemServico } from "@/shared/types";

const eq = (id: string) => {
  const e = equipamentos.find((x) => x.id === id);
  if (!e) throw new Error(`equipamento ${id} ausente no mock`);
  return e;
};

function apontamentoFinalizado(
  id: string,
  equipamento_id: string,
  os_id: string,
  horas: number,
  modalidade: "seca" | "operada" | null = "operada",
): Apontamento {
  return {
    id,
    equipamento_id,
    operador_id: "op-001",
    os_id,
    horimetro_inicial: 1000,
    horimetro_final: 1000 + horas,
    horas_trabalhadas: horas,
    foto_inicial_url: null,
    foto_final_url: null,
    observacao: null,
    modalidade,
    metros_executados: null,
    status: "finalizado",
    pendente_sync: false,
    iniciado_em: "2026-06-20T07:00:00.000Z",
    finalizado_em: "2026-06-20T17:00:00.000Z",
    created_at: "2026-06-20T07:00:00.000Z",
    updated_at: "2026-06-20T17:00:00.000Z",
  };
}

function apontamentoComMetros(id: string, os_id: string, metros: number): Apontamento {
  return { ...apontamentoFinalizado(id, "eq-001", os_id, 0, null), metros_executados: metros };
}

function osHora(id: string): OrdemServico {
  return {
    id,
    numero: "OS-2026-9001",
    cliente_id: "cl-001",
    obra_nome: "Obra teste",
    endereco: null,
    modelo_cobranca: "hora_maquina",
    status: "fechada",
    responsavel_id: "op-001",
    observacao: null,
    diametro_broca_mm: null,
    aberta_em: "2026-06-20T07:00:00.000Z",
    fechada_em: "2026-06-20T17:00:00.000Z",
    pendente_sync: false,
    created_at: "2026-06-20T07:00:00.000Z",
    updated_at: "2026-06-20T17:00:00.000Z",
  };
}

function osMetro(id: string, diametro: number | null): OrdemServico {
  return { ...osHora(id), modelo_cobranca: "por_metro", diametro_broca_mm: diametro };
}

describe("calculo de faturamento", () => {
  it("round2 e valorItem fazem aritmética exata em 2 casas", () => {
    expect(round2(8.5 * 360)).toBe(3060);
    expect(valorItem(8.5, 360)).toBe(3060);
    expect(valorItem(6.5, 90)).toBe(585);
  });

  it("precoHoraDoEquipamento prioriza equipamento, cai p/ tipo, ignora inativo", () => {
    expect(precoHoraDoEquipamento(eq("eq-001"), precosHoraMaquina)?.id).toBe("phm-001");
    expect(precoHoraDoEquipamento(eq("eq-004"), precosHoraMaquina)?.id).toBe("phm-003"); // por tipo
    expect(precoHoraDoEquipamento(eq("eq-005"), precosHoraMaquina)).toBeNull(); // phm-005 inativo
    expect(precoHoraDoEquipamento(eq("eq-003"), precosHoraMaquina)).toBeNull(); // sem preço
  });

  it("precoFundacaoDoDiametro busca ativo por diâmetro", () => {
    expect(precoFundacaoDoDiametro(300, precosFundacao)?.id).toBe("pf-001");
    expect(precoFundacaoDoDiametro(500, precosFundacao)).toBeNull(); // pf-003 inativo
    expect(precoFundacaoDoDiametro(null, precosFundacao)).toBeNull();
  });

  it("gerarItens agrupa horas por equipamento e aplica operada", () => {
    const os = osHora("os-x");
    const aps = [
      apontamentoFinalizado("a1", "eq-001", "os-x", 12),
      apontamentoFinalizado("a2", "eq-002", "os-x", 10),
    ];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(2);
    expect(itens[0]).toMatchObject({ origem_id: "eq-001", hora_tipo: "operada", quantidade: 12, valor_unitario: 360, valor_total: 4320, sem_preco: false });
    expect(itens[1]).toMatchObject({ origem_id: "eq-002", quantidade: 10, valor_unitario: 290, valor_total: 2900 });
  });

  it("gerarItens soma múltiplos apontamentos do mesmo equipamento", () => {
    const os = osHora("os-y");
    const aps = [
      apontamentoFinalizado("a1", "eq-001", "os-y", 5),
      apontamentoFinalizado("a2", "eq-001", "os-y", 7),
    ];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ quantidade: 12, valor_total: 4320 });
  });

  it("gerarItens marca sem_preco quando não há tarifa ativa", () => {
    const os = osHora("os-z");
    const aps = [apontamentoFinalizado("a1", "eq-005", "os-z", 8)];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens[0]).toMatchObject({ sem_preco: true, valor_unitario: null, valor_total: 0, quantidade: 8 });
  });

  it("gerarItens ignora apontamentos em andamento e de outra OS", () => {
    const os = osHora("os-w");
    const emAndamento: Apontamento = { ...apontamentoFinalizado("a1", "eq-001", "os-w", 9), status: "em_andamento", horimetro_final: null, horas_trabalhadas: null };
    const outraOs = apontamentoFinalizado("a2", "eq-002", "os-outra", 4);
    const itens = gerarItens(os, [emAndamento, outraOs], equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(0);
  });

  it("gerarItens separa seca e operada do mesmo equipamento em itens distintos", () => {
    const os = osHora("os-sep");
    const aps = [
      apontamentoFinalizado("a1", "eq-001", "os-sep", 5, "operada"),
      apontamentoFinalizado("a2", "eq-001", "os-sep", 3, "seca"),
    ];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(2);
    const operada = itens.find((i) => i.hora_tipo === "operada");
    const seca = itens.find((i) => i.hora_tipo === "seca");
    expect(operada).toMatchObject({ quantidade: 5, valor_unitario: 360, valor_total: 1800 });
    expect(seca).toMatchObject({ quantidade: 3, valor_unitario: 280, valor_total: 840 });
  });

  it("gerarItens trata modalidade ausente como operada", () => {
    const os = osHora("os-null-mod");
    const aps = [apontamentoFinalizado("a1", "eq-001", "os-null-mod", 4, null)];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ hora_tipo: "operada", quantidade: 4 });
  });

  it("gerarItens por_metro soma metros_executados dos apontamentos finalizados", () => {
    const os = osMetro("os-m", 300);
    const aps = [apontamentoComMetros("a1", "os-m", 30)];
    const itens = gerarItens(os, aps, equipamentos, precosHoraMaquina, precosFundacao);
    expect(itens).toHaveLength(1);
    expect(itens[0]).toMatchObject({ tipo: "por_metro", quantidade: 30, valor_unitario: 90, valor_total: 2700, sem_preco: false });
  });

  it("aplicarHoraTipo troca operada↔seca recalculando", () => {
    const os = osHora("os-t");
    const [item] = gerarItens(os, [apontamentoFinalizado("a1", "eq-001", "os-t", 10)], equipamentos, precosHoraMaquina, precosFundacao);
    const seca = aplicarHoraTipo(item, eq("eq-001"), precosHoraMaquina, "seca");
    expect(seca).toMatchObject({ hora_tipo: "seca", valor_unitario: 280, valor_total: 2800 });
    expect(seca.descricao).toContain("seca");
  });

  it("calcularValorTotal soma itens e subtrai desconto", () => {
    const os = osHora("os-d");
    const itens = gerarItens(os, [apontamentoFinalizado("a1", "eq-002", "os-d", 18)], equipamentos, precosHoraMaquina, precosFundacao);
    expect(calcularValorTotal(itens, 0)).toBe(5220);
    expect(calcularValorTotal(itens, 220)).toBe(5000);
  });

  it("temPendencia detecta item sem preço", () => {
    expect(temPendencia({ itens: [{ sem_preco: false } as never, { sem_preco: true } as never] })).toBe(true);
    expect(temPendencia({ itens: [{ sem_preco: false } as never] })).toBe(false);
  });
});
