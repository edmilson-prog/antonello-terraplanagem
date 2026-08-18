import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import type { Abastecimento, AbastecimentoOperador, OrigemDiesel } from "@/shared/types";

/*
 * Abastecimentos (Onda 20) — saiu do mock em memória para o Supabase.
 *
 * Era a última peça da Onda 17 que ficou pela metade: `compras_diesel` nasceu
 * lendo o banco, mas os abastecimentos continuaram no mock. O saldo do tanque,
 * que cruza os dois, misturava compra real com abastecimento fictício.
 *
 * Duas leituras, como em ordens-store: a retaguarda consulta a tabela sob a
 * sessão do Supabase Auth; o app de campo vai pela RPC
 * `listar_abastecimentos_operador`, que devolve as mesmas linhas SEM
 * `preco_litro` e `custo_total` — /app/* nunca exibe valor.
 *
 * Por isso o cache é tipado como AbastecimentoOperador: no app de campo os
 * campos financeiros não chegam, e o compilador impede qualquer tela de contar
 * com eles. Quem precisa de custo (Diesel, Custo da Hora) roda só na retaguarda
 * e usa `listarCompletos()`.
 */

export interface NovoAbastecimento {
  equipamento_id: string;
  litros: number;
  horimetro: number;
  operador_id?: string | null;
  preco_litro?: number | null;
  custo_total?: number | null;
  local?: string | null;
  /** Omitido = "externo", que era o único caso antes do controle de tanque. */
  origem?: OrigemDiesel;
}

export type ResultadoAbastecimento =
  | { ok: true; abastecimento: Abastecimento }
  | {
      ok: false;
      erro: "litros_invalido" | "horimetro_menor_que_anterior" | "falha";
      motivo?: string;
    };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: AbastecimentoOperador[] = [];
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
  data: AbastecimentoOperador[] | null;
  error: { message: string } | null;
}> {
  const sessao = lerSessaoOperador();
  if (sessao) {
    return supabase
      .rpc("listar_abastecimentos_operador", { p_token: sessao.token })
      .returns<AbastecimentoOperador[]>();
  }
  return supabase
    .from("abastecimentos")
    .select("*")
    .order("abastecido_em", { ascending: false })
    .returns<AbastecimentoOperador[]>();
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

assinarCredencial(() => {
  void carregar();
});

const listar = () => itens;
const obter = (id: string) => itens.find((a) => a.id === id);
const getEstado = () => estado;

// Na retaguarda a consulta traz a linha inteira; o cast reflete isso e existe
// para as telas de escritório que somam custo.
const listarCompletos = () => itens as Abastecimento[];

const useTodos = () => useSyncExternalStore(inscrever, listar, listar);
const useCompletos = () => useSyncExternalStore(inscrever, listarCompletos, listarCompletos);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

function ultimoHorimetro(equipamentoId: string): number | null {
  const doEquipamento = itens
    .filter((a) => a.equipamento_id === equipamentoId)
    .sort((a, b) => b.abastecido_em.localeCompare(a.abastecido_em));
  return doEquipamento[0]?.horimetro ?? null;
}

/*
 * Registra o abastecimento. Dois caminhos, como a leitura:
 *
 *   operador   → RPC, que valida o token, resolve o operador e repete as duas
 *                checagens no banco (litros e horímetro). O id vem do cliente e
 *                é a chave de idempotência: reenviar não duplica litros.
 *   retaguarda → insert direto, que pode informar preço, custo e origem.
 *
 * As validações continuam também aqui para a tela responder na hora, sem
 * round-trip — mas quem manda é o banco.
 */
async function registrar(input: NovoAbastecimento): Promise<ResultadoAbastecimento> {
  if (input.litros <= 0) return { ok: false, erro: "litros_invalido" };
  const anterior = ultimoHorimetro(input.equipamento_id);
  if (anterior !== null && input.horimetro < anterior) {
    return { ok: false, erro: "horimetro_menor_que_anterior" };
  }

  const sessao = lerSessaoOperador();

  if (sessao) {
    const { data, error } = await supabase
      .rpc("registrar_abastecimento_operador", {
        p_token: sessao.token,
        p_id: crypto.randomUUID(),
        p_equipamento_id: input.equipamento_id,
        p_litros: input.litros,
        p_horimetro: input.horimetro,
        p_local: input.local ?? undefined,
      })
      .returns<Abastecimento[]>();

    if (error) return { ok: false, erro: "falha", motivo: error.message };
    await carregar();
    return { ok: true, abastecimento: (data as Abastecimento[])[0] };
  }

  const { data, error } = await supabase
    .from("abastecimentos")
    .insert({
      equipamento_id: input.equipamento_id,
      operador_id: input.operador_id ?? null,
      litros: input.litros,
      horimetro: input.horimetro,
      preco_litro: input.preco_litro ?? null,
      custo_total: input.custo_total ?? null,
      local: input.local?.trim() ? input.local.trim() : null,
      // Sem origem informada, assume externo — comportamento de antes do
      // controle de tanque existir (Onda 17).
      origem: input.origem ?? "externo",
    })
    .select()
    .single()
    .returns<Abastecimento>();

  if (error) return { ok: false, erro: "falha", motivo: error.message };
  await carregar();
  return { ok: true, abastecimento: data };
}

export const abastecimentosStore = {
  listar,
  listarCompletos,
  obter,
  useTodos,
  useCompletos,
  useEstado,
  registrar,
  retry: carregar,
};
