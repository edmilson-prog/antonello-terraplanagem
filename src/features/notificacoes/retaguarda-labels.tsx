/* eslint-disable react-refresh/only-export-components */
import { Icon } from "@iconify/react";
import type {
  CanalNotificacao,
  CategoriaNotificacao,
  PrioridadeNotificacao,
  StatusEntrega,
  TipoNotificacao,
} from "@/shared/types";
import { cn } from "@/lib/utils";

export const CATEGORIA_LABEL: Record<CategoriaNotificacao, string> = {
  operacao: "Operação",
  frota: "Frota",
  financeiro: "Financeiro",
  comercial: "Comercial",
  sistema: "Sistema",
};

export const CATEGORIAS: CategoriaNotificacao[] = [
  "operacao",
  "frota",
  "financeiro",
  "comercial",
  "sistema",
];

export const CANAL_LABEL: Record<CanalNotificacao, string> = {
  app: "In-app",
  push: "Push",
  email: "E-mail",
  whatsapp: "WhatsApp",
};

export const CANAL_ICONE: Record<CanalNotificacao, string> = {
  app: "lucide:bell",
  push: "lucide:smartphone",
  email: "lucide:mail",
  whatsapp: "lucide:message-circle",
};

export const CANAIS: CanalNotificacao[] = ["app", "push", "email", "whatsapp"];

export const PRIORIDADE_LABEL: Record<PrioridadeNotificacao, string> = {
  normal: "Normal",
  alta: "Alta",
  critico: "Crítico",
};

// Cada evento com o rótulo e a explicação que o kit escreve na matriz de
// preferências — é o texto que diz QUANDO a notificação sai, e sem ele a
// matriz vira uma lista de nomes técnicos.
export const EVENTO_LABEL: Record<TipoNotificacao, { nome: string; detalhe: string }> = {
  apontamento_aguardando: {
    nome: "Apontamento aguardando aprovação",
    detalhe: "no lançamento do operador",
  },
  os_sem_apontamento: {
    nome: "OS sem apontamento há 2 dias",
    detalhe: "varredura diária às 07:00",
  },
  os_concluida: { nome: "OS concluída", detalhe: "quando a retaguarda fecha a OS" },
  os_atribuida: { nome: "OS atribuída ao operador", detalhe: "na definição do responsável" },
  apontamento_aprovado: { nome: "Apontamento aprovado", detalhe: "confirmação das horas" },
  lembrete_apontamento: { nome: "Lembrete de apontamento", detalhe: "às 17:00, se ficou aberto" },
  correcao_solicitada: { nome: "Correção solicitada", detalhe: "quando a retaguarda devolve" },
  manutencao_vencida: { nome: "Plano de manutenção vencido", detalhe: "varredura diária" },
  manutencao_agendada: { nome: "Plano a vencer", detalhe: "antecedência definida em Parâmetros" },
  consumo_anomalo: { nome: "Consumo de diesel fora do padrão", detalhe: "desvio acima de 20%" },
  abastecimento_registrado: { nome: "Abastecimento registrado", detalhe: "lançamento no campo" },
  titulo_vencido: { nome: "Título vencido", detalhe: "no dia seguinte ao vencimento" },
  titulo_a_vencer: { nome: "Título a vencer", detalhe: "3 dias antes" },
  comprovante_recebido: { nome: "Recebimento confirmado", detalhe: "na baixa da conta" },
  orcamento_aprovado: { nome: "Orçamento aprovado", detalhe: "aceite do cliente" },
  orcamento_perdido: { nome: "Orçamento perdido", detalhe: "quando é recusado" },
  orcamento_a_vencer: { nome: "Orçamento a vencer", detalhe: "validade em 5 dias" },
  aviso_manual: { nome: "Aviso manual", detalhe: "escrito por alguém do escritório" },
};

export const EVENTOS_POR_CATEGORIA: Record<CategoriaNotificacao, TipoNotificacao[]> = {
  operacao: [
    "apontamento_aguardando",
    "os_sem_apontamento",
    "os_concluida",
    "os_atribuida",
    "apontamento_aprovado",
    "lembrete_apontamento",
    "correcao_solicitada",
  ],
  frota: [
    "manutencao_vencida",
    "manutencao_agendada",
    "consumo_anomalo",
    "abastecimento_registrado",
  ],
  financeiro: ["titulo_vencido", "titulo_a_vencer", "comprovante_recebido"],
  comercial: ["orcamento_aprovado", "orcamento_perdido", "orcamento_a_vencer"],
  sistema: ["aviso_manual"],
};

// Ícone e tom do tile de cada categoria, no espírito do NotifTile do kit.
export const CATEGORIA_ICONE: Record<CategoriaNotificacao, string> = {
  operacao: "lucide:clipboard-list",
  frota: "lucide:wrench",
  financeiro: "lucide:wallet",
  comercial: "lucide:file-text",
  sistema: "lucide:smartphone",
};

export function TileNotificacao({
  categoria,
  critico,
}: {
  categoria: CategoriaNotificacao;
  critico?: boolean;
}) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
        critico
          ? "border-destructive/35 bg-destructive/15 text-destructive"
          : "border-primary/30 bg-primary/15 text-primary",
      )}
    >
      <Icon icon={CATEGORIA_ICONE[categoria]} className="h-4 w-4" aria-hidden />
    </span>
  );
}

const CHIP_STATUS: Record<StatusEntrega, string> = {
  entregue: "border-success/35 bg-success/12 text-success-foreground",
  pendente: "border-steel/40 bg-steel/15 text-muted-foreground",
  suprimido: "border-steel/40 bg-steel/10 text-foreground-faint",
  falhou: "border-destructive/40 bg-destructive/15 text-destructive",
};

// Chip de canal do kit. `suprimido` ganha aparência própria — apagado, não
// vermelho: horário silencioso não é erro, e pintar de vermelho faria a tela
// gritar por uma decisão que ela mesma tomou.
export function ChipCanal({
  canal,
  status,
  motivo,
}: {
  canal: CanalNotificacao;
  status: StatusEntrega;
  motivo?: string | null;
}) {
  const titulo =
    status === "falhou"
      ? `Falha na entrega${motivo ? ` — ${motivo}` : ""}`
      : status === "suprimido"
        ? `Não enviado${motivo ? ` — ${motivo}` : ""}`
        : status === "pendente"
          ? "Envio em andamento"
          : "Entregue";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium",
        CHIP_STATUS[status],
      )}
      title={titulo}
    >
      <Icon
        icon={status === "falhou" ? "lucide:circle-alert" : CANAL_ICONE[canal]}
        className="h-3 w-3"
        aria-hidden
      />
      {CANAL_LABEL[canal]}
    </span>
  );
}
