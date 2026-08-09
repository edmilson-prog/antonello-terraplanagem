const STORAGE_PREFIX = "antonello.";

/** Preferências de grade guardadas por lista (larguras, colunas ocultas). */
export function lerPreferencia(chave: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + chave);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

/** Valor vazio (`null`, `[]`, `{}`) remove a chave em vez de gravar lixo. */
export function gravarPreferencia(chave: string, valor: unknown[] | Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const vazio = Array.isArray(valor) ? valor.length === 0 : Object.keys(valor).length === 0;
    if (vazio) window.localStorage.removeItem(STORAGE_PREFIX + chave);
    else window.localStorage.setItem(STORAGE_PREFIX + chave, JSON.stringify(valor));
  } catch {
    // localStorage indisponível (modo privado, cota cheia): preferência fica só em memória
  }
}
