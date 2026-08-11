import { alertasManutencao } from "@/features/manutencao/derivacoes";
import { ordensDoOperador, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import type { RegistroCampo } from "@/features/registros-campo/tipos";
import type {
  Apontamento,
  Equipamento,
  OrdemServico,
  PlanoManutencao,
  RegistroManutencao,
} from "@/shared/types";

/*
 * Alertas de segurança do App de Campo (`screen === 'seg'` no CampoApp.jsx).
 *
 * O kit lista alertas publicados pela retaguarda (rede energizada, visita de
 * cliente, previsão de chuva) e um DDS do dia. Nada disso tem origem no
 * sistema hoje — não existe tabela de alerta nem de DDS. Em vez de inventar
 * conteúdo, esta derivação levanta os riscos que o próprio sistema já conhece
 * sobre as máquinas do operador. Quando a retaguarda passar a publicar alertas
 * e DDS, eles entram nesta mesma lista.
 */

export type SeveridadeAlerta = "critico" | "atencao";

export interface AlertaSeguranca {
  id: string;
  severidade: SeveridadeAlerta;
  icone: string;
  titulo: string;
  mensagem: string;
}

export interface EntradaAlertas {
  operadorId: string;
  ordens: OrdemServico[];
  apontamentos: Apontamento[];
  equipamentos: Equipamento[];
  planos: PlanoManutencao[];
  registrosManutencao: RegistroManutencao[];
  registrosCampo: RegistroCampo[];
}

export function derivarAlertasSeguranca(entrada: EntradaAlertas): AlertaSeguranca[] {
  const {
    operadorId,
    ordens,
    apontamentos,
    equipamentos,
    planos,
    registrosManutencao,
    registrosCampo,
  } = entrada;
  const alertas: AlertaSeguranca[] = [];

  const minhasOrdens = ordensDoOperador(ordens, apontamentos, operadorId).filter(
    (os) => statusEfetivoOS(os, apontamentos) !== "fechada",
  );

  // Máquinas que o operador tocou (apontamento) ou que estão previstas nas OS dele.
  const minhasMaquinas = new Set<string>();
  for (const a of apontamentos) {
    if (a.operador_id === operadorId) minhasMaquinas.add(a.equipamento_id);
  }
  for (const os of minhasOrdens) {
    if (os.equipamento_previsto_id) minhasMaquinas.add(os.equipamento_previsto_id);
  }

  for (const os of minhasOrdens) {
    if (!os.equipamento_previsto_id) continue;
    const equipamento = equipamentos.find((e) => e.id === os.equipamento_previsto_id);
    if (!equipamento || equipamento.status !== "manutencao") continue;
    alertas.push({
      id: `manutencao-${equipamento.id}`,
      severidade: "critico",
      icone: "lucide:triangle-alert",
      titulo: "Máquina em manutenção alocada à sua OS",
      mensagem: `${equipamento.nome} está marcada como em manutenção e consta na ${os.numero}. Confirme com a retaguarda antes de operar.`,
    });
  }

  for (const alerta of alertasManutencao(equipamentos, planos, registrosManutencao)) {
    if (!minhasMaquinas.has(alerta.equipamento.id)) continue;
    const vencida = alerta.status === "vencida";
    alertas.push({
      id: `plano-${alerta.registro.id}`,
      severidade: vencida ? "critico" : "atencao",
      icone: "lucide:wrench",
      titulo: vencida ? "Manutenção vencida" : "Manutenção se aproximando",
      mensagem: `${alerta.equipamento.nome} · ${alerta.plano.descricao} — prevista em ${alerta.registro.horimetro_previsto} h e o horímetro já está em ${alerta.equipamento.horimetro_atual} h.`,
    });
  }

  for (const registro of registrosCampo) {
    if (registro.tipo !== "checklist") continue;
    if (registro.operador_id !== operadorId) continue;
    if (registro.dados.nao_conformes === 0) continue;
    const equipamento = registro.equipamento_id
      ? equipamentos.find((e) => e.id === registro.equipamento_id)
      : undefined;
    alertas.push({
      id: `checklist-${registro.id}`,
      severidade: "critico",
      icone: "lucide:circle-alert",
      titulo: "Checklist com item não conforme",
      mensagem: `${equipamento?.nome ?? "Equipamento"} — ${registro.dados.nao_conformes} ${registro.dados.nao_conformes === 1 ? "item reprovado" : "itens reprovados"} no checklist de pré-uso.`,
    });
  }

  // Crítico primeiro: é o que trava a operação.
  return alertas.sort((a, b) =>
    a.severidade === b.severidade ? 0 : a.severidade === "critico" ? -1 : 1,
  );
}
