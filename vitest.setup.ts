import "@testing-library/jest-dom";
import { vi } from "vitest";
import { equipamentos as equipamentosFixture } from "./src/mocks/equipamentos";

// Impede que stores respaldados pelo Supabase (ex.: equipamentosStore) façam
// chamadas de rede reais durante os testes unitários — eles rodariam contra o
// projeto de produção, seriam lentos e quebrariam sob RLS/anon sem sessão.
vi.mock("./src/lib/supabase", () => {
  let equipamentos = equipamentosFixture.map((e) => ({ ...e }));

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
      if (this.op === "update" && this.table === "equipamentos") {
        equipamentos = equipamentos.map((e) =>
          e.id === value ? { ...e, ...this.payload, updated_at: new Date().toISOString() } : e,
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
      onfulfilled?: ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    ): PromiseLike<TResult1 | TResult2> {
      let data: unknown = null;
      if (this.table === "equipamentos") {
        if (this.op === "insert") {
          const novo = {
            id: `eq-teste-${equipamentos.length + 1}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...this.payload,
          };
          equipamentos = [...equipamentos, novo as (typeof equipamentos)[number]];
          data = this.isSingle ? novo : [novo];
        } else if (this.op === "update") {
          data = null;
        } else {
          data = equipamentos;
        }
      }
      return Promise.resolve(onfulfilled ? onfulfilled({ data, error: null }) : ({ data, error: null } as never));
    }
  }

  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
    },
  };
});
