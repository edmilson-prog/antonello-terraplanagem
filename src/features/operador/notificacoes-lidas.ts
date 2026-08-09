import { useSyncExternalStore } from "react";

/*
 * Marca de leitura das notificações — por aparelho, não por conta. Guarda o
 * instante em que o operador abriu a lista; tudo anterior a ele conta como
 * lido. Store minúsculo com useSyncExternalStore para o sino do cabeçalho
 * reagir ao "Marcar lidas" sem prop drilling.
 */

const CHAVE = "antonello.notificacoes_lidas";
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

export function marcarNotificacoesLidas(em: string = new Date().toISOString()) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, em);
  cache = em;
  carregado = true;
  ouvintes.forEach((fn) => fn());
}

export function useMarcaLeitura(): string | null {
  return useSyncExternalStore(
    inscrever,
    () => ler(),
    () => null,
  );
}
