import { useSyncExternalStore } from "react";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import type { NovoRegistroCampo, RegistroCampo, TipoRegistroCampo } from "./tipos";

/*
 * Fila local dos registros de campo (ADR-001, primeiro estágio).
 *
 * Grava em localStorage porque o registro precisa sobreviver a fechar o app no
 * canteiro sem sinal — é a promessa que a tela de confirmação faz ("salvo no
 * aparelho"). Cada item nasce com `op_id` e `pendente_sync: true`; quando as
 * RPCs por token existirem, o flush envia a fila e marca o que a central
 * confirmou, deduplicando pelo `op_id`.
 */

const CHAVE = "antonello.registros_campo";
const LIMITE = 500; // trava de segurança: localStorage não é banco.

const ouvintes = new Set<() => void>();
let cache: RegistroCampo[] | null = null;

function ler(): RegistroCampo[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  const bruto = window.localStorage.getItem(CHAVE);
  if (!bruto) {
    cache = [];
    return cache;
  }
  try {
    const lido: unknown = JSON.parse(bruto);
    cache = Array.isArray(lido) ? (lido as RegistroCampo[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(itens: RegistroCampo[]) {
  cache = itens.slice(0, LIMITE);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAVE, JSON.stringify(cache));
  }
  ouvintes.forEach((fn) => fn());
}

function inscrever(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

const VAZIO: RegistroCampo[] = [];

function registrar(novo: NovoRegistroCampo): RegistroCampo {
  const agora = new Date().toISOString();
  const registro = {
    ...novo,
    id: crypto.randomUUID(),
    op_id: crypto.randomUUID(),
    operador_id: getOperadorLogadoId(),
    os_id: novo.os_id ?? null,
    equipamento_id: novo.equipamento_id ?? null,
    registrado_em: agora,
    pendente_sync: true,
  } as RegistroCampo;
  gravar([registro, ...ler()]);
  return registro;
}

function listar(): RegistroCampo[] {
  return ler();
}

function porTipo(tipo: TipoRegistroCampo): RegistroCampo[] {
  return ler().filter((r) => r.tipo === tipo);
}

function porOS(osId: string): RegistroCampo[] {
  return ler().filter((r) => r.os_id === osId);
}

function limpar() {
  gravar([]);
}

function useTodos(): RegistroCampo[] {
  return useSyncExternalStore(
    inscrever,
    () => ler(),
    () => VAZIO,
  );
}

export const registrosCampoStore = {
  registrar,
  listar,
  porTipo,
  porOS,
  limpar,
  useTodos,
};
