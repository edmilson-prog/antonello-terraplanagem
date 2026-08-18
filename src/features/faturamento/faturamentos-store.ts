import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { calcularValorTotal, gerarItens } from "@/features/faturamento/calculo";
import { proximoNumeroFAT } from "@/features/faturamento/numero-faturamento";
import type {
  Apontamento,
  Equipamento,
  Faturamento,
  FaturamentoItem,
  PrecoFundacao,
  PrecoHoraMaquina,
} from "@/shared/types";

/*
 * Faturamentos (Onda 21) — saiu do mock em memória para o Supabase.
 *
 * `itens` mora na tabela filha `faturamento_itens` (normalizada no banco, ao
 * contrário do mock que embutia o array na própria linha). Mesmo desenho de
 * `orcamentos-store`, inclusive no delete + reinsert ao atualizar itens: um
 * faturamento tem poucos itens, então diff incremental não compensa.
 *
 * Faturamento é dado financeiro puro: nunca chega ao app de campo, e as duas
 * tabelas só têm policy para `authenticated` com is_retaguarda(). Sem sessão da
 * retaguarda, as consultas voltariam 401 — daí o guard de credencial.
 */

export type ResultadoConfirmar =
  | { ok: true; faturamento: Faturamento }
  | { ok: false; motivo: string };

export type PatchFaturamento = Partial<Pick<Faturamento, "itens" | "desconto" | "observacao">>;

type FaturamentoRow = Omit<Faturamento, "itens">;
type FaturamentoItemRow = FaturamentoItem & { faturamento_id: string };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: Faturamento[] = [];
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

  const [{ data: linhas, error: errLinhas }, { data: itensLinhas, error: errItens }] =
    await Promise.all([
      supabase
        .from("faturamentos")
        .select("*")
        .order("gerado_em", { ascending: false })
        .returns<FaturamentoRow[]>(),
      supabase.from("faturamento_itens").select("*").returns<FaturamentoItemRow[]>(),
    ]);

  const error = errLinhas ?? errItens;
  if (error) {
    estado = { isLoading: false, error: new Error(error.message) };
    notificar();
    return;
  }

  const porFaturamento = new Map<string, FaturamentoItem[]>();
  for (const { faturamento_id, ...item } of itensLinhas ?? []) {
    const lista = porFaturamento.get(faturamento_id) ?? [];
    lista.push(item);
    porFaturamento.set(faturamento_id, lista);
  }

  itens = (linhas ?? []).map((linha) => ({
    ...linha,
    itens: porFaturamento.get(linha.id) ?? [],
  }));
  estado = { isLoading: false, error: null };
  notificar();
}

assinarCredencial(() => {
  void carregar();
});

const listar = () => itens;
const obter = (id: string) => itens.find((f) => f.id === id);
const getEstado = () => estado;

async function gravarItens(faturamentoId: string, lista: FaturamentoItem[]): Promise<void> {
  const { error: erroDelete } = await supabase
    .from("faturamento_itens")
    .delete()
    .eq("faturamento_id", faturamentoId);
  if (erroDelete) throw new Error(erroDelete.message);

  if (lista.length === 0) return;

  const { error } = await supabase
    .from("faturamento_itens")
    .insert(lista.map(({ id: _id, ...item }) => ({ ...item, faturamento_id: faturamentoId })));
  if (error) throw new Error(error.message);
}

async function gerarDeOS(
  os: {
    id: string;
    cliente_id: string;
    modelo_cobranca: Faturamento["modelo_cobranca"];
    diametro_broca_mm: number | null;
  },
  apontamentos: Apontamento[],
  equipamentos: Equipamento[],
  precosHM: PrecoHoraMaquina[],
  precosFund: PrecoFundacao[],
): Promise<Faturamento> {
  const ano = new Date().getFullYear();
  const itensFat = gerarItens(
    os as Parameters<typeof gerarItens>[0],
    apontamentos,
    equipamentos,
    precosHM,
    precosFund,
  );

  const { data, error } = await supabase
    .from("faturamentos")
    .insert({
      numero: proximoNumeroFAT(itens, ano),
      os_id: os.id,
      cliente_id: os.cliente_id,
      modelo_cobranca: os.modelo_cobranca,
      desconto: 0,
      valor_total: calcularValorTotal(itensFat, 0),
      observacao: null,
      status: "rascunho",
      faturado_em: null,
    })
    .select()
    .single()
    .returns<FaturamentoRow>();

  if (error) throw new Error(error.message);

  await gravarItens(data.id, itensFat);
  await carregar();
  return { ...data, itens: itensFat };
}

async function atualizar(id: string, patch: PatchFaturamento): Promise<void> {
  const atual = obter(id);
  if (!atual) throw new Error("Faturamento não encontrado.");

  const listaFinal = patch.itens ?? atual.itens;
  const descontoFinal = patch.desconto ?? atual.desconto;

  const { error } = await supabase
    .from("faturamentos")
    .update({
      desconto: descontoFinal,
      observacao: patch.observacao !== undefined ? patch.observacao : atual.observacao,
      valor_total: calcularValorTotal(listaFinal, descontoFinal),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (patch.itens) await gravarItens(id, patch.itens);
  await carregar();
}

async function confirmar(id: string): Promise<ResultadoConfirmar> {
  const atual = obter(id);
  if (!atual) return { ok: false, motivo: "Faturamento não encontrado." };
  if (atual.status === "faturado")
    return { ok: false, motivo: "Este faturamento já foi confirmado." };

  const { data, error } = await supabase
    .from("faturamentos")
    .update({ status: "faturado", faturado_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
    .returns<FaturamentoRow>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, faturamento: { ...data, itens: atual.itens } };
}

const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);
const useFaturamento = (id: string) =>
  useSyncExternalStore(
    inscrever,
    () => itens.find((f) => f.id === id),
    () => itens.find((f) => f.id === id),
  );

export const faturamentosStore = {
  listar,
  obter,
  gerarDeOS,
  atualizar,
  confirmar,
  useTodos,
  useEstado,
  useFaturamento,
  retry: carregar,
};
