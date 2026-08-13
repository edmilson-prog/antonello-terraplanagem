import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { calcularTotalOrcamento } from "@/features/orcamentos/calculo";
import { proximoNumeroORC } from "@/features/orcamentos/numero-orcamento";
import { podeDecidir, podeEnviar } from "@/features/orcamentos/derivacoes";
import type { Orcamento, OrcamentoItem } from "@/shared/types";

// Store reativo respaldado pelo Supabase (mesma API pública do antigo mock
// em memória) — cache em memória + notificação via useSyncExternalStore,
// recarregado do banco após cada mutação. Nada aqui lê src/mocks/ mais.
//
// `itens` mora na tabela filha `orcamento_itens` (normalizada no banco, ao
// contrário do mock antigo que embutia o array na própria linha). Toda
// atualização de itens faz delete + reinsert dos filhos daquele orçamento —
// os orçamentos têm poucos itens, então diff incremental não compensa.

export type ResultadoTransicao = { ok: true; orcamento: Orcamento } | { ok: false; motivo: string };

export type NovoOrcamento = {
  cliente_id: string;
  descricao_obra: string;
  validade: string | null;
};

export type PatchOrcamento = Partial<
  Pick<Orcamento, "itens" | "desconto" | "observacao" | "descricao_obra" | "validade">
>;

type OrcamentoRow = Omit<Orcamento, "itens">;
type OrcamentoItemRow = OrcamentoItem & { orcamento_id: string };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Orcamento[] = [];
let estado: Estado = { isLoading: true, error: null };
const ouvintes = new Set<() => void>();

const notificar = () => ouvintes.forEach((fn) => fn());
const inscrever = (fn: () => void) => {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
};

async function carregar() {
  // Orçamento é dado comercial: nunca chega ao app de campo, e `orcamentos` e
  // `orcamento_itens` só têm GRANT SELECT para `authenticated`. Sem sessão, as
  // duas consultas voltariam 401.
  if (credencialAtual() !== "retaguarda") {
    itens = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const [{ data: linhas, error: errLinhas }, { data: itensLinhas, error: errItens }] =
    await Promise.all([
      supabase
        .from("orcamentos")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<OrcamentoRow[]>(),
      supabase.from("orcamento_itens").select("*").returns<OrcamentoItemRow[]>(),
    ]);

  const error = errLinhas ?? errItens;
  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    const itensPorOrcamento = new Map<string, OrcamentoItem[]>();
    for (const { orcamento_id, ...item } of itensLinhas ?? []) {
      const lista = itensPorOrcamento.get(orcamento_id) ?? [];
      lista.push(item);
      itensPorOrcamento.set(orcamento_id, lista);
    }
    itens = (linhas ?? []).map((o) => ({ ...o, itens: itensPorOrcamento.get(o.id) ?? [] }));
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(carregar);

const listar = () => itens;
const obter = (id: string) => itens.find((o) => o.id === id);
const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useOrcamento = (id: string) =>
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

async function criar(dados: NovoOrcamento): Promise<Orcamento> {
  const ano = new Date().getFullYear();
  const numero = proximoNumeroORC(itens, ano);
  const { data, error } = await supabase
    .from("orcamentos")
    .insert({
      numero,
      cliente_id: dados.cliente_id,
      descricao_obra: dados.descricao_obra,
      desconto: 0,
      valor_total: 0,
      validade: dados.validade,
      observacao: null,
      status: "rascunho",
      os_id: null,
      enviado_em: null,
      decidido_em: null,
    })
    .select()
    .single()
    .returns<OrcamentoRow>();

  if (error) throw new Error(error.message);
  await carregar();
  return { ...data, itens: [] };
}

async function atualizar(id: string, patch: PatchOrcamento): Promise<void> {
  const atual = obter(id);
  if (!atual) throw new Error("Orçamento não encontrado.");
  const next = { ...atual, ...patch };
  const valorTotal = calcularTotalOrcamento(next.itens, next.desconto);

  if (patch.itens) {
    const { error: errDelete } = await supabase
      .from("orcamento_itens")
      .delete()
      .eq("orcamento_id", id);
    if (errDelete) throw new Error(errDelete.message);

    if (patch.itens.length > 0) {
      const { error: errInsert } = await supabase
        .from("orcamento_itens")
        .insert(patch.itens.map((item) => ({ ...item, orcamento_id: id })));
      if (errInsert) throw new Error(errInsert.message);
    }
  }

  const { error } = await supabase
    .from("orcamentos")
    .update({
      desconto: next.desconto,
      observacao: next.observacao,
      descricao_obra: next.descricao_obra,
      validade: next.validade,
      valor_total: valorTotal,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
}

async function enviar(id: string): Promise<ResultadoTransicao> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Orçamento não encontrado." };
  const r = podeEnviar(atual);
  if (!r.pode) return { ok: false, motivo: r.motivo ?? "Não é possível enviar." };

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("orcamentos")
    .update({ status: "enviado", enviado_em: agora })
    .eq("id", id);
  if (error) return { ok: false, motivo: error.message };

  await carregar();
  const enviado = obter(id);
  if (!enviado) return { ok: false, motivo: "Orçamento não encontrado após enviar." };
  return { ok: true, orcamento: enviado };
}

async function decidir(id: string, status: "aprovado" | "recusado"): Promise<ResultadoTransicao> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Orçamento não encontrado." };
  const r = podeDecidir(atual);
  if (!r.pode) return { ok: false, motivo: r.motivo ?? "Não é possível decidir." };

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("orcamentos")
    .update({ status, decidido_em: agora })
    .eq("id", id);
  if (error) return { ok: false, motivo: error.message };

  await carregar();
  const decidido = obter(id);
  if (!decidido) return { ok: false, motivo: "Orçamento não encontrado após decidir." };
  return { ok: true, orcamento: decidido };
}

const aprovar = (id: string) => decidir(id, "aprovado");
const recusar = (id: string) => decidir(id, "recusado");

async function vincularOS(id: string, osId: string): Promise<void> {
  const { error } = await supabase.from("orcamentos").update({ os_id: osId }).eq("id", id);
  if (error) throw new Error(error.message);
  await carregar();
}

export const orcamentosStore = {
  listar,
  obter,
  criar,
  atualizar,
  enviar,
  aprovar,
  recusar,
  vincularOS,
  useTodos,
  useOrcamento,
  useEstado,
  retry: carregar,
};
