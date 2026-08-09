import { useCallback, useRef, useState } from "react";
import { lerPreferencia, gravarPreferencia } from "@/shared/hooks/grid-storage";

/** Abaixo disso a coluna deixa de ser legível — vale para arrasto e teclado. */
export const LARGURA_MINIMA_COLUNA = 72;

type Larguras = Record<string, number>;

const chaveDe = (storageKey: string) => `colunas.${storageKey}`;

function ler(storageKey: string): Larguras {
  const bruto = lerPreferencia(chaveDe(storageKey));
  if (!bruto || typeof bruto !== "object") return {};
  const larguras: Larguras = {};
  for (const [header, valor] of Object.entries(bruto as Record<string, unknown>)) {
    if (typeof valor === "number" && Number.isFinite(valor) && valor >= LARGURA_MINIMA_COLUNA) {
      larguras[header] = Math.round(valor);
    }
  }
  return larguras;
}

export interface ColumnWidths {
  /** Ajustes feitos pelo usuário, por header. Colunas ausentes usam a largura natural. */
  ajustes: Larguras;
  temAjustes: boolean;
  /** Atualiza em memória — chamado a cada frame do arrasto. */
  definir: (header: string, px: number) => void;
  /** Grava no localStorage — chamado ao soltar o arrasto. */
  persistir: () => void;
  /** Sem header, limpa todas as colunas. Persiste na hora. */
  limpar: (header?: string) => void;
}

/**
 * Larguras de coluna ajustadas pelo usuário, persistidas por lista.
 * Sem `storageKey` o ajuste vive só na sessão.
 */
export function useColumnWidths(storageKey?: string): ColumnWidths {
  const [ajustes, setAjustes] = useState<Larguras>(() => (storageKey ? ler(storageKey) : {}));
  const ajustesRef = useRef(ajustes);
  ajustesRef.current = ajustes;

  const definir = useCallback((header: string, px: number) => {
    const proximos = {
      ...ajustesRef.current,
      [header]: Math.max(LARGURA_MINIMA_COLUNA, Math.round(px)),
    };
    ajustesRef.current = proximos;
    setAjustes(proximos);
  }, []);

  const persistir = useCallback(() => {
    if (storageKey) gravarPreferencia(chaveDe(storageKey), ajustesRef.current);
  }, [storageKey]);

  const limpar = useCallback(
    (header?: string) => {
      const proximos = header ? { ...ajustesRef.current } : {};
      if (header) delete proximos[header];
      ajustesRef.current = proximos;
      setAjustes(proximos);
      if (storageKey) gravarPreferencia(chaveDe(storageKey), proximos);
    },
    [storageKey],
  );

  return {
    ajustes,
    temAjustes: Object.keys(ajustes).length > 0,
    definir,
    persistir,
    limpar,
  };
}
