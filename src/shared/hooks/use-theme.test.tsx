import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useTheme, resetarTemaParaTeste } from "./use-theme";
import { CHAVE_TEMA, SCRIPT_TEMA_INICIAL } from "@/shared/lib/tema-inicial";

/*
 * O que estes testes protegem: o tema escolhido tem que valer no aparelho
 * inteiro, e não só na tela que por acaso monta o toggle. Era o bug — recarregar
 * em /app abria claro mesmo com "escuro" salvo, porque o único consumidor do
 * hook era a aba Perfil.
 */

function Consumidor({ nome }: { nome: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle}>
      {nome}: {theme}
    </button>
  );
}

describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    resetarTemaParaTeste();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("dois consumidores enxergam o mesmo tema — trocar em um troca no outro", () => {
    render(
      <>
        <Consumidor nome="perfil" />
        <Consumidor nome="cabecalho" />
      </>,
    );

    expect(screen.getByText("perfil: light")).toBeInTheDocument();
    fireEvent.click(screen.getByText("perfil: light"));

    expect(screen.getByText("perfil: dark")).toBeInTheDocument();
    expect(screen.getByText("cabecalho: dark")).toBeInTheDocument();
  });

  it("alternar aplica a classe no <html> e persiste a escolha", () => {
    render(<Consumidor nome="perfil" />);
    fireEvent.click(screen.getByText("perfil: light"));

    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem(CHAVE_TEMA)).toBe("dark");

    fireEvent.click(screen.getByText("perfil: dark"));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem(CHAVE_TEMA)).toBe("light");
  });

  it("parte da preferência salva no aparelho", () => {
    window.localStorage.setItem(CHAVE_TEMA, "dark");
    resetarTemaParaTeste();

    render(<Consumidor nome="perfil" />);
    expect(screen.getByText("perfil: dark")).toBeInTheDocument();
  });
});

describe("SCRIPT_TEMA_INICIAL", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  /** Executa o script como o navegador executaria, cru, antes de qualquer bundle. */
  function rodarScript() {
    new Function(SCRIPT_TEMA_INICIAL)();
  }

  it("escurece antes da primeira pintura quando o aparelho tem 'dark' salvo", () => {
    window.localStorage.setItem(CHAVE_TEMA, "dark");
    rodarScript();
    expect(document.documentElement).toHaveClass("dark");
  });

  it("valor inválido no storage cai na preferência do sistema, sem quebrar", () => {
    window.localStorage.setItem(CHAVE_TEMA, "roxo");
    rodarScript();
    // O jsdom deste projeto responde `matches: false` — ou seja, claro.
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("tira a classe quando a escolha é o tema claro", () => {
    document.documentElement.classList.add("dark");
    window.localStorage.setItem(CHAVE_TEMA, "light");
    rodarScript();
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
