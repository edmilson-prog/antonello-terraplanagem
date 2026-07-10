import "@testing-library/jest-dom";
import { vi } from "vitest";
import { equipamentos as equipamentosFixture } from "./src/mocks/equipamentos";
import { clientes as clientesFixture } from "./src/mocks/clientes";

// Impede que stores respaldados pelo Supabase (ex.: equipamentosStore,
// clientesStore) façam chamadas de rede reais durante os testes unitários —
// elas rodariam contra o projeto de produção, seriam lentas e quebrariam sob
// RLS/anon sem sessão. Cada tabela suportada tem seu próprio fixture em
// memória, seedado a partir do mock correspondente em src/mocks/.
vi.mock("./src/lib/supabase", () => {
  const tabelas: Record<string, Record<string, unknown>[]> = {
    equipamentos: equipamentosFixture.map((e) => ({ ...e })),
    clientes: clientesFixture.map((c) => ({ ...c })),
  };

  class FakeQueryBuilder implements PromiseLike<{ data: unknown; error: null }> {
    private op: "select" | "insert" | "update" = "select";
    private payload: Record<string, unknown> | undefined;
    private isSingle = false;

    constructor(private table: string) {}

    select() {
      return this;
    }
    order() {
      return this;
    }
    eq(_column: string, value: string) {
      const linhas = tabelas[this.table];
      if (this.op === "update" && linhas) {
        tabelas[this.table] = linhas.map((item) =>
          item.id === value
            ? { ...item, ...this.payload, updated_at: new Date().toISOString() }
            : item,
        );
      }
      return this;
    }
    insert(payload: Record<string, unknown>) {
      this.op = "insert";
      this.payload = payload;
      return this;
    }
    update(payload: Record<string, unknown>) {
      this.op = "update";
      this.payload = payload;
      return this;
    }
    single() {
      this.isSingle = true;
      return this;
    }
    returns() {
      return this;
    }
    then<TResult1, TResult2 = never>(
      onfulfilled?:
        | ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>)
        | null,
    ): PromiseLike<TResult1 | TResult2> {
      let data: unknown = null;
      const linhas = tabelas[this.table];
      if (linhas) {
        if (this.op === "insert") {
          const novo = {
            id: `${this.table}-teste-${linhas.length + 1}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...this.payload,
          };
          tabelas[this.table] = [...linhas, novo];
          data = this.isSingle ? novo : [novo];
        } else if (this.op === "update") {
          data = null;
        } else {
          data = linhas;
        }
      }
      return Promise.resolve(
        onfulfilled ? onfulfilled({ data, error: null }) : ({ data, error: null } as never),
      );
    }
  }

  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
    },
  };
});
