import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import type {
  CanalNotificacao,
  Notificacao,
  NotificacaoEntrega,
  PrioridadeNotificacao,
} from "@/shared/types";

/*
 * Central de notificações da retaguarda (Onda 19).
 *
 * Store separado do `notificacoes-store.ts` do app de campo, e não uma opção
 * dele, porque as duas caixas quase não têm nada em comum:
 *
 *   campo       → RPC com token opaco, cache em disco para funcionar sem sinal
 *   retaguarda  → query direta na tabela sob RLS, sem cache offline
 *
 * Três consultas, porque respondem perguntas diferentes:
 *   `minhas`     — a caixa de entrada de quem está logado (usuario_id = eu)
 *   `entregas`   — os canais de cada linha da minha caixa (os chips do kit)
 *   `entregas7d` — as métricas de entrega da FROTA nos últimos 7 dias. Estas
 *                  não saem da minha caixa: push é entregue a operador, então
 *                  as linhas pertencem às notificações deles.
 *   `doMes`      — recorte magro (só tipo/categoria/data) de TUDO que foi
 *                  disparado no mês, para "Disparos hoje" e "Mais disparadas".
 *                  Contar isso pela minha caixa daria o número errado: a maior
 *                  parte do volume vai para os operadores.
 */

/** Recorte magro de uma notificação, só o que as contagens precisam. */
export interface DisparoResumido {
  tipo: string;
  categoria: string;
  created_at: string;
}

const LIMITE = 200;

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let minhas: Notificacao[] = [];
let entregas: NotificacaoEntrega[] = [];
let entregas7d: NotificacaoEntrega[] = [];
let doMes: DisparoResumido[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

function diasAtras(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

async function carregar() {
  if (credencialAtual() !== "retaguarda") {
    minhas = [];
    entregas = [];
    entregas7d = [];
    doMes = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data: sessao } = await supabase.auth.getSession();
  const usuarioId = sessao.session?.user.id;
  if (!usuarioId) {
    minhas = [];
    entregas = [];
    entregas7d = [];
    doMes = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  const [caixa, metricas, mes] = await Promise.all([
    supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false })
      .limit(LIMITE)
      .returns<Notificacao[]>(),
    supabase
      .from("notificacoes_entregas")
      .select("*")
      .gte("created_at", diasAtras(7))
      .returns<NotificacaoEntrega[]>(),
    supabase
      .from("notificacoes")
      .select("tipo, categoria, created_at")
      .gte("created_at", diasAtras(30))
      .returns<DisparoResumido[]>(),
  ]);

  const falha = caixa.error ?? metricas.error ?? mes.error;
  if (falha) {
    estado = { isLoading: false, error: new Error(falha.message) };
    notificar();
    return;
  }

  minhas = caixa.data ?? [];
  entregas7d = metricas.data ?? [];
  doMes = mes.data ?? [];

  // Os chips de canal precisam das entregas das MINHAS linhas, que podem ser
  // mais antigas que 7 dias — daí a segunda consulta, restrita aos ids em tela.
  const ids = minhas.map((n) => n.id);
  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("notificacoes_entregas")
      .select("*")
      .in("notificacao_id", ids)
      .returns<NotificacaoEntrega[]>();
    if (error) {
      estado = { isLoading: false, error: new Error(error.message) };
      notificar();
      return;
    }
    entregas = data ?? [];
  } else {
    entregas = [];
  }

  estado = { isLoading: false, error: null };
  notificar();
}

assinarCredencial(carregar);

const listar = () => minhas;
const listarEntregas = () => entregas;
const listarEntregas7d = () => entregas7d;
const listarDoMes = () => doMes;
const getEstado = () => estado;

const useNotificacoes = () => useSyncExternalStore(inscrever, listar, listar);
const useEntregas = () => useSyncExternalStore(inscrever, listarEntregas, listarEntregas);
const useEntregas7d = () => useSyncExternalStore(inscrever, listarEntregas7d, listarEntregas7d);
const useDoMes = () => useSyncExternalStore(inscrever, listarDoMes, listarDoMes);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

async function marcarLidas(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida_em: new Date().toISOString() })
    .in("id", ids)
    .is("lida_em", null);
  if (error) throw new Error(error.message);
  await carregar();
}

async function marcarTodasLidas(): Promise<void> {
  const naoLidas = minhas.filter((n) => n.lida_em === null).map((n) => n.id);
  await marcarLidas(naoLidas);
}

export interface NovoAvisoManual {
  operadorIds: string[];
  canais: CanalNotificacao[];
  prioridade: PrioridadeNotificacao;
  titulo: string;
  mensagem: string;
  os_id: string | null;
  acao: string | null;
  /** ISO; null envia agora. No futuro, quem entrega é o cron de agendadas. */
  agendada_para: string | null;
}

// Uma linha por operador — o trigger de entrega roda por linha, então cada um
// tem o próprio push, o próprio registro e o próprio "lida em".
async function criarAvisoManual(input: NovoAvisoManual): Promise<number> {
  if (input.operadorIds.length === 0) {
    throw new Error("Selecione ao menos um operador.");
  }

  const linhas = input.operadorIds.map((operadorId) => ({
    operador_id: operadorId,
    usuario_id: null,
    tipo: "aviso_manual" as const,
    categoria: "sistema" as const,
    prioridade: input.prioridade,
    titulo: input.titulo.trim(),
    mensagem: input.mensagem.trim(),
    acao: input.acao,
    os_id: input.os_id,
    canais: input.canais,
    agendada_para: input.agendada_para,
  }));

  const { error } = await supabase.from("notificacoes").insert(linhas);
  if (error) throw new Error(error.message);
  await carregar();
  return linhas.length;
}

export const notificacoesRetaguardaStore = {
  listar,
  listarEntregas,
  listarEntregas7d,
  listarDoMes,
  useNotificacoes,
  useEntregas,
  useEntregas7d,
  useDoMes,
  useEstado,
  marcarLidas,
  marcarTodasLidas,
  criarAvisoManual,
  retry: carregar,
};
