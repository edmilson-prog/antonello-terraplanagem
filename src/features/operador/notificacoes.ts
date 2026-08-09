import { alertasManutencao } from "@/features/manutencao/derivacoes";
import type {
  Abastecimento,
  Apontamento,
  Equipamento,
  OrdemServico,
  PlanoManutencao,
  RegistroManutencao,
} from "@/shared/types";

/*
 * Notificações do App de Campo.
 *
 * O protótipo do kit lista notificações vindas de uma caixa de entrada. Aqui
 * elas são DERIVADAS de fatos que o sistema já conhece (OS atribuída, plano de
 * manutenção vencendo, apontamento aberto demais, abastecimento registrado) —
 * nenhuma tabela nova e nada inventado. Quando existir um motor de push
 * (n8n/WhatsApp, Onda 2+) esta derivação vira o fallback offline.
 */

export interface NotificacaoCampo {
  id: string;
  icone: string;
  titulo: string;
  mensagem: string;
  em: string; // ISO 8601
  osId: string | null;
  perigo: boolean;
}

export interface EntradaNotificacoes {
  operadorId: string;
  ordens: OrdemServico[];
  apontamentos: Apontamento[];
  equipamentos: Equipamento[];
  planos: PlanoManutencao[];
  registros: RegistroManutencao[];
  abastecimentos: Abastecimento[];
  agora: Date;
}

const DIA_MS = 24 * 60 * 60 * 1000;
const JANELA_OS_DIAS = 7;
const JANELA_ABASTECIMENTO_DIAS = 3;
// Um turno longo tem ~10 h; passar disso sem fechar quase sempre é esquecimento.
export const HORAS_APONTAMENTO_ESQUECIDO = 10;

export function derivarNotificacoes(entrada: EntradaNotificacoes): NotificacaoCampo[] {
  const { operadorId, ordens, apontamentos, equipamentos, planos, registros, abastecimentos } =
    entrada;
  const agoraMs = entrada.agora.getTime();
  const itens: NotificacaoCampo[] = [];

  for (const os of ordens) {
    if (os.responsavel_id !== operadorId || os.status === "fechada") continue;
    if (agoraMs - new Date(os.aberta_em).getTime() > JANELA_OS_DIAS * DIA_MS) continue;
    itens.push({
      id: `os-${os.id}`,
      icone: "lucide:clipboard-list",
      titulo: "Nova OS atribuída a você",
      mensagem: `${os.numero} · ${os.obra_nome}`,
      em: os.aberta_em,
      osId: os.id,
      perigo: false,
    });
  }

  // Só alerta manutenção de máquina que ESTE operador tocou — a frota inteira
  // seria ruído para quem está em campo.
  const meusEquipamentos = new Set(
    apontamentos.filter((a) => a.operador_id === operadorId).map((a) => a.equipamento_id),
  );
  for (const alerta of alertasManutencao(equipamentos, planos, registros)) {
    if (!meusEquipamentos.has(alerta.equipamento.id)) continue;
    const vencida = alerta.status === "vencida";
    itens.push({
      id: `mnt-${alerta.registro.id}`,
      icone: "lucide:wrench",
      titulo: vencida ? "Manutenção vencida" : "Manutenção se aproximando",
      mensagem: `${alerta.equipamento.nome} · ${alerta.plano.descricao} — prevista em ${alerta.registro.horimetro_previsto} h`,
      em: alerta.registro.updated_at,
      osId: null,
      perigo: vencida,
    });
  }

  for (const a of apontamentos) {
    if (a.operador_id !== operadorId || a.status !== "em_andamento") continue;
    const horasAberto = (agoraMs - new Date(a.iniciado_em).getTime()) / (60 * 60 * 1000);
    if (horasAberto < HORAS_APONTAMENTO_ESQUECIDO) continue;
    const equipamento = equipamentos.find((e) => e.id === a.equipamento_id);
    itens.push({
      id: `apt-${a.id}`,
      icone: "lucide:gauge",
      titulo: "Apontamento em aberto",
      mensagem: `${equipamento?.nome ?? "Equipamento"} — iniciado há ${Math.floor(horasAberto)} h sem horímetro final`,
      em: a.iniciado_em,
      osId: a.os_id,
      perigo: true,
    });
  }

  for (const ab of abastecimentos) {
    if (ab.operador_id !== operadorId) continue;
    if (agoraMs - new Date(ab.abastecido_em).getTime() > JANELA_ABASTECIMENTO_DIAS * DIA_MS)
      continue;
    const equipamento = equipamentos.find((e) => e.id === ab.equipamento_id);
    itens.push({
      id: `dsl-${ab.id}`,
      icone: "lucide:fuel",
      titulo: "Abastecimento registrado",
      mensagem: `${ab.litros} L · ${equipamento?.nome ?? "Equipamento"}${ab.local ? ` — ${ab.local}` : ""}`,
      em: ab.abastecido_em,
      osId: null,
      perigo: false,
    });
  }

  return itens.sort((a, b) => b.em.localeCompare(a.em));
}

export function contarNaoLidas(itens: NotificacaoCampo[], lidasAte: string | null): number {
  if (!lidasAte) return itens.length;
  return itens.filter((n) => n.em > lidasAte).length;
}
