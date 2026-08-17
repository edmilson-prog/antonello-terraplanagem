import "@testing-library/jest-dom";
import { vi } from "vitest";
import { equipamentos as equipamentosFixture } from "./src/mocks/equipamentos";
import { clientes as clientesFixture } from "./src/mocks/clientes";
import { ordensServico as ordensFixture } from "./src/mocks/ordens-servico";
import { orcamentos as orcamentosFixture } from "./src/mocks/orcamentos";
import { avisosWhatsApp as avisosWhatsAppFixture } from "./src/mocks/avisos-whatsapp";
import { operadores as operadoresFixture } from "./src/mocks/operadores";
import { apontamentos as apontamentosFixture } from "./src/mocks/apontamentos";
import { contasPagar as contasPagarFixture } from "./src/mocks/contas-pagar";

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

// jsdom também não implementa ResizeObserver — usado internamente por
// primitivos Radix (ex.: Checkbox, via @radix-ui/react-use-size) para medir
// o elemento antes de renderizar o indicador. Sem este polyfill, qualquer
// teste que monte esses componentes quebra com "ResizeObserver is not defined".
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom não implementa scrollIntoView nem a Pointer Capture API — usadas pelo
// Radix Select ao abrir/fechar o listbox e posicionar o item selecionado.
// Sem estes polyfills, qualquer teste que abra um <Select> obrigatório (ex.:
// Equipamento em ComponenteCustoForm) quebra com "scrollIntoView is not a
// function" ao montar o SelectContent.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// Impede que stores respaldados pelo Supabase (ex.: equipamentosStore,
// clientesStore, ordensStore, orcamentosStore) façam chamadas de rede reais
// durante os testes unitários — elas rodariam contra o projeto de produção,
// seriam lentas e quebrariam sob RLS/anon sem sessão. Cada tabela suportada
// tem seu próprio fixture em memória, seedado a partir do mock correspondente
// em src/mocks/. orcamento_itens é a tabela filha de orcamentos (itens vêm
// normalizados no banco real, não embutidos na linha).
vi.mock("./src/lib/supabase", () => {
  /*
   * A retaguarda entra logada por padrão: as telas do /admin só existem sob
   * sessão, e os stores dessas tabelas agora só consultam quando há credencial
   * (ver src/lib/credencial.ts). Testes que precisam do cenário oposto — boot
   * sem sessão, como a landing pública ou o app de campo — derrubam a sessão
   * com emitirAuthStateParaTeste("SIGNED_OUT", null).
   */
  const SESSAO_RETAGUARDA = { user: { id: "usuario-retaguarda-teste" } };

  const tabelas: Record<string, Record<string, unknown>[]> = {
    equipamentos: equipamentosFixture.map((e) => ({ ...e })),
    clientes: clientesFixture.map((c) => ({ ...c })),
    ordens_servico: ordensFixture.map((o) => ({ ...o })),
    orcamentos: orcamentosFixture.map(({ itens: _itens, ...o }) => ({ ...o })),
    orcamento_itens: orcamentosFixture.flatMap((o) =>
      o.itens.map((item) => ({ ...item, orcamento_id: o.id })),
    ),
    avisos_whatsapp: avisosWhatsAppFixture.map((a) => ({ ...a })),
    operadores: operadoresFixture.map((o) => ({ ...o })),
    operadores_equipamentos: [],
    apontamentos: apontamentosFixture.map((a) => ({ ...a })),
    // contas_pagar saiu do mock em memória na Onda 17; o dublê passa a servir
    // as mesmas linhas que o banco foi semeado.
    contas_pagar: contasPagarFixture.map((c) => ({ ...c })),
    compras_diesel: [],
    usuarios_retaguarda: [{ id: "usuario-retaguarda-teste", nome: "Admin Teste", perfil: "admin" }],
  };

  class FakeQueryBuilder implements PromiseLike<{ data: unknown; error: null }> {
    private op: "select" | "insert" | "update" | "delete" = "select";
    private payload: Record<string, unknown> | Record<string, unknown>[] | undefined;
    private isSingle = false;
    private isMaybeSingle = false;
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
    // Usado por useUsuarioRetaguarda() para resolver o perfil do usuário logado.
    maybeSingle() {
      this.isMaybeSingle = true;
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
        data = this.isMaybeSingle ? (selecionadas[0] ?? null) : selecionadas;
      }
      return Promise.resolve(
        onfulfilled ? onfulfilled({ data, error: null }) : ({ data, error: null } as never),
      );
    }
  }

  interface RespostaRpc {
    data: unknown;
    error: { message: string; code?: string } | null;
  }

  // As RPCs do operador são consumidas como `.rpc(...).returns<T>()`, então o
  // dublê precisa devolver algo encadeável — e não uma Promise crua.
  const respostaRpc = (data: unknown, error: RespostaRpc["error"] = null) => {
    const resultado: RespostaRpc = { data, error };
    const thenable = {
      returns: () => thenable,
      then: <T>(onfulfilled?: ((valor: RespostaRpc) => T | PromiseLike<T>) | null) =>
        Promise.resolve(onfulfilled ? onfulfilled(resultado) : (resultado as never)),
    };
    return thenable;
  };

  // Espelha operador_do_token() lendo a sessão que o teste gravou com
  // gravarSessaoOperador(). Valida o token de fato: um store que mandasse o
  // token errado cairia aqui, como cairia no banco.
  const operadorDoToken = (token: string): string | null => {
    try {
      const raw = globalThis.localStorage?.getItem("antonello.sessao_operador");
      if (!raw) return null;
      const sessao = JSON.parse(raw) as { token: string; operadorId: string; expiraEm: string };
      if (sessao.token !== token) return null;
      if (new Date(sessao.expiraEm).getTime() <= Date.now()) return null;
      return sessao.operadorId;
    } catch {
      return null;
    }
  };

  const SESSAO_INVALIDA = { message: "Sessão inválida ou expirada", code: "28000" };

  // Assinantes de onAuthStateChange. O login da retaguarda não recarrega a
  // página (navigate({ to: "/admin" })), então quem depende da sessão só fica
  // sabendo por este canal — é o que os testes emitem com
  // emitirAuthStateParaTeste() para simular "entrou sem reload".
  type OuvinteAuth = (evento: string, session: { user: { id: string } } | null) => void;
  const ouvintesAuth = new Set<OuvinteAuth>();

  // Mesma regra de ordens_do_operador_ids() no banco: responsável OU com
  // apontamento meu. A fonte da verdade é o SQL da migration; aqui é só o
  // suficiente para os testes exercitarem o caminho do operador.
  const idsOrdensDoOperador = (operadorId: string) =>
    (tabelas.ordens_servico ?? [])
      .filter(
        (os) =>
          os.responsavel_id === operadorId ||
          (tabelas.apontamentos ?? []).some(
            (a) => a.os_id === os.id && a.operador_id === operadorId,
          ),
      )
      .map((os) => os.id as string);

  const porCampoDesc =
    (campo: string) => (a: Record<string, unknown>, b: Record<string, unknown>) =>
      String(b[campo] ?? "").localeCompare(String(a[campo] ?? ""));

  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
      rpc: (fn: string, args: Record<string, unknown> = {}) => {
        if (fn === "listar_ordens_operador") {
          const operadorId = operadorDoToken(String(args.p_token ?? ""));
          if (!operadorId) return respostaRpc(null, SESSAO_INVALIDA);
          const ids = idsOrdensDoOperador(operadorId);
          return respostaRpc(
            (tabelas.ordens_servico ?? [])
              .filter((os) => ids.includes(os.id as string))
              .sort(porCampoDesc("aberta_em")),
          );
        }

        if (fn === "listar_apontamentos_operador") {
          const operadorId = operadorDoToken(String(args.p_token ?? ""));
          if (!operadorId) return respostaRpc(null, SESSAO_INVALIDA);
          const ids = idsOrdensDoOperador(operadorId);
          return respostaRpc(
            (tabelas.apontamentos ?? [])
              .filter((a) => a.operador_id === operadorId || ids.includes(a.os_id as string))
              .sort(porCampoDesc("iniciado_em")),
          );
        }

        if (fn === "iniciar_apontamento") {
          const operadorId = operadorDoToken(String(args.p_token ?? ""));
          if (!operadorId) return respostaRpc(null, SESSAO_INVALIDA);

          const existente = (tabelas.apontamentos ?? []).find((a) => a.id === args.p_id);
          if (existente) {
            // Reenvio da fila offline: devolve o que já existe, sem duplicar.
            if (existente.operador_id !== operadorId) {
              return respostaRpc(null, {
                message: "Apontamento de outro operador",
                code: "42501",
              });
            }
            return respostaRpc([existente]);
          }

          if (
            (tabelas.apontamentos ?? []).some(
              (a) => a.operador_id === operadorId && a.status === "em_andamento",
            )
          ) {
            return respostaRpc(null, {
              message: "Já existe apontamento em andamento",
              code: "55006",
            });
          }

          const agora = new Date().toISOString();
          const observacao = String(args.p_observacao ?? "").trim();
          const novo = {
            id: args.p_id,
            equipamento_id: args.p_equipamento_id,
            operador_id: operadorId,
            os_id: args.p_os_id ?? null,
            horimetro_inicial: args.p_horimetro_inicial,
            horimetro_final: null,
            horas_trabalhadas: null,
            foto_inicial_url: args.p_foto_inicial_url ?? null,
            foto_final_url: null,
            observacao: observacao === "" ? null : observacao,
            modalidade: args.p_modalidade ?? null,
            metros_executados: null,
            status: "em_andamento",
            pendente_sync: false,
            iniciado_em: agora,
            finalizado_em: null,
            created_at: agora,
            updated_at: agora,
          };
          tabelas.apontamentos = [novo, ...(tabelas.apontamentos ?? [])];
          return respostaRpc([novo]);
        }

        if (fn === "finalizar_apontamento") {
          const operadorId = operadorDoToken(String(args.p_token ?? ""));
          if (!operadorId) return respostaRpc(null, SESSAO_INVALIDA);

          const atual = (tabelas.apontamentos ?? []).find((a) => a.id === args.p_id);
          if (!atual || atual.operador_id !== operadorId) {
            return respostaRpc(null, { message: "Apontamento não encontrado", code: "P0002" });
          }

          const final = Number(args.p_horimetro_final);
          if (atual.status === "finalizado") {
            if (Number(atual.horimetro_final) === final) return respostaRpc([atual]);
            return respostaRpc(null, { message: "Apontamento já finalizado", code: "55000" });
          }
          if (!Number.isFinite(final) || final < Number(atual.horimetro_inicial)) {
            return respostaRpc(null, {
              message: "Horímetro final menor que o inicial",
              code: "22023",
            });
          }

          const agora = new Date().toISOString();
          const nota = String(args.p_observacao ?? "").trim();
          const atualizado = {
            ...atual,
            horimetro_final: final,
            horas_trabalhadas: Math.round((final - Number(atual.horimetro_inicial)) * 10) / 10,
            foto_final_url: args.p_foto_final_url ?? atual.foto_final_url,
            metros_executados: args.p_metros_executados ?? atual.metros_executados,
            observacao:
              nota === "" ? atual.observacao : [atual.observacao, nota].filter(Boolean).join("\n"),
            status: "finalizado",
            pendente_sync: false,
            finalizado_em: agora,
            updated_at: agora,
          };
          tabelas.apontamentos = (tabelas.apontamentos ?? []).map((a) =>
            a.id === args.p_id ? atualizado : a,
          );
          return respostaRpc([atualizado]);
        }

        if (fn === "criar_operador") {
          const agora = new Date().toISOString();
          const id = `operadores-teste-${(tabelas.operadores?.length ?? 0) + 1}`;
          const novo = {
            id,
            nome: String(args.p_nome ?? "").trim(),
            telefone: args.p_telefone ? String(args.p_telefone).trim() : null,
            cpf: String(args.p_cpf ?? "").replace(/\D/g, ""),
            ativo: (args.p_ativo as boolean | undefined) ?? true,
            vinculo: (args.p_vinculo as string | null | undefined) ?? null,
            data_nascimento: (args.p_data_nascimento as string | null | undefined) ?? null,
            cnh_categoria: (args.p_cnh_categoria as string | null | undefined) ?? null,
            cnh_validade: (args.p_cnh_validade as string | null | undefined) ?? null,
            base: (args.p_base as string | null | undefined) ?? null,
            created_at: agora,
            updated_at: agora,
          };
          tabelas.operadores = [...(tabelas.operadores ?? []), novo];
          const equipamentosIds = (args.p_equipamentos_ids as string[] | null | undefined) ?? [];
          tabelas.operadores_equipamentos = [
            ...(tabelas.operadores_equipamentos ?? []),
            ...equipamentosIds.map((equipamentoId) => ({
              operador_id: id,
              equipamento_id: equipamentoId,
              created_at: agora,
            })),
          ];
          return respostaRpc(novo);
        }
        return respostaRpc(null, { message: `RPC "${fn}" não mockada em vitest.setup.ts` });
      },
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
      },
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getSession: vi
          .fn()
          .mockResolvedValue({ data: { session: SESSAO_RETAGUARDA }, error: null }),
        onAuthStateChange: (ouvinte: OuvinteAuth) => {
          ouvintesAuth.add(ouvinte);
          return {
            data: { subscription: { unsubscribe: () => ouvintesAuth.delete(ouvinte) } },
          };
        },
      },
    },
    // Stores (ex.: operadoresStore, orcamentosStore) aguardam esta promise
    // antes da carga inicial — ver src/lib/supabase.ts.
    sessaoRestaurada: Promise.resolve({ data: { session: SESSAO_RETAGUARDA }, error: null }),
    // Só para os testes: simula o login/logout da retaguarda acontecendo com a
    // aplicação já de pé, sem reload.
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => {
      ouvintesAuth.forEach((ouvinte) => ouvinte(evento, session));
    },
  };
});
