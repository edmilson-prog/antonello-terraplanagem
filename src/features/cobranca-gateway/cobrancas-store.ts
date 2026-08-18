import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import {
  gerarLinhaDigitavelMock,
  gerarPixCopiaColaMock,
} from "@/features/cobranca-gateway/derivacoes";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import type { CobrancaGateway, ProvedorGateway } from "@/shared/types";

/*
 * Cobranças de gateway (Onda 21) — saiu do mock em memória para o Supabase.
 *
 * A cobrança em si é persistida de verdade; o que continua SIMULADO é a
 * integração: `linha_digitavel` e `pix_copia_cola` são gerados localmente, e
 * `simularWebhookPago` faz o papel que o webhook do provedor faria. Nenhuma
 * chamada de rede a Mercado Pago ou Asaas acontece — quando a integração real
 * existir, o que muda é a origem desses campos, não o modelo.
 *
 * Deixou de ser um factory com a store de contas injetada: agora as duas falam
 * com o banco, e a injeção só servia para o teste do mock.
 */

export type ResultadoEmitirCobranca =
  | { ok: true; cobranca: CobrancaGateway }
  | { ok: false; motivo: string };

export type ResultadoSimularPagamento =
  | { ok: true; cobranca: CobrancaGateway }
  | { ok: false; motivo: string };

interface Estado {
  isLoading: boolean;
  error: Error | null;
}

let itens: CobrancaGateway[] = [];
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
    .from("cobrancas_gateway")
    .select("*")
    .order("emitida_em", { ascending: false })
    .returns<CobrancaGateway[]>();

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
const obter = (id: string): CobrancaGateway | null => itens.find((c) => c.id === id) ?? null;
const getEstado = () => estado;

async function emitirCobranca(
  contaReceberId: string,
  provedor: ProvedorGateway,
): Promise<ResultadoEmitirCobranca> {
  const conta = contasReceberStore.obter(contaReceberId);
  if (!conta) return { ok: false, motivo: "Conta a receber não encontrada." };
  if (conta.status === "liquidada") {
    return { ok: false, motivo: "Esta conta já foi liquidada; não é possível emitir cobrança." };
  }
  const jaEmitida = itens.find(
    (c) => c.conta_receber_id === contaReceberId && c.status === "pendente",
  );
  if (jaEmitida) return { ok: false, motivo: "Já existe uma cobrança pendente para esta conta." };

  // O id é gerado aqui porque alimenta a linha digitável e o PIX simulados —
  // deixar o banco gerar obrigaria a um segundo update só para preenchê-los.
  const id = crypto.randomUUID();

  const { data, error } = await supabase
    .from("cobrancas_gateway")
    .insert({
      id,
      conta_receber_id: contaReceberId,
      provedor,
      status: "pendente",
      linha_digitavel: gerarLinhaDigitavelMock(id),
      pix_copia_cola: gerarPixCopiaColaMock(id),
      valor: conta.valor,
      paga_em: null,
    })
    .select()
    .single()
    .returns<CobrancaGateway>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, cobranca: data };
}

async function simularWebhookPago(cobrancaId: string): Promise<ResultadoSimularPagamento> {
  const cobranca = obter(cobrancaId);
  if (!cobranca) return { ok: false, motivo: "Cobrança não encontrada." };
  if (cobranca.status === "paga") return { ok: false, motivo: "Esta cobrança já foi paga." };
  if (cobranca.status === "cancelada") return { ok: false, motivo: "Esta cobrança foi cancelada." };

  const agora = new Date().toISOString();

  // A baixa da conta vem PRIMEIRO: se ela falhar, nada é gravado. Na ordem
  // inversa a cobrança ficaria paga com a conta em aberto — divergência pior
  // de desfazer do que repetir a operação. Mesmo critério da compra de diesel
  // com conta a pagar (Onda 17).
  const baixa = await contasReceberStore.darBaixaReceber(cobranca.conta_receber_id, {
    recebido_em: agora.slice(0, 10),
    forma_recebimento: cobranca.linha_digitavel ? "boleto" : "pix",
  });
  if (!baixa.ok) return { ok: false, motivo: baixa.motivo };

  const { data, error } = await supabase
    .from("cobrancas_gateway")
    .update({ status: "paga", paga_em: agora })
    .eq("id", cobrancaId)
    .select()
    .single()
    .returns<CobrancaGateway>();

  if (error) return { ok: false, motivo: error.message };
  await carregar();
  return { ok: true, cobranca: data };
}

const useTodas = () => useSyncExternalStore(inscrever, listar, listar);
const useEstado = () => useSyncExternalStore(inscrever, getEstado, getEstado);

export const cobrancasStore = {
  listar,
  obter,
  emitirCobranca,
  simularWebhookPago,
  useTodas,
  useEstado,
  retry: carregar,
};
