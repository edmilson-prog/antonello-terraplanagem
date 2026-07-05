import { useSyncExternalStore } from "react";
import { cobrancasGateway as seed } from "@/mocks/cobrancas-gateway";
import {
  gerarLinhaDigitavelMock,
  gerarPixCopiaColaMock,
} from "@/features/cobranca-gateway/derivacoes";
import {
  contasReceberStore,
  criarContasReceberStore,
} from "@/features/financeiro/contas-receber-store";
import type { CobrancaGateway, ProvedorGateway } from "@/shared/types";

export type ResultadoEmitirCobranca =
  | { ok: true; cobranca: CobrancaGateway }
  | { ok: false; motivo: string };

export type ResultadoSimularPagamento =
  | { ok: true; cobranca: CobrancaGateway }
  | { ok: false; motivo: string };

export function criarCobrancasStore(
  inicial: CobrancaGateway[],
  contasStore: ReturnType<typeof criarContasReceberStore>,
) {
  let itens: CobrancaGateway[] = inicial.map((c) => ({ ...c }));
  const ouvintes = new Set<() => void>();
  const notificar = () => ouvintes.forEach((fn) => fn());
  const inscrever = (fn: () => void) => {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  };

  const listar = () => itens;
  const obter = (id: string): CobrancaGateway | null => itens.find((c) => c.id === id) ?? null;

  function emitirCobranca(
    contaReceberId: string,
    provedor: ProvedorGateway,
  ): ResultadoEmitirCobranca {
    const conta = contasStore.obter(contaReceberId);
    if (!conta) return { ok: false, motivo: "Conta a receber não encontrada." };
    if (conta.status === "liquidada")
      return {
        ok: false,
        motivo: "Esta conta já foi liquidada; não é possível emitir cobrança.",
      };
    const jaEmitida = itens.find(
      (c) => c.conta_receber_id === contaReceberId && c.status === "pendente",
    );
    if (jaEmitida) return { ok: false, motivo: "Já existe uma cobrança pendente para esta conta." };

    const agora = new Date().toISOString();
    const id = crypto.randomUUID();
    const nova: CobrancaGateway = {
      id,
      conta_receber_id: contaReceberId,
      provedor,
      status: "pendente",
      linha_digitavel: gerarLinhaDigitavelMock(id),
      pix_copia_cola: gerarPixCopiaColaMock(id),
      valor: conta.valor,
      emitida_em: agora,
      paga_em: null,
      created_at: agora,
      updated_at: agora,
    };
    itens = [nova, ...itens];
    notificar();
    return { ok: true, cobranca: nova };
  }

  function simularWebhookPago(cobrancaId: string): ResultadoSimularPagamento {
    const cobranca = obter(cobrancaId);
    if (!cobranca) return { ok: false, motivo: "Cobrança não encontrada." };
    if (cobranca.status === "paga") return { ok: false, motivo: "Esta cobrança já foi paga." };
    if (cobranca.status === "cancelada")
      return { ok: false, motivo: "Esta cobrança foi cancelada." };

    const formaRecebimento = cobranca.linha_digitavel ? "boleto" : "pix";
    const agora = new Date().toISOString();
    const baixa = contasStore.darBaixaReceber(cobranca.conta_receber_id, {
      recebido_em: agora.slice(0, 10),
      forma_recebimento: formaRecebimento,
    });
    if (!baixa.ok) return { ok: false, motivo: baixa.motivo };

    const paga: CobrancaGateway = {
      ...cobranca,
      status: "paga",
      paga_em: agora,
      updated_at: agora,
    };
    itens = itens.map((c) => (c.id === cobrancaId ? paga : c));
    notificar();
    return { ok: true, cobranca: paga };
  }

  const useTodas = () => useSyncExternalStore(inscrever, listar, listar);

  return { listar, obter, emitirCobranca, simularWebhookPago, useTodas };
}

export const cobrancasStore = criarCobrancasStore(seed, contasReceberStore);
