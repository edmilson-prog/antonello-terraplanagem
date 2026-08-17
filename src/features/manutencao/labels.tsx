/* eslint-disable react-refresh/only-export-components */
import type {
  StatusManutencao,
  StatusRegistroManutencao,
  PrioridadeManutencao,
  TipoManutencao,
  Equipamento,
  PlanoManutencao,
  RegistroManutencaoOperador,
} from "@/shared/types";
import { TIPO_LABEL } from "@/features/equipamentos/labels";
import { cn } from "@/lib/utils";

// `vinculo` é estado de formulário (qual FK gravar), não pertence ao contrato.
export type VinculoPlano = "equipamento" | "tipo";

export const VINCULOS_PLANO: VinculoPlano[] = ["equipamento", "tipo"];

export const VINCULO_PLANO_LABEL: Record<VinculoPlano, string> = {
  equipamento: "Equipamento específico",
  tipo: "Tipo de equipamento",
};

export const STATUS_MANUTENCAO_LABEL: Record<StatusManutencao, string> = {
  em_dia: "Em dia",
  proxima: "Próxima",
  vencida: "Vencida",
};

const STATUS_MANUTENCAO_CLASSE: Record<StatusManutencao, string> = {
  em_dia: "bg-steel/20 text-foreground border-steel/40",
  proxima: "bg-primary/20 text-foreground border-primary/50",
  vencida: "bg-destructive/15 text-destructive border-destructive/40",
};

export function StatusManutencaoBadge({ status }: { status: StatusManutencao }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_MANUTENCAO_CLASSE[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_MANUTENCAO_LABEL[status]}
    </span>
  );
}

// Situação da ORDEM (a linha de registros_manutencao), diferente do status do
// PLANO acima — este é armazenado, aquele é derivado do horímetro. Os rótulos
// são os do UI kit: prevista aparece como "Agendada", porque para quem olha a
// lista ela é um serviço marcado, não uma previsão de cálculo.
export const SITUACAO_REGISTRO_LABEL: Record<StatusRegistroManutencao, string> = {
  prevista: "Agendada",
  em_andamento: "Em andamento",
  realizada: "Concluída",
};

const SITUACAO_REGISTRO_CLASSE: Record<StatusRegistroManutencao, string> = {
  prevista: "bg-steel/20 text-foreground border-steel/40",
  em_andamento: "bg-primary/20 text-foreground border-primary/50",
  realizada: "bg-success/15 text-success-foreground border-success/35",
};

export function SituacaoRegistroBadge({
  situacao,
  className,
}: {
  situacao: StatusRegistroManutencao;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        SITUACAO_REGISTRO_CLASSE[situacao],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {SITUACAO_REGISTRO_LABEL[situacao]}
    </span>
  );
}

export const TIPO_MANUTENCAO_LABEL: Record<TipoManutencao, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
};

export const PRIORIDADE_MANUTENCAO_LABEL: Record<PrioridadeManutencao, string> = {
  alta: "Alta — parar a máquina",
  media: "Média — programar",
  baixa: "Baixa — próxima revisão",
};

export const PRIORIDADES_MANUTENCAO: PrioridadeManutencao[] = ["alta", "media", "baixa"];

// O que a ordem faz, em uma linha. Corretiva traz descrição própria; preventiva
// de plano herda a do plano. O fallback existe porque o plano pode ter sido
// removido depois de a manutenção já ter sido realizada.
export function descreverManutencao(
  registro: Pick<RegistroManutencaoOperador, "descricao" | "plano_id">,
  planos: PlanoManutencao[],
): string {
  if (registro.descricao?.trim()) return registro.descricao;
  const plano = planos.find((p) => p.id === registro.plano_id);
  return plano?.descricao ?? "Manutenção";
}

// Descrição legível do vínculo de um plano, resolvendo o nome do equipamento a
// partir da lista atual (reativo a mudanças no cadastro). Espelha
// descreverVinculo de @/features/precos/labels.
export function descreverVinculoPlano(
  plano: Pick<PlanoManutencao, "equipamento_id" | "tipo_equipamento">,
  equipamentos: Equipamento[],
): string {
  if (plano.equipamento_id) {
    const eq = equipamentos.find((e) => e.id === plano.equipamento_id);
    return eq ? eq.nome : "Equipamento removido";
  }
  if (plano.tipo_equipamento) {
    return `Tipo: ${TIPO_LABEL[plano.tipo_equipamento]}`;
  }
  return "—";
}
