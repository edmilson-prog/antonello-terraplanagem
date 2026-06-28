import { useSyncExternalStore } from "react";

// Store mock genérico em memória. Generaliza features/operador/ordens-store.ts.
// Em produção isto vira mutation no backend + invalidate das queries; aqui usamos
// useSyncExternalStore para refletir mudanças em qualquer tela que leia a lista.

type Entidade = {
  id: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export interface MockStore<T extends Entidade> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  useAll: () => T[];
  create: (data: Omit<T, "id" | "created_at" | "updated_at">) => T;
  update: (id: string, patch: Partial<Omit<T, "id" | "created_at">>) => void;
  setAtivo: (id: string, ativo: boolean) => void;
}

export function createMockStore<T extends Entidade>(seed: T[]): MockStore<T> {
  let itens: T[] = seed.map((item) => ({ ...item }));
  const ouvintes = new Set<() => void>();

  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const getAll = () => itens;
  const getById = (id: string) => itens.find((i) => i.id === id);

  const create: MockStore<T>["create"] = (data) => {
    const agora = new Date().toISOString();
    const novo = {
      ...(data as Omit<T, "id" | "created_at" | "updated_at">),
      id: crypto.randomUUID(),
      created_at: agora,
      updated_at: agora,
    } as T;
    itens = [novo, ...itens];
    notificar();
    return novo;
  };

  const update: MockStore<T>["update"] = (id, patch) => {
    itens = itens.map((i) =>
      i.id === id ? { ...i, ...patch, updated_at: new Date().toISOString() } : i,
    );
    notificar();
  };

  const setAtivo = (id: string, ativo: boolean) => update(id, { ativo } as Partial<T>);

  const useAll = () => useSyncExternalStore(inscrever, getAll, getAll);

  return { getAll, getById, useAll, create, update, setAtivo };
}
