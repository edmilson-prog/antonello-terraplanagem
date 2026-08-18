import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { proximoNumeroCMP } from "@/features/comprovantes/numero-comprovante";
import type { Comprovante } from "@/shared/types";

/*
 * Comprovantes (Onda 21) — saiu do mock em memória para o Supabase.
 *
 * Ciclo de vida próprio (pendente → assinado/recusado, ambos terminais), sem
 * soft-delete, então não usa o factory de CRUD: as transições são o que a store
 * protege.
 *
 * Hoje só a retaguarda consome. O PRD-011 prevê a assinatura capturada no
 * aparelho do operador, em campo — quando essa tela existir, vai precisar de
 * RPC com token, como as de OS, apontamento, manutenção e abastecimento.
 */

export type ResultadoComprovante =
  | { ok: true; comprovante: Comprovante }
  | { ok: false; motivo: string };

export type NovoComprovante = {
  os_id: string;
  cliente_id: string;
  resumo_servico: string;
};

export type DadosAssinatura = {
  assinante_nome: string;
  assinatura_url: string;
};

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Comprovante[] = [];
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
  if (credencialAtual() !== "retaguarda") {
    itens = [];
    estado = { isLoading: false, error: null };
    notificar();
    return;
  }

  estado = { isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .from("comprovantes")
    .select("*")
    .order("gerado_em", { ascending: false })
    .returns<Comprovante[]>();

  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
  } else {
    itens = data ?? [];
    estado = { isLoading: false, error: null };
  }
  notificar();
}

assinarCredencial(() => {
  void carregar();
});

const listar = () => itens;
const obter = (id: string) => itens.find((c) => c.id === id);
const obterPorOS = (osId: string) => itens.find((c) => c.os_id === osId);
const getEstado = () => estado;

async function gerar(data: NovoComprovante): Promise<ResultadoComprovante> {
  if (obterPorOS(data.os_id)) {
    return { ok: false, motivo: "Esta OS já tem um comprovante gerado." };
  }

  const { data: linha, error } = await supabase
    .from("comprovantes")
    .insert({
      numero: proximoNumeroCMP(itens, new Date().getFullYear()),
      os_id: data.os_id,
      cliente_id: data.cliente_id,
      resumo_servico: data.resumo_servico,
      assinante_nome: null,
      assinatura_url: null,
      status: "pendente",
      motivo_recusa: null,
      assinado_em: null,
    })
    .select()
    .single()
    .returns<Comprovante>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, comprovante: linha };
}

async function assinar(id: string, dados: DadosAssinatura): Promise<ResultadoComprovante> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Comprovante não encontrado." };
  if (atual.status !== "pendente") {
    return { ok: false, motivo: "Só comprovantes pendentes podem ser assinados." };
  }
  if (!dados.assinante_nome.trim()) {
    return { ok: false, motivo: "Informe o nome do assinante." };
  }
  if (!dados.assinatura_url) {
    return { ok: false, motivo: "Capture a assinatura antes de confirmar." };
  }

  const { data, error } = await supabase
    .from("comprovantes")
    .update({
      status: "assinado",
      assinante_nome: dados.assinante_nome.trim(),
      assinatura_url: dados.assinatura_url,
      assinado_em: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()
    .returns<Comprovante>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, comprovante: data };
}

async function recusar(id: string, motivo: string | null): Promise<ResultadoComprovante> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Comprovante não encontrado." };
  if (atual.status !== "pendente") {
    return { ok: false, motivo: "Só comprovantes pendentes podem ser recusados." };
  }

  // Motivo é opcional, como sempre foi: a recusa pode ser registrada na hora e
  // o porquê explicado depois, por fora do sistema.
  const { data, error } = await supabase
    .from("comprovantes")
    .update({ status: "recusado", motivo_recusa: motivo?.trim() || null })
    .eq("id", id)
    .select()
    .single()
    .returns<Comprovante>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, comprovante: data };
}

const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);
const useComprovante = (id: string) =>
  useSyncExternalStore(
    inscrever,
    () => itens.find((c) => c.id === id),
    () => itens.find((c) => c.id === id),
  );

export const comprovantesStore = {
  listar,
  obter,
  obterPorOS,
  gerar,
  assinar,
  recusar,
  useTodos,
  useEstado,
  useComprovante,
  retry: carregar,
};
