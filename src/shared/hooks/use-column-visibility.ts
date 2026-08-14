import { useCallback, useRef, useState } from "react";
import { lerPreferencia, gravarPreferencia } from "@/shared/hooks/grid-storage";

const chaveDe = (storageKey: string) => `colunas-ocultas.${storageKey}`;

function ler(storageKey: string): string[] {
  const bruto = lerPreferencia(chaveDe(storageKey));
  if (!Array.isArray(bruto)) return [];
  return bruto.filter((h): h is string => typeof h === "string");
}

export interface ColumnVisibility {
  /** Headers que o usuário escolheu esconder. */
  ocultas: string[];
  alternar: (header: string) => void;
  mostrarTodas: () => void;
}

/**
 * Colunas escondidas pelo usuário via menu de contexto da grade.
 * Sem `storageKey` a escolha vive só na sessão.
 */
export function useColumnVisibility(storageKey?: string): ColumnVisibility {
  const [ocultas, setOcultas] = useState<string[]>(() => (storageKey ? ler(storageKey) : []));
  const ocultasRef = useRef(ocultas);
  ocultasRef.current = ocultas;

  const aplicar = useCallback(
    (proximas: string[]) => {
      ocultasRef.current = proximas;
      setOcultas(proximas);
      if (storageKey) gravarPreferencia(chaveDe(storageKey), proximas);
    },
    [storageKey],
  );

  const alternar = useCallback(
    (header: string) => {
      const atuais = ocultasRef.current;
      aplicar(atuais.includes(header) ? atuais.filter((h) => h !== header) : [...atuais, header]);
    },
    [aplicar],
  );

  const mostrarTodas = useCallback(() => aplicar([]), [aplicar]);

  return { ocultas, alternar, mostrarTodas };
}
