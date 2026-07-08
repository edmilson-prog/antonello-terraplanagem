// C9 — assistente de orçamento. Busca obras SIMILARES já executadas (mesmo
// cliente, senão mesmo modelo de cobrança) e propõe itens com base em médias
// reais — nunca sobrescreve itens já digitados (a UI só soma, ver
// sugestao-orcamento-dialog.tsx). Sem obra semelhante, não inventa (RF).
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { totalMetragemOS } from "@/features/ordem-servico/derivacoes";
import { comDelay } from "@/features/ia/delay";
import { montarResumoServico } from "@/features/comprovantes/derivacoes";
import type { SugestaoOrcamento, SugestaoOrcamentoItem } from "@/features/ia/types";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

export interface ContextoSugestaoOrcamento {
  clienteId: string;
  modeloCobranca: "hora_maquina" | "por_metro";
}

export async function sugerirOrcamento(
  contexto: ContextoSugestaoOrcamento,
  opts: { delayMs?: number } = {},
): Promise<SugestaoOrcamento> {
  const delayMs = opts.delayMs ?? 1500;
  const ordens = ordensStore.listar();
  const apontamentos = apontamentosStore.listar();
  const doCliente = ordens.filter(
    (o) => o.cliente_id === contexto.clienteId && o.modelo_cobranca === contexto.modeloCobranca,
  );
  // Fallback para "mesmo modelo de cobrança" só vale para um cliente que já existe no
  // cadastro (ex.: primeira obra dele nesta modalidade). Cliente inexistente não tem
  // "obra semelhante" nenhuma — não inventa a partir da carteira de outros clientes (RF).
  const clienteCadastrado = clientesStore.getById(contexto.clienteId) != null;
  const mesmoModelo = clienteCadastrado ? ordens.filter((o) => o.modelo_cobranca === contexto.modeloCobranca) : [];
  const base = doCliente.length > 0 ? doCliente : mesmoModelo;

  if (base.length === 0) {
    return comDelay({ itens: [], justificativa: "Sem obras semelhantes no histórico para sugerir itens." }, delayMs);
  }

  const justificativaBase =
    doCliente.length > 0
      ? `baseado em ${doCliente.length} obra(s) anterior(es) deste cliente`
      : `baseado em ${mesmoModelo.length} obra(s) semelhante(s)`;

  if (contexto.modeloCobranca === "hora_maquina") {
    const porEquipamento = new Map<string, number[]>();
    for (const os of base) {
      const daOS = apontamentos.filter(
        (a) => a.os_id === os.id && a.status === "finalizado" && a.horas_trabalhadas != null,
      );
      const porEquipDaOS = new Map<string, number>();
      for (const a of daOS) {
        porEquipDaOS.set(a.equipamento_id, (porEquipDaOS.get(a.equipamento_id) ?? 0) + (a.horas_trabalhadas ?? 0));
      }
      for (const [equipId, horas] of porEquipDaOS) {
        porEquipamento.set(equipId, [...(porEquipamento.get(equipId) ?? []), horas]);
      }
    }
    const itens: SugestaoOrcamentoItem[] = Array.from(porEquipamento.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 2)
      .map(([equipId, listaHoras]) => {
        const media = Math.round((listaHoras.reduce((s, h) => s + h, 0) / listaHoras.length) * 10) / 10;
        return {
          tipo: "hora_maquina" as const,
          origem_id: equipId,
          quantidade_estimada: media,
          justificativa: `Média de ${media}h em ${listaHoras.length} obra(s) — ${justificativaBase}`,
        };
      });
    if (itens.length === 0) {
      return comDelay(
        { itens: [], justificativa: "Obras semelhantes encontradas, mas sem horas apontadas registradas." },
        delayMs,
      );
    }
    return comDelay({ itens, justificativa: `Sugestão ${justificativaBase}.` }, delayMs);
  }

  const metros = base.map((os) => totalMetragemOS(os.id, apontamentos)).filter((m) => m > 0);
  if (metros.length === 0) {
    return comDelay(
      { itens: [], justificativa: "Obras semelhantes encontradas, mas sem metragem executada registrada." },
      delayMs,
    );
  }
  const precoRef = precoFundacaoStore.getAll().find((p) => p.ativo);
  if (!precoRef) {
    return comDelay({ itens: [], justificativa: "Nenhuma tabela de preço por metro ativa para sugerir." }, delayMs);
  }
  const mediaMetros = Math.round((metros.reduce((s, m) => s + m, 0) / metros.length) * 10) / 10;
  return comDelay(
    {
      itens: [
        {
          tipo: "por_metro",
          origem_id: precoRef.id,
          quantidade_estimada: mediaMetros,
          justificativa: `Média de ${mediaMetros}m em ${metros.length} obra(s) — ${justificativaBase}`,
        },
      ],
      justificativa: `Sugestão ${justificativaBase}.`,
    },
    delayMs,
  );
}

// C10 — redação automática. Reaproveita montarResumoServico (011) — a MESMA
// derivação usada no comprovante — em vez de inventar um segundo cálculo de
// resumo (RF-002). Nunca inclui R$: montarResumoServico já não inclui.
export async function gerarTexto(
  os: OrdemServico,
  apontamentos: Apontamento[],
  equipamentos: Equipamento[],
  opts: { delayMs?: number } = {},
): Promise<string> {
  const resumo = montarResumoServico(os, apontamentos, equipamentos);
  const texto = `${resumo}\n\nGerado por IA — revise antes de salvar.`;
  return comDelay(texto, opts.delayMs ?? 1200);
}
