import "@testing-library/jest-dom";
import { vi } from "vitest";
import { equipamentos as equipamentosFixture } from "./src/mocks/equipamentos";
import { clientes as clientesFixture } from "./src/mocks/clientes";
import { ordensServico as ordensFixture } from "./src/mocks/ordens-servico";
import { orcamentos as orcamentosFixture } from "./src/mocks/orcamentos";
import { avisosWhatsApp as avisosWhatsAppFixture } from "./src/mocks/avisos-whatsapp";

// jsdom (ambiente de teste deste projeto) não implementa window.matchMedia por
// padrão. Vários componentes/hooks usam prefers-color-scheme (useTheme) e
// prefers-reduced-motion (useCountUp, useRevealOnScroll) — sem este polyfill,
// qualquer teste que os renderize quebra com "matchMedia is not a function".
// Testes que precisam simular prefers-reduced-motion: reduce sobrescrevem isso
// com vi.stubGlobal("matchMedia", ...) e limpam com vi.unstubAllGlobals().
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Impede que stores respaldados pelo Supabase (ex.: equipamentosStore,
// clientesStore, ordensStore, orcamentosStore) façam chamadas de rede reais
// durante os testes unitários — elas rodariam contra o projeto de produção,
// seriam lentas e quebrariam sob RLS/anon sem sessão. Cada tabela suportada
// tem seu próprio fixture em memória, seedado a partir do mock correspondente
// em src/mocks/. orcamento_itens é a tabela filha de orcamentos (itens vêm
// normalizados no banco real, não embutidos na linha).
vi.mock("./src/lib/supabase", () => {
  const tabelas: Record<string, Record<string, unknown>[]> = {
    equipamentos: equipamentosFixture.map((e) => ({ ...e })),
    clientes: clientesFixture.map((c) => ({ ...c })),
    ordens_servico: ordensFixture.map((o) => ({ ...o })),
    orcamentos: orcamentosFixture.map(({ itens: _itens, ...o }) => ({ ...o })),
    orcamento_itens: orcamentosFixture.flatMap((o) =>
      o.itens.map((item) => ({ ...item, orcamento_id: o.id })),
    ),
    avisos_whatsapp: avisosWhatsAppFixture.map((a) => ({ ...a })),
  };

  class FakeQueryBuilder implements PromiseLike<{ data: unknown; error: null }> {
    private op: "select" | "insert" | "update" | "delete" = "select";
    private payload: Record<string, unknown> | Record<string, unknown>[] | undefined;
    private isSingle = false;
    private filtros: Array<[string, unknown]> = [];
    private ordem: { coluna: string; ascending: boolean } | null = null;

    constructor(private table: string) {}

    select() {
      return this;
    }
    order(coluna: string, opts?: { ascending?: boolean }) {
      this.ordem = { coluna, ascending: opts?.ascending ?? true };
      return this;
    }
    eq(coluna: string, valor: unknown) {
      this.filtros.push([coluna, valor]);
      return this;
    }
    insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
      this.op = "insert";
      this.payload = payload;
      return this;
    }
    update(payload: Record<string, unknown>) {
      this.op = "update";
      this.payload = payload;
      return this;
    }
    delete() {
      this.op = "delete";
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
      const linhas = tabelas[this.table] ?? [];
      const combina = (item: Record<string, unknown>) =>
        this.filtros.every(([coluna, valor]) => item[coluna] === valor);

      if (this.op === "insert") {
        const payloads = Array.isArray(this.payload) ? this.payload : [this.payload!];
        const novos = payloads.map((p, i) => ({
          id: `${this.table}-teste-${linhas.length + i + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...p,
        }));
        tabelas[this.table] = [...linhas, ...novos];
        data = this.isSingle ? novos[0] : novos;
      } else if (this.op === "update") {
        tabelas[this.table] = linhas.map((item) =>
          combina(item) ? { ...item, ...this.payload, updated_at: new Date().toISOString() } : item,
        );
        data = null;
      } else if (this.op === "delete") {
        tabelas[this.table] = linhas.filter((item) => !combina(item));
        data = null;
      } else {
        const selecionadas = this.filtros.length > 0 ? linhas.filter(combina) : [...linhas];
        if (this.ordem) {
          const { coluna, ascending } = this.ordem;
          selecionadas.sort((a, b) => {
            const av = String(a[coluna] ?? "");
            const bv = String(b[coluna] ?? "");
            if (av === bv) return 0;
            const cmp = av > bv ? 1 : -1;
            return ascending ? cmp : -cmp;
          });
        }
        data = selecionadas;
      }
      return Promise.resolve(
        onfulfilled ? onfulfilled({ data, error: null }) : ({ data, error: null } as never),
      );
    }
  }

  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
      },
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    },
  };
});
