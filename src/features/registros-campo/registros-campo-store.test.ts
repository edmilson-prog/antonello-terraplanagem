import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { registrosCampoStore } from "./registros-campo-store";
import { gravarSessaoOperador, encerrarSessaoOperador } from "@/features/auth/operador-session";
import type { NovoRegistroCampo } from "./tipos";

/*
 * A fila offline dos registros de campo (Onda 22).
 *
 * O que estes testes protegem é a promessa que a tela faz ao operador: "salvo
 * no aparelho" tem de continuar verdadeiro sem rede, e o registro tem de
 * chegar à central quando houver rede — sem duplicar e sem sumir no caminho.
 *
 * Dois detalhes de montagem que valem explicar:
 *
 * 1. Cada teste entra com um operador DIFERENTE. Não é capricho: o dublê
 *    guarda as linhas entre os testes do arquivo, e `carregar()` traria de
 *    volta o que o teste anterior gravou. Usar um operador por teste isola
 *    pelo mesmo mecanismo que isola de verdade em produção — o filtro por
 *    operador dentro da RPC.
 * 2. `registrar()` já dispara o flush sozinho. Quem quer observar o envio
 *    precisa espionar ANTES de registrar, senão a fila já subiu.
 */

const OPERADOR_BASE = "22222222-2222-4222-8222-2222222222";
let contador = 0;

function entrarComoOperadorNovo() {
  contador += 1;
  const sufixo = String(contador).padStart(2, "0");
  gravarSessaoOperador({
    token: `11111111-1111-4111-8111-1111111111${sufixo}`,
    operadorId: `${OPERADOR_BASE}${sufixo}`,
    operadorNome: `Operador ${sufixo}`,
    expiraEm: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
}

/* Thenable no formato que o supabase-js devolve — com e sem `.returns()`. */
function respostaComErro(message: string) {
  const resultado = { data: null, error: { message } };
  const thenable = {
    returns: () => thenable,
    then: (fn: (v: unknown) => unknown) => Promise.resolve(fn(resultado)),
  };
  return thenable as never;
}

const mockarSemRede = () => vi.spyOn(supabase, "rpc").mockReturnValue(respostaComErro("sem rede"));

const CHECKLIST: NovoRegistroCampo = {
  tipo: "checklist",
  dados: { itens: [{ chave: "cinto", conforme: true }], nao_conformes: 0, horimetro: 1200 },
};

const MEDICAO: NovoRegistroCampo = {
  tipo: "medicao_assinada",
  dados: {
    responsavel: "Cliente Teste",
    horas_periodo: 8,
    assinatura: "data:image/png;base64,AAAA",
  },
};

beforeEach(async () => {
  window.localStorage.clear();
  registrosCampoStore.limparFilaLocal();
  entrarComoOperadorNovo();
  // Deixa a carga inicial disparada pela troca de credencial terminar, para
  // que ela não caia no meio do teste.
  await registrosCampoStore.retry();
  registrosCampoStore.limparFilaLocal();
});

afterEach(() => {
  encerrarSessaoOperador();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("registrosCampoStore — gravar em campo", () => {
  it("grava no aparelho de forma síncrona, sem esperar a rede", () => {
    // Não é `await`: a tela de campo confirma na hora, com ou sem sinal. Se
    // isto virar assíncrono um dia, o operador passa a esperar a rede no
    // fundo da obra — que é exatamente o que o ADR-001 proíbe.
    const registro = registrosCampoStore.registrar(CHECKLIST);

    expect(registro.pendente_sync).toBe(true);
    expect(registrosCampoStore.listar()).toHaveLength(1);
  });

  it("sobrevive a fechar o app: fica gravado no localStorage", () => {
    mockarSemRede();
    registrosCampoStore.registrar(CHECKLIST);

    const bruto = window.localStorage.getItem("antonello.registros_campo");
    expect(bruto).toBeTruthy();
    expect(JSON.parse(bruto!)).toHaveLength(1);
  });

  it("cada registro nasce com op_id próprio", () => {
    mockarSemRede();
    const a = registrosCampoStore.registrar(CHECKLIST);
    const b = registrosCampoStore.registrar(CHECKLIST);
    expect(a.op_id).not.toBe(b.op_id);
  });
});

describe("registrosCampoStore — flush para a central", () => {
  it("envia os pendentes e os marca como confirmados", async () => {
    registrosCampoStore.registrar(CHECKLIST);
    await registrosCampoStore.flush();

    expect(registrosCampoStore.listar().every((r) => !r.pendente_sync)).toBe(true);
  });

  it("não reenvia o que já foi confirmado", async () => {
    registrosCampoStore.registrar(CHECKLIST);
    await registrosCampoStore.flush();

    const espiao = vi.spyOn(supabase, "rpc");
    await registrosCampoStore.flush();

    expect(espiao).not.toHaveBeenCalled();
    expect(registrosCampoStore.listar()).toHaveLength(1);
  });

  it("reenviar o mesmo op_id não duplica no servidor", async () => {
    const registro = registrosCampoStore.registrar(CHECKLIST);
    await registrosCampoStore.flush();

    // Simula a confirmação perdida: o aparelho acha que ainda está pendente
    // e manda de novo. É o caso que o `op_id` existe para resolver.
    await supabase.rpc("registrar_registro_campo", {
      p_token: `11111111-1111-4111-8111-1111111111${String(contador).padStart(2, "0")}`,
      p_id: crypto.randomUUID(),
      p_op_id: registro.op_id,
      p_tipo: registro.tipo,
      p_dados: registro.dados as never,
      p_registrado_em: registro.registrado_em,
    });

    await registrosCampoStore.retry();
    expect(registrosCampoStore.listar()).toHaveLength(1);
  });

  it("registro que falha continua pendente e não some", async () => {
    mockarSemRede();
    registrosCampoStore.registrar(CHECKLIST);
    await registrosCampoStore.flush();

    // O ponto do teste: perder a rede não pode perder o registro.
    expect(registrosCampoStore.listar()).toHaveLength(1);
    expect(registrosCampoStore.listar()[0].pendente_sync).toBe(true);
  });

  it("não tenta enviar quando não há sessão de operador", async () => {
    mockarSemRede();
    registrosCampoStore.registrar(CHECKLIST);
    encerrarSessaoOperador();

    const espiao = vi.spyOn(supabase, "rpc");
    await registrosCampoStore.flush();

    expect(espiao).not.toHaveBeenCalled();
    expect(registrosCampoStore.listar()[0].pendente_sync).toBe(true);
  });

  it("manda a hora do FATO, não a da sincronização", async () => {
    const espiao = vi.spyOn(supabase, "rpc");
    const registro = registrosCampoStore.registrar(CHECKLIST);
    await registrosCampoStore.flush();

    const [, args] = espiao.mock.calls[0] as [string, Record<string, unknown>];
    expect(args.p_registrado_em).toBe(registro.registrado_em);
  });
});

describe("registrosCampoStore — assinatura do cliente (LGPD)", () => {
  it("envia a assinatura fora do jsonb, em campo próprio", async () => {
    const espiao = vi.spyOn(supabase, "rpc");
    registrosCampoStore.registrar(MEDICAO);
    await registrosCampoStore.flush();

    const [, args] = espiao.mock.calls[0] as [string, Record<string, unknown>];
    expect(args.p_assinatura).toBe("data:image/png;base64,AAAA");
    expect(args.p_dados).not.toHaveProperty("assinatura");
  });

  it("apaga a assinatura do aparelho depois de confirmada", async () => {
    registrosCampoStore.registrar(MEDICAO);
    await registrosCampoStore.flush();

    const medicao = registrosCampoStore.listar()[0];
    expect(medicao.pendente_sync).toBe(false);
    // Dado pessoal não fica no celular além do necessário: a central já tem.
    expect((medicao.dados as { assinatura: string | null }).assinatura).toBeNull();
  });

  it("mantém a assinatura enquanto o envio não foi confirmado", async () => {
    mockarSemRede();
    registrosCampoStore.registrar(MEDICAO);
    await registrosCampoStore.flush();

    // Apagar antes de confirmar perderia a assinatura para sempre.
    const medicao = registrosCampoStore.listar()[0];
    expect((medicao.dados as { assinatura: string | null }).assinatura).toBe(
      "data:image/png;base64,AAAA",
    );
  });
});

describe("registrosCampoStore — mescla com a central", () => {
  it("traz o que a central tem e não descarta o que ainda está pendente", async () => {
    // Um registro sobe...
    registrosCampoStore.registrar(CHECKLIST);
    await registrosCampoStore.flush();

    // ...e outro é feito sem rede.
    const semRede = mockarSemRede();
    registrosCampoStore.registrar({
      tipo: "paralisacao",
      dados: { motivo: "chuva", duracao_horas: 2, observacao: null },
    });
    await registrosCampoStore.flush();
    semRede.mockRestore();

    await registrosCampoStore.retry();

    const tipos = registrosCampoStore.listar().map((r) => r.tipo);
    expect(tipos).toContain("checklist");
    expect(tipos).toContain("paralisacao");
  });
});
