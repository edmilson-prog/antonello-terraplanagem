import { describe, expect, it } from "vitest";
import { serieSuavizada } from "./serie-suavizada";

const PONTOS = [
  { data: "2026-07-01", valor: 10 },
  { data: "2026-07-02", valor: 10 },
  { data: "2026-07-03", valor: 10 },
  { data: "2026-07-04", valor: 0 },
];

describe("serieSuavizada", () => {
  it("é determinística — mesma entrada produz a mesma saída", () => {
    expect(serieSuavizada(PONTOS)).toEqual(serieSuavizada(PONTOS));
  });

  it("gera (n-1) * pontosPorSegmento + 1 pontos", () => {
    expect(serieSuavizada(PONTOS, 5)).toHaveLength((PONTOS.length - 1) * 5 + 1);
    expect(serieSuavizada(PONTOS, 3)).toHaveLength((PONTOS.length - 1) * 3 + 1);
  });

  it("nunca produz valor negativo, mesmo quando a série real chega a zero", () => {
    for (const ponto of serieSuavizada(PONTOS)) {
      expect(ponto.valor).toBeGreaterThanOrEqual(0);
    }
  });

  it("entrada constante sai constante — sem ondulação inventada", () => {
    // Até a Onda 22 uma senoide era somada ao traçado "para dar movimento": a
    // linha subia e descia onde o dado não subia nem descia. Este teste tranca
    // a remoção — um pico visual sem pico real é leitura errada.
    const constante = [
      { data: "2026-07-01", valor: 10 },
      { data: "2026-07-02", valor: 10 },
      { data: "2026-07-03", valor: 10 },
    ];

    expect(new Set(serieSuavizada(constante).map((p) => p.valor))).toEqual(new Set([10]));
  });

  it("a curva passa pelos valores reais, não por perto deles", () => {
    const suave = serieSuavizada(PONTOS, 5);

    // Cada ponto original cai numa posição múltipla de pontosPorSegmento.
    PONTOS.forEach((original, i) => {
      expect(suave[i * 5].valor).toBe(original.valor);
    });
  });

  it("interpola entre dois pontos reais sem ultrapassá-los", () => {
    const suave = serieSuavizada(
      [
        { data: "2026-07-01", valor: 0 },
        { data: "2026-07-02", valor: 100 },
      ],
      4,
    );

    for (const p of suave) {
      expect(p.valor).toBeGreaterThanOrEqual(0);
      expect(p.valor).toBeLessThanOrEqual(100);
    }
    // Monotônica: a subida real não ganha vale nem pico no caminho.
    for (let i = 1; i < suave.length; i += 1) {
      expect(suave[i].valor).toBeGreaterThanOrEqual(suave[i - 1].valor);
    }
  });

  it("não muta o array de entrada", () => {
    const copia = PONTOS.map((p) => ({ ...p }));
    serieSuavizada(PONTOS);
    expect(PONTOS).toEqual(copia);
  });

  it("retorna a entrada sem alteração para 0 ou 1 ponto", () => {
    expect(serieSuavizada([])).toEqual([]);
    expect(serieSuavizada([{ data: "2026-07-01", valor: 5 }])).toEqual([
      { data: "2026-07-01", valor: 5 },
    ]);
  });
});
