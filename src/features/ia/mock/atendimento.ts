// D11 — chatbot WhatsApp (simulador). As 3 intents são exatamente as do PRD:
// status da obra, 2ª via de cobrança, confirmação de serviço. Fora delas,
// encaminha para atendimento humano (edge case do PRD) — nunca inventa
// resposta. Envio real via WhatsApp é Fase 4 (PRD-009); aqui é só o preview.
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { comDelay } from "@/features/ia/delay";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { indicadoresPorEquipamento } from "@/features/diesel/derivacoes";
import type { SugestaoAlocacao } from "@/features/ia/types";

export async function responderChatbotCliente(
  mensagem: string,
  clienteId: string,
  opts: { delayMs?: number } = {},
): Promise<string> {
  const delayMs = opts.delayMs ?? 1200;
  const texto = mensagem.trim().toLowerCase();
  const ordensDoCliente = ordensStore.listar().filter((o) => o.cliente_id === clienteId);
  const apontamentos = apontamentosStore.listar();

  if (["segunda via", "2ª via", "2a via", "boleto", "cobrança", "cobranca"].some((p) => texto.includes(p))) {
    const contas = contasReceberStore.listar().filter((c) => c.cliente_id === clienteId && c.status === "aberta");
    return comDelay(
      contas.length > 0
        ? `Você tem ${contas.length} cobrança(s) em aberto. Vamos encaminhar a 2ª via por aqui em instantes.`
        : "Não encontramos cobranças em aberto no seu cadastro.",
      delayMs,
    );
  }

  if (["confirmar", "confirmação", "confirmacao", "concluído", "concluido"].some((p) => texto.includes(p))) {
    const fechada = ordensDoCliente.find((o) => statusEfetivoOS(o, apontamentos) === "fechada");
    return comDelay(
      fechada
        ? `A obra "${fechada.obra_nome}" (${fechada.numero}) já foi finalizada. Pode confirmar o recebimento do serviço respondendo "confirmado"?`
        : "Ainda não encontramos uma obra finalizada no seu cadastro para confirmar.",
      delayMs,
    );
  }

  if (["status", "andamento", "obra"].some((p) => texto.includes(p))) {
    const emAndamento = ordensDoCliente.find((o) => statusEfetivoOS(o, apontamentos) !== "fechada");
    return comDelay(
      emAndamento
        ? `Sua obra "${emAndamento.obra_nome}" (${emAndamento.numero}) está em andamento.`
        : "Não encontramos nenhuma obra em andamento no seu cadastro no momento.",
      delayMs,
    );
  }

  return comDelay("Não entendi sua mensagem — vou encaminhar sua mensagem para um atendente humano.", delayMs);
}

// D12 — copiloto de alocação de frota. "Porte" não tem um heurístico confiável
// no schema atual (capacidade é texto livre); a ordenação usa disponibilidade
// (sem apontamento em_andamento) × utilização recente (menor uso primeiro) —
// sugestão, nunca decisão automática (RNF-001).
export async function sugerirAlocacao(
  contexto: { modeloCobranca: "hora_maquina" | "por_metro" },
  opts: { delayMs?: number } = {},
): Promise<SugestaoAlocacao[]> {
  const delayMs = opts.delayMs ?? 1200;
  if (contexto.modeloCobranca !== "hora_maquina") {
    return comDelay([], delayMs);
  }

  const equipamentosAtivos = equipamentosStore.getAll().filter((e) => e.ativo);
  const apontamentos = apontamentosStore.listar();
  const idsOcupados = new Set(
    apontamentos.filter((a) => a.status === "em_andamento").map((a) => a.equipamento_id),
  );
  const indicadores = indicadoresPorEquipamento(equipamentosAtivos, abastecimentosStore.listar(), apontamentos);

  const candidatos = equipamentosAtivos
    .filter((e) => !idsOcupados.has(e.id))
    .map((e) => ({
      equipamento: e,
      horasPeriodo: indicadores.find((i) => i.equipamento.id === e.id)?.horas_periodo ?? 0,
    }))
    .sort((a, b) => a.horasPeriodo - b.horasPeriodo)
    .slice(0, 3);

  const sugestoes: SugestaoAlocacao[] = candidatos.map((c) => ({
    equipamento_id: c.equipamento.id,
    justificativa:
      c.horasPeriodo > 0
        ? `Disponível — ${c.horasPeriodo}h no histórico recente (menor utilização entre os disponíveis).`
        : "Disponível — sem apontamento em andamento e sem histórico recente de utilização.",
  }));
  return comDelay(sugestoes, delayMs);
}
