import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as supabaseLib from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { abastecimentosStore } from "./abastecimentos-store";

/*
 * Abastecimentos saiu do mock em memória para o Supabase na Onda 20, e com
 * isso a fábrica `criarAbastecimentosStore` deixou de existir — o que os testes
 * exercitavam nela (validação de litros e de horímetro) mudou de lugar duas
 * vezes: continua no cliente para a tela responder na hora, e passou a existir
 * também dentro de `registrar_abastecimento_operador`, que é quem manda.
 *
 * O que sobra para testar aqui é o mesmo contrato de `contas-pagar-store` e
 * `registros-manutencao-store`: o guard de credencial, que é o risco herdado
 * por todo store que sai do mock — sem sessão a consulta volta 401 e ficava
 * presa na tela até um F5.
 */

const emitirAuthState = (
  supabaseLib as unknown as {
    emitirAuthStateParaTeste: (evento: string, session: { user: { id: string } } | null) => void;
  }
).emitirAuthStateParaTeste;

beforeEach(async () => {
  emitirAuthState("SIGNED_OUT", null);
  await vi.waitFor(() => {
    expect(abastecimentosStore.listar()).toHaveLength(0);
  });
});

afterEach(() => {
  emitirAuthState("SIGNED_OUT", null);
  vi.restoreAllMocks();
});

describe("abastecimentosStore — carga condicionada à credencial", () => {
  it("não consulta a tabela enquanto não há credencial", async () => {
    const espiao = vi.spyOn(supabase, "from");

    await abastecimentosStore.retry();

    expect(espiao).not.toHaveBeenCalled();
  });

  it("carrega quando a retaguarda entra, sem esperar um reload", async () => {
    const espiao = vi.spyOn(supabase, "from");

    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });

    await vi.waitFor(() => {
      expect(espiao).toHaveBeenCalledWith("abastecimentos");
    });
  });

  it("esvazia a lista quando a retaguarda sai", async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(abastecimentosStore.listar().length).toBeGreaterThan(0);
    });

    emitirAuthState("SIGNED_OUT", null);

    await vi.waitFor(() => {
      expect(abastecimentosStore.listar()).toHaveLength(0);
    });
  });
});

describe("abastecimentosStore — validações antes de ir ao banco", () => {
  beforeEach(async () => {
    emitirAuthState("SIGNED_IN", { user: { id: "usuario-retaguarda-1" } });
    await vi.waitFor(() => {
      expect(abastecimentosStore.listar().length).toBeGreaterThan(0);
    });
  });

  it("recusa litros zerados sem nem chamar o banco", async () => {
    const espiao = vi.spyOn(supabase, "from");
    const primeiro = abastecimentosStore.listar()[0];

    const r = await abastecimentosStore.registrar({
      equipamento_id: primeiro.equipamento_id,
      litros: 0,
      horimetro: primeiro.horimetro + 10,
    });

    expect(r).toEqual({ ok: false, erro: "litros_invalido" });
    expect(espiao).not.toHaveBeenCalled();
  });

  it("recusa horímetro menor que o do último abastecimento do equipamento", async () => {
    const primeiro = abastecimentosStore.listar()[0];

    const r = await abastecimentosStore.registrar({
      equipamento_id: primeiro.equipamento_id,
      litros: 50,
      horimetro: primeiro.horimetro - 1,
    });

    expect(r).toEqual({ ok: false, erro: "horimetro_menor_que_anterior" });
  });

  it("aceita horímetro igual ao anterior — reabastecer sem rodar é possível", async () => {
    const primeiro = abastecimentosStore.listar()[0];

    const r = await abastecimentosStore.registrar({
      equipamento_id: primeiro.equipamento_id,
      litros: 50,
      horimetro: primeiro.horimetro,
    });

    expect(r.ok).toBe(true);
  });
});
