import { describe, expect, it } from "vitest";
import { equipamentos } from "@/mocks/equipamentos";
import { precosHoraMaquina } from "@/mocks/precos-hora-maquina";
import { precosFundacao } from "@/mocks/precos-fundacao";
import { precosMobilizacao } from "@/mocks/precos-mobilizacao";
import {
  aplicarHoraTipo,
  calcularTotalOrcamento,
  criarItemHora,
  criarItemMetro,
  criarItemMobilizacao,
  temPendencia,
} from "@/features/orcamentos/calculo";

const eq001 = equipamentos.find((e) => e.id === "eq-001")!; // tem preço (phm-001: seca 280 / operada 360)
const eq005 = equipamentos.find((e) => e.id === "eq-005")!; // só preço inativo (phm-005) → sem preço ativo
const pf001 = precosFundacao.find((p) => p.id === "pf-001")!; // Ø300, 90/m
const pm001 = precosMobilizacao.find((p) => p.id === "pm-001")!; // 850

describe("criarItemHora", () => {
  it("usa o preço operada por padrão", () => {
    const item = criarItemHora(eq001, precosHoraMaquina, 40);
    expect(item.tipo).toBe("hora_maquina");
    expect(item.hora_tipo).toBe("operada");
    expect(item.origem_id).toBe("eq-001");
    expect(item.quantidade_estimada).toBe(40);
    expect(item.valor_unitario).toBe(360);
    expect(item.valor_total).toBe(14400);
    expect(item.sem_preco).toBe(false);
    expect(item.descricao).toContain("operada (estimado)");
  });

  it("usa o preço seca quando solicitado", () => {
    const item = criarItemHora(eq001, precosHoraMaquina, 20, "seca");
    expect(item.valor_unitario).toBe(280);
    expect(item.valor_total).toBe(5600);
    expect(item.descricao).toContain("seca (estimado)");
  });

  it("marca sem_preco quando não há tarifa ativa", () => {
    const item = criarItemHora(eq005, precosHoraMaquina, 8);
    expect(item.valor_unitario).toBeNull();
    expect(item.valor_total).toBe(0);
    expect(item.sem_preco).toBe(true);
  });
});

describe("criarItemMetro", () => {
  it("puxa o valor por metro do preço de fundação", () => {
    const item = criarItemMetro(pf001, 50);
    expect(item.tipo).toBe("por_metro");
    expect(item.origem_id).toBe("pf-001");
    expect(item.valor_unitario).toBe(90);
    expect(item.valor_total).toBe(4500);
    expect(item.sem_preco).toBe(false);
    expect(item.descricao).toBe("Estaca Ø300mm — 50m (estimado)");
  });
});

describe("criarItemMobilizacao", () => {
  it("cria item de quantidade 1 com o valor da mobilização", () => {
    const item = criarItemMobilizacao(pm001);
    expect(item.tipo).toBe("mobilizacao");
    expect(item.origem_id).toBe("pm-001");
    expect(item.quantidade_estimada).toBe(1);
    expect(item.valor_unitario).toBe(850);
    expect(item.valor_total).toBe(850);
  });
});

describe("aplicarHoraTipo", () => {
  it("troca operada → seca recalculando o valor", () => {
    const operada = criarItemHora(eq001, precosHoraMaquina, 10); // 10 × 360 = 3600
    const seca = aplicarHoraTipo(operada, eq001, precosHoraMaquina, "seca");
    expect(seca.hora_tipo).toBe("seca");
    expect(seca.valor_unitario).toBe(280);
    expect(seca.valor_total).toBe(2800);
    expect(seca.descricao).toContain("seca (estimado)");
  });

  it("não altera itens que não são hora-máquina", () => {
    const mob = criarItemMobilizacao(pm001);
    expect(aplicarHoraTipo(mob, undefined, precosHoraMaquina, "seca")).toEqual(mob);
  });
});

describe("calcularTotalOrcamento", () => {
  it("soma os itens e subtrai o desconto (round2)", () => {
    const itens = [criarItemHora(eq001, precosHoraMaquina, 40), criarItemMobilizacao(pm001)]; // 14400 + 850 = 15250
    expect(calcularTotalOrcamento(itens, 0)).toBe(15250);
    expect(calcularTotalOrcamento(itens, 250)).toBe(15000);
  });
});

describe("temPendencia", () => {
  it("é true quando algum item está sem preço", () => {
    expect(temPendencia({ itens: [criarItemHora(eq005, precosHoraMaquina, 8)] })).toBe(true);
    expect(temPendencia({ itens: [criarItemHora(eq001, precosHoraMaquina, 8)] })).toBe(false);
  });
});
