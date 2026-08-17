import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { parametrosStore } from "@/features/parametros/parametros-store";
import type { CompraDiesel } from "@/shared/types";

// Compras de diesel para o tanque interno. Cada compra gera a conta a pagar
// correspondente (decisão de 2026-08-17) e guarda o `conta_pagar_id`, para o
// vínculo ficar rastreável e não duplicar lançamento.

export interface NovaCompraDiesel {
  litros: number;
  preco_litro: number;
  fornecedor: string | null;
  documento: string | null;
  observacao: string | null;
  comprado_em: string; // ISO
}

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: CompraDiesel[] = [];
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
    .from("compras_diesel")
    .select("*")
    .order("comprado_em", { ascending: false })
    .returns<CompraDiesel[]>();

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
const getEstado = () => estado;
const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

/** Vencimento da conta gerada: data da compra + prazo padrão dos Parâmetros. */
function vencimentoPadrao(compradoEm: string): string {
  const dias = parametrosStore.get()?.vencimento_dias ?? 30;
  const data = new Date(compradoEm);
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

const litrosFormatados = (litros: number) =>
  litros.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

/**
 * Registra a compra e a conta a pagar correspondente.
 *
 * A conta vem primeiro: se ela falhar, nada é gravado e o usuário tenta de
 * novo. Se a compra falhasse depois de a conta existir, sobraria uma conta
 * órfã no Financeiro — pior de desfazer do que repetir o lançamento.
 */
const criar = async (nova: NovaCompraDiesel): Promise<CompraDiesel> => {
  const valorTotal = Number((nova.litros * nova.preco_litro).toFixed(2));

  const conta = await contasPagarStore.criar({
    descricao: `Compra de diesel — ${litrosFormatados(nova.litros)} L`,
    fornecedor: nova.fornecedor,
    categoria: "diesel",
    valor: valorTotal,
    vencimento: vencimentoPadrao(nova.comprado_em),
    documento: nova.documento,
    forma_pagamento: null,
    observacao: nova.observacao,
  });

  const { data, error } = await supabase
    .from("compras_diesel")
    .insert({
      litros: nova.litros,
      preco_litro: nova.preco_litro,
      valor_total: valorTotal,
      fornecedor: nova.fornecedor,
      documento: nova.documento,
      observacao: nova.observacao,
      comprado_em: nova.comprado_em,
      conta_pagar_id: conta.id,
    })
    .select()
    .single()
    .returns<CompraDiesel>();

  if (error) throw new Error(error.message);
  await carregar();
  return data;
};

export const comprasDieselStore = {
  listar,
  useTodas,
  useEstado,
  criar,
  retry: carregar,
};
