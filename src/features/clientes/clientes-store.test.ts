import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { clientesStore } from "./clientes-store";

/*
 * Regressão do 401 "permission denied for table clientes".
 *
 * O bundle não tem code-splitting, então este módulo é importado no boot de
 * qualquer rota — inclusive a landing pública, a tela de login e o app de campo,
 * onde não existe sessão da retaguarda. Sem sessão o supabase-js manda a anon
 * key como Bearer, e `clientes` só tem GRANT SELECT para `authenticated`: o
 * banco devolve 42501 e o store guardava esse erro para sempre, porque a carga
 * só acontecia uma vez, no import. Como o login navega por SPA
 * (navigate({ to: "/admin" })), o erro só sumia com F5.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

// O dublê entra logado por padrão (ver vitest.setup.ts). Aqui o cenário é o
// oposto: a aplicação de pé sem sessão, como na landing pública, na tela de
// login e no app de campo.
beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(clientesStore.getAll()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("clientesStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");

    await clientesStore.retry();

    expect(espiao).not.toHaveBeenCalled();
    expect(clientesStore.useEstado === undefined).toBe(false);
  });

  it("carrega quando a retaguarda entra, sem esperar um reload", async () => {
    const espiao = vi.spyOn(supabase, "from");

    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });

    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("clientes");
    });
    await vi.waitFor(() => {
      expect(clientesStore.getAll().length).toBeGreaterThan(0);
    });
  });

  it("esvazia a lista quando a retaguarda sai", async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(clientesStore.getAll().length).toBeGreaterThan(0);
    });

    emitirAuthState("SIGNED_OUT", null);

    await vi.waitFor(() => {
      expect(clientesStore.getAll()).toHaveLength(0);
    });
  });
});
