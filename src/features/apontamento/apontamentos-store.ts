import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import type { Apontamento } from "@/shared/types";

/*
 * Store de apontamentos respaldado pelo Supabase. Dois caminhos de acesso por
 * trás da mesma API pública, escolhidos pela sessão que existe no aparelho:
 *
 * - retaguarda (/admin): sessão do Supabase Auth, lê a tabela direto sob a
 *   policy `apontamentos_retaguarda_all`;
 * - app de campo (/app): login por PIN com token opaco, role `anon`, que não
 *   enxerga tabela de negócio — lê e escreve pelas RPCs SECURITY DEFINER que
 *   recebem o token (supabase/migrations/20260812120000_operador_dados_rpcs.sql).
 *
 * O id é gerado aqui, no cliente, e é a chave de idempotência do ADR-001:
 * reenviar o mesmo apontamento depois de reconectar não duplica horas.
 */

export interface IniciarInput {
  equipamento_id: string;
  horimetro_inicial: number;
  os_id?: string | null;
  observacao?: string | null;
  foto_inicial_url?: string | null;
  modalidade?: "seca" | "operada" | null;
}

export interface FinalizarInput {
  horimetro_final: number;
  foto_final_url?: string | null;
  metros_executados?: number | null;
  /** Nota escrita no fechamento; soma-se à observação da abertura, não a substitui. */
  observacao?: string | null;
}

export type ErroFinalizar =
  | "nao_encontrado"
  | "ja_finalizado"
  | "final_menor_que_inicial"
  /** Rede fora, sessão expirada, qualquer outra falha — traz a mensagem junto. */
  | "falha";

export type FinalizarResultado =
  | { ok: true; apontamento: Apontamento }
  | { ok: false; erro: ErroFinalizar; mensagem?: string };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

// SQLSTATEs levantados pelas RPCs, traduzidos para o vocabulário da tela.
const ERRO_POR_CODIGO: Record<string, ErroFinalizar> = {
  P0002: "nao_encontrado",
  "55000": "ja_finalizado",
  "22023": "final_menor_que_inicial",
};

const MENSAGEM_POR_CODIGO: Record<string, string> = {
  "28000": "Sua sessão expirou. Entre novamente para continuar.",
  "55006": "Você já tem um apontamento em andamento. Encerre-o antes de abrir outro.",
  "22023": "Horímetro inválido.",
};

function mensagemDoErro(erro: { code?: string; message: string }): string {
  return MENSAGEM_POR_CODIGO[erro.code ?? ""] ?? erro.message;
}

let itens: Apontamento[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

interface Resposta {
  data: Apontamento[] | null;
  error: { message: string } | null;
}

function buscar(): PromiseLike<Resposta> {
  const sessao = lerSessaoOperador();
  if (sessao) {
    return supabase
      .rpc("listar_apontamentos_operador", { p_token: sessao.token })
      .returns<Apontamento[]>();
  }
  return supabase
    .from("apontamentos")
    .select("*")
    .order("iniciado_em", { ascending: false })
    .returns<Apontamento[]>();
}

async function carregar() {
  // Os dois caminhos de `buscar()` precisam de credencial: a RPC valida o token
  // do operador, e a tabela só tem GRANT SELECT para `authenticated`. Sem
  // nenhuma das duas, a consulta só renderia 401.
  if (credencialAtual() === "nenhuma") {
    itens = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await buscar();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(carregar);

const listar = () => itens;
const obter = (id: string) => itens.find((a) => a.id === id);
const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useApontamento = (id: string) =>
  useSyncExternalStore(
    inscrever,
    () => obter(id),
    () => obter(id),
  );
const useEstado = () =>
  useSyncExternalStore(
    inscrever,
    () => estado,
    () => estado,
  );

function exigirSessaoOperador() {
  const sessao = lerSessaoOperador();
  if (!sessao) throw new Error("Nenhum operador logado.");
  return sessao;
}

async function iniciar(input: IniciarInput): Promise<Apontamento> {
  const sessao = exigirSessaoOperador();
  const { data, error } = await supabase
    .rpc("iniciar_apontamento", {
      p_token: sessao.token,
      p_id: crypto.randomUUID(),
      p_equipamento_id: input.equipamento_id,
      p_horimetro_inicial: input.horimetro_inicial,
      p_os_id: input.os_id ?? undefined,
      p_observacao: input.observacao ?? undefined,
      p_foto_inicial_url: input.foto_inicial_url ?? undefined,
      p_modalidade: input.modalidade ?? undefined,
    })
    .returns<Apontamento[]>();

  if (error) throw new Error(mensagemDoErro(error));
  const criado = data?.[0];
  if (!criado) throw new Error("Não foi possível iniciar o apontamento.");

  await carregar();
  return criado;
}

async function finalizar(id: string, input: FinalizarInput): Promise<FinalizarResultado> {
  const sessao = lerSessaoOperador();
  if (!sessao) return { ok: false, erro: "falha", mensagem: "Nenhum operador logado." };

  const { data, error } = await supabase
    .rpc("finalizar_apontamento", {
      p_token: sessao.token,
      p_id: id,
      p_horimetro_final: input.horimetro_final,
      p_foto_final_url: input.foto_final_url ?? undefined,
      p_metros_executados: input.metros_executados ?? undefined,
      p_observacao: input.observacao ?? undefined,
    })
    .returns<Apontamento[]>();

  if (error) {
    return {
      ok: false,
      erro: ERRO_POR_CODIGO[error.code ?? ""] ?? "falha",
      mensagem: mensagemDoErro(error),
    };
  }
  const atualizado = data?.[0];
  if (!atualizado) return { ok: false, erro: "nao_encontrado" };

  await carregar();
  return { ok: true, apontamento: atualizado };
}

export const apontamentosStore = {
  listar,
  obter,
  useTodos,
  useApontamento,
  useEstado,
  iniciar,
  finalizar,
  retry: carregar,
};

// Filtro puro (testável) — usado pela tela "Meus apontamentos".
export function apontamentosDoOperador(lista: Apontamento[], operadorId: string): Apontamento[] {
  return lista.filter((a) => a.operador_id === operadorId);
}

// Apontamento em andamento do operador (premissa do domínio: no máximo 1 por vez,
// garantida pela RPC iniciar_apontamento).
export function apontamentoEmAndamentoDoOperador(
  lista: Apontamento[],
  operadorId: string,
): Apontamento | null {
  return apontamentosDoOperador(lista, operadorId).find((a) => a.status === "em_andamento") ?? null;
}
