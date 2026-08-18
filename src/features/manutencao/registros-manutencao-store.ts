import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import type {
  PrioridadeManutencao,
  RegistroManutencao,
  RegistroManutencaoOperador,
  TipoManutencao,
} from "@/shared/types";

// Store reativo respaldado pelo Supabase — cache em memória + notificação via
// useSyncExternalStore, recarregado do banco após cada mutação. Nada aqui lê
// src/mocks/ mais.
//
// Duas leituras, como em ordens-store: a retaguarda consulta a tabela; o app de
// campo vai pela RPC `listar_registros_manutencao_operador`, que devolve as
// mesmas linhas SEM `custo`, `fornecedor` e `observacao`. Por isso o cache é
// tipado como RegistroManutencaoOperador: no app de campo os campos financeiros
// simplesmente não chegam, e o compilador impede qualquer tela de contar com
// eles. Quem precisa de custo (Custo da Hora, tabela de ordens) roda só na
// retaguarda e usa `listarCompletos()`.
//
// Escrever é exclusivo da retaguarda: o operador não abre nem fecha manutenção.

export type ResultadoRegistrarManutencao =
  | { ok: true; registro: RegistroManutencao }
  | { ok: false; motivo: string };

export interface RegistrarManutencaoInput {
  horimetroRealizado: number;
  // Só a preventiva vinda de plano gera o próximo ciclo. Corretiva e preventiva
  // avulsa fecham sem deixar sucessora.
  intervaloHoras?: number | null;
  custo?: number | null;
  observacao?: string | null;
}

export interface CriarPrevistaInput {
  equipamento_id: string;
  plano_id: string;
  horimetro_previsto: number;
}

export interface AbrirManutencaoInput {
  equipamento_id: string;
  tipo: TipoManutencao;
  descricao: string;
  prioridade: PrioridadeManutencao;
  horimetro_abertura: number | null;
  aberta_em: string; // ISO
  custo: number | null; // estimado na abertura
  fornecedor: string | null;
  observacao: string | null;
  // Chamado do campo que originou a ordem. Omitido quando a ordem nasce no
  // escritório — o índice único no banco garante que um chamado não vire duas.
  origem_registro_campo_id?: string | null;
}

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: RegistroManutencaoOperador[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

function buscar(): PromiseLike<{
  data: RegistroManutencaoOperador[] | null;
  error: { message: string } | null;
}> {
  const sessao = lerSessaoOperador();
  if (sessao) {
    return supabase
      .rpc("listar_registros_manutencao_operador", { p_token: sessao.token })
      .returns<RegistroManutencaoOperador[]>();
  }
  return supabase
    .from("registros_manutencao")
    .select("*")
    .order("aberta_em", { ascending: false })
    .returns<RegistroManutencao[]>();
}

async function carregar() {
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
const obter = (id: string) => itens.find((r) => r.id === id);
const getEstado = () => estado;

// Na retaguarda a consulta traz a linha inteira; o cast reflete isso e existe
// para as telas de escritório que somam custo. Chamar do app de campo devolveria
// objetos sem os campos financeiros — daí o nome explícito.
const listarCompletos = () => itens as RegistroManutencao[];

const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useCompletos = () => useSyncExternalStore(inscrever, listarCompletos, listarCompletos);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

async function criarPrevista(input: CriarPrevistaInput): Promise<RegistroManutencao> {
  const { data, error } = await supabase
    .from("registros_manutencao")
    .insert({ ...input, tipo: "preventiva", status: "prevista" })
    .select()
    .single()
    .returns<RegistroManutencao>();

  if (error) throw new Error(error.message);
  await carregar();
  return data;
}

// Abre uma ordem já "em andamento": a máquina está parada na oficina a partir
// de agora. É o fluxo do botão "Nova manutenção" — sem plano, portanto com
// descrição própria (ver registros_manutencao_forma_check).
async function abrirManutencao(input: AbrirManutencaoInput): Promise<RegistroManutencao> {
  const { data, error } = await supabase
    .from("registros_manutencao")
    .insert({
      equipamento_id: input.equipamento_id,
      plano_id: null,
      tipo: input.tipo,
      descricao: input.descricao.trim(),
      prioridade: input.prioridade,
      horimetro_previsto: null,
      horimetro_abertura: input.horimetro_abertura,
      status: "em_andamento",
      aberta_em: input.aberta_em,
      custo: input.custo,
      fornecedor: input.fornecedor,
      observacao: input.observacao,
      origem_registro_campo_id: input.origem_registro_campo_id ?? null,
    })
    .select()
    .single()
    .returns<RegistroManutencao>();

  if (error) {
    // 23505 = índice único de origem: alguém já abriu ordem para este chamado
    // (duas abas, dois cliques). Vale traduzir, senão chega como ruído do
    // Postgres numa tela de cadastro.
    if (error.code === "23505") {
      throw new Error("Este chamado do campo já tem uma ordem de manutenção aberta.");
    }
    throw new Error(error.message);
  }
  await carregar();
  return data;
}

async function registrarRealizada(
  registroId: string,
  input: RegistrarManutencaoInput,
): Promise<ResultadoRegistrarManutencao> {
  const atual = obter(registroId);
  if (!atual) return { ok: false, motivo: "Registro de manutenção não encontrado." };
  if (atual.status === "realizada")
    return { ok: false, motivo: "Esta manutenção já foi registrada como realizada." };

  const agora = new Date().toISOString();
  const { data, error } = await supabase
    .from("registros_manutencao")
    .update({
      status: "realizada",
      horimetro_realizado: input.horimetroRealizado,
      custo: input.custo ?? null,
      observacao: input.observacao?.trim() ? input.observacao.trim() : null,
      realizada_em: agora,
    })
    .eq("id", registroId)
    .select()
    .single()
    .returns<RegistroManutencao>();

  if (error) return { ok: false, motivo: error.message };

  // Fechar um ciclo do plano abre o seguinte, contado a partir da leitura real
  // (e não da marca prevista) — é o que mantém o plano ancorado no horímetro.
  if (atual.plano_id && input.intervaloHoras) {
    const { error: erroProximo } = await supabase.from("registros_manutencao").insert({
      equipamento_id: atual.equipamento_id,
      plano_id: atual.plano_id,
      tipo: "preventiva",
      status: "prevista",
      horimetro_previsto: input.horimetroRealizado + input.intervaloHoras,
    });
    if (erroProximo) return { ok: false, motivo: erroProximo.message };
  }

  await carregar();
  return { ok: true, registro: data };
}

export const registrosManutencaoStore = {
  listar,
  listarCompletos,
  obter,
  useTodos,
  useCompletos,
  useEstado,
  criarPrevista,
  abrirManutencao,
  registrarRealizada,
  retry: carregar,
};
