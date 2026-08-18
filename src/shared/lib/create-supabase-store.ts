import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";

/*
 * Store reativo respaldado pelo Supabase, com a MESMA API pública do
 * `createMockStore` — só as escritas viraram assíncronas.
 *
 * Nasceu na Onda 20, quando quatro stores precisavam sair do mock ao mesmo
 * tempo (três de preços e componentes de custo) e todas repetiriam o mesmo
 * arquivo de 100 linhas. As stores com regra própria (contas a pagar, registros
 * de manutenção, notificações, abastecimentos) continuam escritas à mão: o que
 * se generaliza aqui é o CRUD puro sobre uma tabela.
 *
 * O guard de credencial é o mesmo que corrigiu o 401 do boot: o bundle não tem
 * code-splitting, então todo store é importado em qualquer rota — inclusive na
 * landing pública e no app de campo, onde não há sessão da retaguarda.
 */

type Entidade = {
  id: string;
  created_at: string;
  updated_at: string;
};

export interface EstadoStore {
  isLoading: boolean;
  error: Error | null;
}

export interface SupabaseStore<T extends Entidade> {
  getAll: () => T[];
  getById: (id: string) => T | undefined;
  useAll: () => T[];
  useEstado: () => EstadoStore;
  create: (dados: Omit<T, "id" | "created_at" | "updated_at">) => Promise<T>;
  update: (id: string, patch: Partial<Omit<T, "id" | "created_at">>) => Promise<void>;
  setAtivo: (id: string, ativo: boolean) => Promise<void>;
  retry: () => Promise<void>;
}

/*
 * O nome da tabela é um parâmetro, então o cliente tipado do supabase-js não
 * consegue resolver Row/Insert/Update — ele exige um literal conhecido em
 * tempo de compilação. Em vez de espalhar `any`, declaramos abaixo a fatia
 * mínima do cliente que este arquivo usa: quatro métodos, tipados. Quem chama
 * `createSupabaseStore<T>` é que afirma o formato da linha, e o tipo T vem dos
 * contratos em shared/types — os mesmos que o banco implementa.
 */
type Resposta<D> = { data: D | null; error: { message: string } | null };

interface ConsultaLista<T> extends PromiseLike<Resposta<T[]>> {
  order(coluna: string, opts: { ascending: boolean }): ConsultaLista<T>;
}

interface ClienteMinimo {
  from(tabela: string): {
    select(colunas: string): ConsultaLista<unknown>;
    insert(dados: unknown): { select(): { single(): PromiseLike<Resposta<unknown>> } };
    update(dados: unknown): {
      eq(coluna: string, valor: string): PromiseLike<Resposta<unknown>>;
    };
  };
}

const db = supabase as unknown as ClienteMinimo;

interface Opcoes {
  /** Nome da tabela no Postgres. */
  tabela: string;
  /** Coluna de ordenação da listagem. */
  ordenarPor?: string;
  ascendente?: boolean;
  /**
   * Quem pode consultar. `retaguarda` é o padrão porque a policy destas tabelas
   * é `is_retaguarda()`; consultar como operador só renderia 401.
   */
  credencial?: "retaguarda" | "qualquer";
}

export function createSupabaseStore<T extends Entidade>({
  tabela,
  ordenarPor,
  ascendente = true,
  credencial = "retaguarda",
}: Opcoes): SupabaseStore<T> {
  let itens: T[] = [];
  let estado: EstadoStore = { isLoading: true, error: null };
  const ouvintes = new Set<() => void>();

  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const podeConsultar = () =>
    credencial === "qualquer"
      ? credencialAtual() !== "nenhuma"
      : credencialAtual() === "retaguarda";

  async function carregar(): Promise<void> {
    if (!podeConsultar()) {
      itens = [];
      estado = { isLoading: false, error: null };
      notificar();
      return;
    }

    estado = { isLoading: true, error: null };
    notificar();

    let consulta = db.from(tabela).select("*");
    if (ordenarPor) consulta = consulta.order(ordenarPor, { ascending: ascendente });

    const { data, error } = await consulta;

    if (error) {
      estado = { isLoading: false, error: new Error(error.message) };
    } else {
      itens = (data ?? []) as T[];
      estado = { isLoading: false, error: null };
    }
    notificar();
  }

  assinarCredencial(() => {
    void carregar();
  });

  const getAll = () => itens;
  const getById = (id: string) => itens.find((i) => i.id === id);
  const getEstado = () => estado;

  const useAll = () => useSyncExternalStore(inscrever, getAll, getAll);
  const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

  const create: SupabaseStore<T>["create"] = async (dados) => {
    const { data, error } = await db.from(tabela).insert(dados).select().single();
    if (error) throw new Error(error.message);
    await carregar();
    return data as T;
  };

  const update: SupabaseStore<T>["update"] = async (id, patch) => {
    const { error } = await db.from(tabela).update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await carregar();
  };

  const setAtivo: SupabaseStore<T>["setAtivo"] = (id, ativo) =>
    update(id, { ativo } as unknown as Partial<Omit<T, "id" | "created_at">>);

  return { getAll, getById, useAll, useEstado, create, update, setAtivo, retry: carregar };
}
