import { useSyncExternalStore } from "react";

/*
 * Instante da última leitura bem-sucedida dos dados do servidor neste aparelho.
 * Guardado localmente porque é uma propriedade DO APARELHO, não da conta — dois
 * celulares do mesmo operador sincronizam em momentos diferentes.
 */

const CHAVE = "antonello.ultima_sincronizacao";
const ouvintes = new Set<() => void>();

let cache: string | null = null;
let carregado = false;

function ler(): string | null {
  if (typeof window === "undefined") return null;
  if (!carregado) {
    cache = window.localStorage.getItem(CHAVE);
    carregado = true;
  }
  return cache;
}

function inscrever(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

export function registrarSincronizacao(em: string = new Date().toISOString()) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, em);
  cache = em;
  carregado = true;
  ouvintes.forEach((fn) => fn());
}

export function useUltimaSincronizacao(): string | null {
  return useSyncExternalStore(
    inscrever,
    () => ler(),
    () => null,
  );
}
