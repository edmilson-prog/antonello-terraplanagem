import { useSyncExternalStore } from "react";

// Estado de revisão das anomalias do A2 — deliberadamente ISOLADO de
// Apontamento (não adiciona campo novo à entidade de domínio). "Confirmar
// ok" só faz a anomalia sumir da lista de revisão nesta sessão; não persiste
// no mock de apontamentos.
export function criarAnomaliaRevisoesStore() {
  let confirmadas = new Set<string>();
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  };

  const estaConfirmada = (apontamentoId: string) => confirmadas.has(apontamentoId);
  const confirmarOk = (apontamentoId: string) => {
    confirmadas = new Set(confirmadas).add(apontamentoId);
    notificar();
  };
  const useConfirmadas = () => useSyncExternalStore(inscrever, () => confirmadas, () => confirmadas);

  return { estaConfirmada, confirmarOk, useConfirmadas };
}

export const anomaliaRevisoesStore = criarAnomaliaRevisoesStore();
