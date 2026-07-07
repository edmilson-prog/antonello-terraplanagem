import { useSyncExternalStore } from "react";

// Meta mensal de faturamento — configuração local, não um contrato de dados
// do domínio (por isso não vive em shared/types nem em src/mocks). Persistida
// em localStorage no browser; em ambiente de teste (sem window) cai num
// fallback em memória por chave, mantendo o comportamento testável.

const memoriaFallback = new Map<string, string>();

function lerBruto(chave: string): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(chave);
  }
  return memoriaFallback.get(chave) ?? null;
}

function escreverBruto(chave: string, valor: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(chave, valor);
    return;
  }
  memoriaFallback.set(chave, valor);
}

export function criarMetaMensalStore(
  chave = "gerencial:meta-mensal-faturamento",
  padrao = 20000,
) {
  function valorPersistido(): number {
    const bruto = lerBruto(chave);
    if (bruto === null) return padrao;
    const n = Number(bruto);
    return Number.isFinite(n) && n >= 0 ? n : padrao;
  }

  let valorAtual = valorPersistido();
  const ouvintes = new Set<() => void>();

  function obter(): number {
    return valorAtual;
  }

  function definir(valor: number): void {
    valorAtual = valor >= 0 ? valor : 0;
    escreverBruto(chave, String(valorAtual));
    ouvintes.forEach((fn) => fn());
  }

  function inscrever(fn: () => void): () => void {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  }

  function useMetaMensal(): [number, (valor: number) => void] {
    const valor = useSyncExternalStore(inscrever, obter, obter);
    return [valor, definir];
  }

  return { obter, definir, useMetaMensal };
}

export const metaMensalStore = criarMetaMensalStore();
