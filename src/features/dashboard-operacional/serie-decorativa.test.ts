import { describe, expect, it } from "vitest";
import { serieDecorativa } from "./serie-decorativa";

const PONTOS = [
  { data: "2026-07-01", valor: 10 },
  { data: "2026-07-02", valor: 10 },
  { data: "2026-07-03", valor: 10 },
  { data: "2026-07-04", valor: 0 },
];

describe("serieDecorativa", () => {
  it("é determinística — mesma entrada produz a mesma saída", () => {
    expect(serieDecorativa(PONTOS)).toEqual(serieDecorativa(PONTOS));
  });

  it("gera (n-1) * pontosPorSegmento + 1 pontos", () => {
    expect(serieDecorativa(PONTOS, 5)).toHaveLength((PONTOS.length - 1) * 5 + 1);
    expect(serieDecorativa(PONTOS, 3)).toHaveLength((PONTOS.length - 1) * 3 + 1);
  });

  it("nunca produz valor negativo, mesmo quando a série real chega a zero", () => {
    for (const ponto of serieDecorativa(PONTOS)) {
      expect(ponto.valor).toBeGreaterThanOrEqual(0);
    }
  });

  it("adiciona variação — a série decorativa não é constante mesmo com entrada constante", () => {
    const decorada = serieDecorativa(PONTOS);
    const valores = decorada.map((p) => p.valor);
    expect(new Set(valores).size).toBeGreaterThan(1);
  });

  it("não muta o array de entrada", () => {
    const copia = PONTOS.map((p) => ({ ...p }));
    serieDecorativa(PONTOS);
    expect(PONTOS).toEqual(copia);
  });

  it("retorna a entrada sem alteração para 0 ou 1 ponto", () => {
    expect(serieDecorativa([])).toEqual([]);
    expect(serieDecorativa([{ data: "2026-07-01", valor: 5 }])).toEqual([{ data: "2026-07-01", valor: 5 }]);
  });
});
