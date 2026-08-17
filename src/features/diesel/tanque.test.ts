import { describe, it, expect } from "vitest";
import { custoMedioEm, estadoDoTanque } from "@/features/diesel/tanque";
import type { Abastecimento, CompraDiesel } from "@/shared/types";

function compra(em: string, litros: number, precoLitro: number): CompraDiesel {
  return {
    id: `c-${em}-${litros}`,
    litros,
    preco_litro: precoLitro,
    valor_total: litros * precoLitro,
    fornecedor: null,
    documento: null,
    observacao: null,
    comprado_em: em,
    conta_pagar_id: null,
    created_at: em,
    updated_at: em,
  };
}

function saida(em: string, litros: number, origem: "tanque" | "externo" = "tanque"): Abastecimento {
  return {
    id: `a-${em}-${litros}`,
    equipamento_id: "eq-1",
    operador_id: null,
    litros,
    horimetro: 100,
    preco_litro: null,
    custo_total: null,
    local: null,
    origem,
    abastecido_em: em,
    created_at: em,
    updated_at: em,
  };
}

const CAPACIDADE = 2000;

describe("estadoDoTanque", () => {
  it("soma as compras no saldo", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 1000, 5.8), compra("2026-07-10T10:00:00Z", 500, 6.0)],
      [],
      CAPACIDADE,
    );
    expect(estado.saldoLitros).toBe(1500);
  });

  it("pondera o custo médio pelas quantidades, não pela média dos preços", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 1000, 5.0), compra("2026-07-10T10:00:00Z", 100, 10.0)],
      [],
      CAPACIDADE,
    );
    // (1000×5 + 100×10) ÷ 1100 = 5,4545 — e não (5 + 10) / 2 = 7,5.
    expect(estado.custoMedioLitro).toBeCloseTo(5.45, 2);
  });

  it("baixa litros no abastecimento sem mexer no custo médio", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 1000, 5.8)],
      [saida("2026-07-05T10:00:00Z", 200)],
      CAPACIDADE,
    );
    expect(estado.saldoLitros).toBe(800);
    expect(estado.custoMedioLitro).toBeCloseTo(5.8, 4);
  });

  it("processa em ordem cronológica, não na ordem em que os registros chegam", () => {
    // A compra cara vem primeiro na lista, mas é posterior no tempo: a saída do
    // dia 05 tem de consumir do estoque barato do dia 01.
    const foraDeOrdem = estadoDoTanque(
      [compra("2026-07-10T10:00:00Z", 1000, 10.0), compra("2026-07-01T10:00:00Z", 1000, 5.0)],
      [saida("2026-07-05T10:00:00Z", 500)],
      CAPACIDADE,
    );
    const emOrdem = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 1000, 5.0), compra("2026-07-10T10:00:00Z", 1000, 10.0)],
      [saida("2026-07-05T10:00:00Z", 500)],
      CAPACIDADE,
    );
    expect(foraDeOrdem.custoMedioLitro).toBeCloseTo(emOrdem.custoMedioLitro ?? 0, 4);
    // 500 restantes a 5,00 + 1000 a 10,00 = 8,33.
    expect(emOrdem.custoMedioLitro).toBeCloseTo(8.33, 2);
  });

  it("ignora abastecimento de origem externa", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 1000, 5.8)],
      [saida("2026-07-05T10:00:00Z", 300, "externo")],
      CAPACIDADE,
    );
    expect(estado.saldoLitros).toBe(1000);
  });

  it("sinaliza inconsistência quando sai mais do que entrou", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 100, 5.8)],
      [saida("2026-07-05T10:00:00Z", 300)],
      CAPACIDADE,
    );
    expect(estado.saldoLitros).toBe(-200);
    expect(estado.inconsistente).toBe(true);
    // Sem estoque, não há custo médio a informar.
    expect(estado.custoMedioLitro).toBeNull();
  });

  it("recomeça o custo pela nova compra quando o saldo estava negativo", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-01T10:00:00Z", 100, 5.0), compra("2026-07-20T10:00:00Z", 1000, 7.0)],
      [saida("2026-07-05T10:00:00Z", 300)],
      CAPACIDADE,
    );
    // Saldo ia a -200; a compra de 1000 devolve 800 no estoque, ao preço dela.
    expect(estado.saldoLitros).toBe(800);
    expect(estado.custoMedioLitro).toBeCloseTo(7, 4);
    expect(estado.inconsistente).toBe(false);
  });

  it("calcula a ocupação sobre a capacidade", () => {
    const estado = estadoDoTanque([compra("2026-07-01T10:00:00Z", 1240, 5.8)], [], CAPACIDADE);
    expect(estado.ocupacao).toBeCloseTo(0.62, 4);
  });

  it("não devolve ocupação sem capacidade configurada", () => {
    const estado = estadoDoTanque([compra("2026-07-01T10:00:00Z", 500, 5.8)], [], 0);
    expect(estado.ocupacao).toBeNull();
  });

  it("nunca reporta ocupação negativa", () => {
    const estado = estadoDoTanque([], [saida("2026-07-05T10:00:00Z", 100)], CAPACIDADE);
    expect(estado.ocupacao).toBe(0);
  });

  it("aponta a última compra pela data, não pela ordem da lista", () => {
    const estado = estadoDoTanque(
      [compra("2026-07-20T10:00:00Z", 500, 6.0), compra("2026-07-25T10:00:00Z", 400, 6.2)],
      [],
      CAPACIDADE,
    );
    expect(estado.ultimaCompra?.comprado_em).toBe("2026-07-25T10:00:00Z");
  });

  it("é neutro com tanque vazio", () => {
    const estado = estadoDoTanque([], [], CAPACIDADE);
    expect(estado.saldoLitros).toBe(0);
    expect(estado.custoMedioLitro).toBeNull();
    expect(estado.ultimaCompra).toBeNull();
    expect(estado.inconsistente).toBe(false);
  });
});

describe("custoMedioEm", () => {
  it("usa só o que aconteceu antes da data", () => {
    const compras = [
      compra("2026-07-01T10:00:00Z", 1000, 5.0),
      compra("2026-07-20T10:00:00Z", 1000, 9.0),
    ];
    // Em 10/07 a segunda compra ainda não existia.
    expect(custoMedioEm(compras, [], "2026-07-10T10:00:00Z")).toBeCloseTo(5, 4);
    // Em 25/07 as duas contam.
    expect(custoMedioEm(compras, [], "2026-07-25T10:00:00Z")).toBeCloseTo(7, 4);
  });

  it("devolve null quando não houve compra até a data", () => {
    expect(
      custoMedioEm([compra("2026-07-20T10:00:00Z", 100, 6)], [], "2026-07-01T10:00:00Z"),
    ).toBeNull();
  });
});
