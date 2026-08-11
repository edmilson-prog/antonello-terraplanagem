import { describe, it, expect, vi, afterEach } from "vitest";
import { descreverTempo, interpretarResposta, urlClima, buscarClima, LOCAL_PADRAO } from "./clima";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("descreverTempo", () => {
  it("traduz códigos WMO conhecidos", () => {
    expect(descreverTempo(0).descricao).toBe("céu limpo");
    expect(descreverTempo(3).descricao).toBe("nublado");
    expect(descreverTempo(95).descricao).toBe("trovoada");
  });

  it("cai num rótulo neutro para código desconhecido", () => {
    expect(descreverTempo(-1)).toEqual({ descricao: "sem leitura", icone: "lucide:cloud" });
    expect(descreverTempo(1234).descricao).toBe("sem leitura");
  });
});

describe("urlClima", () => {
  it("aponta para a Open-Meteo com as coordenadas do local", () => {
    const url = urlClima(LOCAL_PADRAO);
    expect(url).toContain("https://api.open-meteo.com/v1/forecast");
    expect(url).toContain(`latitude=${LOCAL_PADRAO.lat}`);
    expect(url).toContain("current=temperature_2m%2Cweather_code");
  });
});

describe("interpretarResposta", () => {
  it("arredonda a temperatura e resolve descrição/ícone", () => {
    expect(interpretarResposta({ current: { temperature_2m: 17.4, weather_code: 0 } })).toEqual({
      temperatura: 17,
      descricao: "céu limpo",
      icone: "lucide:sun",
    });
  });

  it("devolve null quando o payload não traz temperatura", () => {
    expect(interpretarResposta({})).toBeNull();
    expect(interpretarResposta({ current: {} })).toBeNull();
    expect(interpretarResposta(null)).toBeNull();
  });
});

describe("buscarClima", () => {
  it("devolve o clima quando a resposta é válida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ current: { temperature_2m: 21.6, weather_code: 2 } }),
      }),
    );
    await expect(buscarClima()).resolves.toEqual({
      temperatura: 22,
      descricao: "parcialmente nublado",
      icone: "lucide:cloud-sun",
    });
  });

  it("devolve null em erro de rede, sem propagar exceção", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(buscarClima()).resolves.toBeNull();
  });

  it("devolve null quando o HTTP falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    await expect(buscarClima()).resolves.toBeNull();
  });
});
