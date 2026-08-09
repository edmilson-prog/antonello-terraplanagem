import type { Notificacao, TipoNotificacao } from "@/shared/types";

// Derivações de apresentação das notificações (PRD-020). Espelham o kit
// `ui_kits/app-campo/CampoApp.jsx` (tela `notif`): ícone-tile por tipo, o
// vermelho reservado para o que exige ação, e agrupamento por dia.

export interface AparenciaNotificacao {
  icone: string;
  /** `alerta` pinta o tile de vermelho; `padrao` usa o amarelo-máquina. */
  tom: "padrao" | "alerta";
}

const APARENCIA: Record<TipoNotificacao, AparenciaNotificacao> = {
  os_atribuida: { icone: "lucide:clipboard-list", tom: "padrao" },
  manutencao_agendada: { icone: "lucide:wrench", tom: "padrao" },
  apontamento_aprovado: { icone: "lucide:check", tom: "padrao" },
  lembrete_apontamento: { icone: "lucide:gauge", tom: "padrao" },
  abastecimento_registrado: { icone: "lucide:fuel", tom: "padrao" },
  // Único que pede correção de algo que o operador já fez — por isso destoa.
  correcao_solicitada: { icone: "lucide:circle-alert", tom: "alerta" },
};

const APARENCIA_PADRAO: AparenciaNotificacao = { icone: "lucide:bell", tom: "padrao" };

export function aparenciaDaNotificacao(tipo: string): AparenciaNotificacao {
  return APARENCIA[tipo as TipoNotificacao] ?? APARENCIA_PADRAO;
}

/** Só a hora, como no kit (`07:38`), em fonte mono na lista. */
export function horaDaNotificacao(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function diaLocal(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * "Hoje" / "Ontem" / "qua, 09/07" — o operador raciocina por dia de trabalho,
 * não por data absoluta.
 */
export function rotuloDoDia(iso: string, referencia = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const diferencaDias = Math.round((diaLocal(referencia) - diaLocal(d)) / 86_400_000);
  if (diferencaDias === 0) return "Hoje";
  if (diferencaDias === 1) return "Ontem";

  return d
    .toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
    .replace(".", "");
}

export interface GrupoNotificacoes {
  dia: string;
  itens: Notificacao[];
}

/**
 * Agrupa preservando a ordem recebida (a RPC já devolve mais recente primeiro),
 * então cada dia aparece uma vez só e na sequência certa.
 */
export function agruparPorDia(itens: Notificacao[], referencia = new Date()): GrupoNotificacoes[] {
  const grupos: GrupoNotificacoes[] = [];

  for (const item of itens) {
    const dia = rotuloDoDia(item.created_at, referencia);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.dia === dia) ultimo.itens.push(item);
    else grupos.push({ dia, itens: [item] });
  }

  return grupos;
}
