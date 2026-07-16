import { useSyncExternalStore } from "react";
import { historicoPrecos as seed } from "@/mocks/historico-precos";
import type {
  HistoricoPreco,
  TipoHistoricoPreco,
  PrecoHoraMaquina,
  PrecoFundacao,
  PrecoMobilizacao,
} from "@/shared/types";

export function criarHistoricoPrecosStore(inicial: HistoricoPreco[]) {
  let itens: HistoricoPreco[] = inicial.map((h) => ({ ...h }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;

  function registrar(
    tipo: TipoHistoricoPreco,
    snapshot: PrecoHoraMaquina | PrecoFundacao | PrecoMobilizacao,
  ): void {
    const entrada: HistoricoPreco = {
      id: crypto.randomUUID(),
      tipo,
      preco_id: snapshot.id,
      snapshot,
      alterado_em: new Date().toISOString(),
    };
    itens = [entrada, ...itens];
    notificar();
  }

  const useTodos = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, registrar, useTodos };
}

export const historicoPrecosStore = criarHistoricoPrecosStore(seed);
