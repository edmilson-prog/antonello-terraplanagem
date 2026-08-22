import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";

/*
 * Acesso ao app, por operador — o card homônimo do detalhe e a coluna da lista.
 *
 * `operador_sessoes` não tem policy de RLS (token de sessão não se lê por
 * SELECT), então a porta é a RPC `acesso_app_operadores`, que checa
 * `is_retaguarda()` e devolve só os quatro campos que a tela mostra. O token
 * nunca atravessa essa fronteira.
 *
 * Carrega todos de uma vez em vez de um por linha: a lista de operadores abre
 * com a coluna preenchida, e o detalhe reaproveita o mesmo cache.
 */

export interface AcessoApp {
  liberado: boolean;
  ultimoAcesso: string | null;
  dispositivo: string | null;
  appVersao: string | null;
}

interface LinhaRpc {
  operador_id: string;
  liberado: boolean;
  ultimo_acesso: string | null;
  dispositivo: string | null;
  app_versao: string | null;
}

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let porOperador = new Map<string, AcessoApp>();
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

async function carregar() {
  if (credencialAtual() !== "retaguarda") {
    porOperador = new Map();
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase.rpc("acesso_app_operadores");

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    const linhas = (data ?? []) as unknown as LinhaRpc[];
    porOperador = new Map(
      linhas.map((l) => [
        l.operador_id,
        {
          liberado: l.liberado,
          ultimoAcesso: l.ultimo_acesso,
          dispositivo: l.dispositivo,
          appVersao: l.app_versao,
        },
      ]),
    );
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(carregar);

/**
 * `undefined` = este operador nunca fez login. Distinto de um acesso revogado
 * (`{ liberado: false, ... }`), que já entrou alguma vez — a tela diz coisas
 * diferentes nos dois casos.
 */
const doOperador = (operadorId: string): AcessoApp | undefined => porOperador.get(operadorId);

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

export const acessoAppStore = {
  doOperador,
  useDoOperador,
  useEstado,
  retry: carregar,
};
