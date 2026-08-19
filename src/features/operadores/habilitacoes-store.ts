import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";

/*
 * Habilitações operador → equipamento (`operadores_equipamentos`).
 *
 * Tabela de junção pura: não vale um store genérico de entidade. Guarda o par
 * e serve duas telas — o card "Equipamentos habilitados" no detalhe e os
 * checkboxes do formulário.
 *
 * Só a retaguarda lê (a policy é `is_retaguarda()`); no app de campo a
 * consulta voltaria vazia, então nem sai.
 */

interface Vinculo {
  operador_id: string;
  equipamento_id: string;
}

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Vinculo[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

// Uma referência por operador, estável entre renders: `useSyncExternalStore`
// compara o retorno do getSnapshot por identidade, e devolver um array novo a
// cada chamada faria o React re-renderizar em laço.
let porOperador = new Map<string, string[]>();

function indexar() {
  const mapa = new Map<string, string[]>();
  for (const v of itens) {
    const lista = mapa.get(v.operador_id);
    if (lista) lista.push(v.equipamento_id);
    else mapa.set(v.operador_id, [v.equipamento_id]);
  }
  porOperador = mapa;
}

const VAZIO: string[] = [];

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

async function carregar() {
  if (credencialAtual() !== "retaguarda") {
    itens = [];
    indexar();
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("operadores_equipamentos")
    .select("operador_id, equipamento_id")
    .returns<Vinculo[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    indexar();
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(carregar);

const doOperador = (operadorId: string): string[] => porOperador.get(operadorId) ?? VAZIO;

const useDoOperador = (operadorId: string) =>
  useSyncExternalStore(
    inscrever,
    () => doOperador(operadorId),
    () => doOperador(operadorId),
  );

const useEstado = () =>
  useSyncExternalStore(
    inscrever,
    () => estado,
    () => estado,
  );

/** Substitui o conjunto inteiro de habilitações do operador. */
const definir = async (operadorId: string, equipamentosIds: string[]): Promise<void> => {
  const { error } = await supabase.rpc("definir_equipamentos_operador", {
    p_operador_id: operadorId,
    p_equipamentos_ids: equipamentosIds,
  });
  if (error) throw new Error(error.message);
  await carregar();
};

export const habilitacoesStore = {
  doOperador,
  useDoOperador,
  useEstado,
  definir,
  retry: carregar,
};
