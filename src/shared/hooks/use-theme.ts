import { useSyncExternalStore } from "react";

import { CHAVE_TEMA, type Tema } from "@/shared/lib/tema-inicial";

/*
 * Tema light/dark do sistema — obrigatório pelo CLAUDE.md, com persistência.
 *
 * Store de módulo, e não `useState` por chamada: o toggle aparece em três
 * lugares (Perfil do operador, cabeçalho da retaguarda, login) e duas
 * instâncias com estados próprios se dessincronizam — quem não foi clicado
 * continua mostrando o ícone do tema antigo.
 *
 * Quem aplica a classe na primeira pintura é o script inline do <head>
 * (SCRIPT_TEMA_INICIAL); daqui para frente é o `alternar` que mantém a classe,
 * o storage e os assinantes de acordo.
 */

type Theme = Tema;

const ouvintes = new Set<() => void>();
let cache: Theme | null = null;

function preferenciaDoSistema(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ler(): Theme {
  if (typeof window === "undefined") return "light";
  // O snapshot precisa ser estável entre renders: o React chama `ler` várias
  // vezes por render e compara por identidade.
  if (cache) return cache;
  try {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    cache = salvo === "light" || salvo === "dark" ? salvo : preferenciaDoSistema();
  } catch {
    cache = preferenciaDoSistema();
  }
  return cache;
}

function aplicar(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function inscrever(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

export function definirTema(theme: Theme) {
  cache = theme;
  aplicar(theme);
  try {
    window.localStorage.setItem(CHAVE_TEMA, theme);
  } catch {
    // Storage bloqueado: o tema vale para esta sessão e não sobrevive ao reload.
  }
  ouvintes.forEach((fn) => fn());
}

/* Só para os testes: devolve o store ao estado de "ninguém leu ainda". */
export function resetarTemaParaTeste() {
  cache = null;
  ouvintes.clear();
}

export function useTheme() {
  // No servidor o HTML sai sempre claro; o script do <head> corrige antes de
  // qualquer pintura, e a hidratação reconcilia com o valor real do aparelho.
  const theme = useSyncExternalStore(inscrever, ler, () => "light" as Theme);

  return {
    theme,
    toggle: () => definirTema(ler() === "dark" ? "light" : "dark"),
    setTheme: definirTema,
  };
}
