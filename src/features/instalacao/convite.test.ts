import { describe, it, expect, beforeEach } from "vitest";

import {
  CHAVE_CONVITE,
  decidirConvite,
  lerPreferencia,
  limparPreferencia,
  PREFERENCIA_VAZIA,
  registrarDispensa,
  silenciado,
  type PreferenciaConvite,
} from "./convite";

/*
 * O que estes testes protegem: o convite não pode virar interrogatório. Um
 * banner que volta toda manhã em um app usado dentro da máquina é ruído — e
 * ruído em app de campo acaba com o operador ignorando o que importa.
 */

const AGORA = new Date("2026-08-19T12:00:00.000Z");

function emDias(dias: number): Date {
  return new Date(AGORA.getTime() + dias * 24 * 60 * 60 * 1000);
}

function entrada(over: Partial<Parameters<typeof decidirConvite>[0]> = {}) {
  return {
    instalado: false,
    ios: false,
    promptNativo: true,
    preferencia: PREFERENCIA_VAZIA,
    agora: AGORA,
    ...over,
  };
}

describe("decidirConvite", () => {
  it("não convida quem já abriu o app pela tela inicial", () => {
    expect(decidirConvite(entrada({ instalado: true }))).toBe("oculto");
    expect(decidirConvite(entrada({ instalado: true, ios: true, promptNativo: false }))).toBe(
      "oculto",
    );
  });

  it("usa o prompt nativo quando o navegador entrega um", () => {
    expect(decidirConvite(entrada())).toBe("nativo");
  });

  it("cai no passo a passo do iOS quando não há prompt nativo", () => {
    expect(decidirConvite(entrada({ ios: true, promptNativo: false }))).toBe("ios");
  });

  it("some no navegador sem caminho de instalação — pedir o impossível é pior", () => {
    expect(decidirConvite(entrada({ ios: false, promptNativo: false }))).toBe("oculto");
  });

  it("respeita o 'agora não' e volta quando o prazo vence", () => {
    const preferencia: PreferenciaConvite = { dispensas: 1, dispensadoEm: AGORA.toISOString() };

    expect(decidirConvite(entrada({ preferencia, agora: emDias(6) }))).toBe("oculto");
    expect(decidirConvite(entrada({ preferencia, agora: emDias(8) }))).toBe("nativo");
  });

  it("dobra a paciência na segunda dispensa e desiste na terceira", () => {
    const segunda: PreferenciaConvite = { dispensas: 2, dispensadoEm: AGORA.toISOString() };
    expect(decidirConvite(entrada({ preferencia: segunda, agora: emDias(29) }))).toBe("oculto");
    expect(decidirConvite(entrada({ preferencia: segunda, agora: emDias(31) }))).toBe("nativo");

    const terceira: PreferenciaConvite = { dispensas: 3, dispensadoEm: AGORA.toISOString() };
    expect(decidirConvite(entrada({ preferencia: terceira, agora: emDias(365) }))).toBe("oculto");
  });

  it("o ponto de entrada do Perfil ignora as dispensas", () => {
    const terceira: PreferenciaConvite = { dispensas: 3, dispensadoEm: AGORA.toISOString() };
    expect(decidirConvite(entrada({ preferencia: terceira, ignorarSilencio: true }))).toBe(
      "nativo",
    );
    // ...mas nem o Perfil convida quem já instalou.
    expect(
      decidirConvite(entrada({ instalado: true, preferencia: terceira, ignorarSilencio: true })),
    ).toBe("oculto");
  });
});

describe("silenciado", () => {
  it("data gravada corrompida não pode calar o convite para sempre", () => {
    expect(silenciado({ dispensas: 1, dispensadoEm: "nem-data" }, AGORA)).toBe(false);
  });

  it("contador sem data é tratado como nunca dispensado", () => {
    expect(silenciado({ dispensas: 2, dispensadoEm: null }, AGORA)).toBe(false);
  });
});

describe("preferência no aparelho", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("conta as dispensas e guarda quando foi a última", () => {
    expect(lerPreferencia()).toEqual(PREFERENCIA_VAZIA);

    registrarDispensa(AGORA);
    const depois = registrarDispensa(emDias(10));

    expect(depois.dispensas).toBe(2);
    expect(lerPreferencia()).toEqual({ dispensas: 2, dispensadoEm: emDias(10).toISOString() });
  });

  it("instalar zera o histórico — as recusas não valem mais nada", () => {
    registrarDispensa(AGORA);
    limparPreferencia();
    expect(lerPreferencia()).toEqual(PREFERENCIA_VAZIA);
  });

  it("conteúdo inválido no storage não derruba a tela", () => {
    window.localStorage.setItem(CHAVE_CONVITE, "{ isto não é json");
    expect(lerPreferencia()).toEqual(PREFERENCIA_VAZIA);
  });
});
