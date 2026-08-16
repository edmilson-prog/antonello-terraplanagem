import { parametrosStore } from "@/features/parametros/parametros-store";
import type { Parametros } from "@/shared/types";

// Pontos de consumo dos parâmetros pelo resto do sistema. Cada leitura tem um
// fallback igual à constante que existia antes desta feature, por dois motivos:
// a store ainda não carregou no primeiro render, e o app do operador não lê a
// tabela `parametros` (RLS é de retaguarda) — lá o fallback é o valor efetivo.

/** Leitura fora de componente (funções de derivação). Não é reativa. */
export function parametroNumero<K extends keyof Parametros>(chave: K, fallback: number): number {
  const valor = parametrosStore.get()?.[chave];
  return typeof valor === "number" ? valor : fallback;
}

/** Versão reativa: o componente re-renderiza quando o parâmetro muda. */
export function useParametroNumero<K extends keyof Parametros>(chave: K, fallback: number): number {
  const parametros = parametrosStore.useParametros();
  const valor = parametros?.[chave];
  return typeof valor === "number" ? valor : fallback;
}

export function useParametroBooleano<K extends keyof Parametros>(
  chave: K,
  fallback: boolean,
): boolean {
  const parametros = parametrosStore.useParametros();
  const valor = parametros?.[chave];
  return typeof valor === "boolean" ? valor : fallback;
}

export function useParametroTexto<K extends keyof Parametros>(chave: K, fallback: string): string {
  const parametros = parametrosStore.useParametros();
  const valor = parametros?.[chave];
  return typeof valor === "string" && valor !== "" ? valor : fallback;
}
