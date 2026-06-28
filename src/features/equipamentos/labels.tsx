/* eslint-disable react-refresh/only-export-components */
import type { EquipamentoStatus, TipoEquipamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export const TIPO_LABEL: Record<TipoEquipamento, string> = {
  escavadeira: "Escavadeira",
  carregadeira: "Carregadeira",
  caminhao_cacamba: "Caminhão Caçamba",
  trator_esteira: "Trator de Esteira",
  retroescavadeira: "Retroescavadeira",
  outro: "Outro",
};

export const TIPOS: TipoEquipamento[] = [
  "escavadeira",
  "carregadeira",
  "caminhao_cacamba",
  "trator_esteira",
  "retroescavadeira",
  "outro",
];

export const STATUS_LABEL: Record<EquipamentoStatus, string> = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  manutencao: "Em manutenção",
};

export const STATUS: EquipamentoStatus[] = ["disponivel", "em_uso", "manutencao"];

const STATUS_CLASSE: Record<EquipamentoStatus, string> = {
  disponivel: "bg-steel/20 text-foreground border-steel/40",
  em_uso: "bg-primary/20 text-foreground border-primary/50",
  manutencao: "bg-destructive/15 text-destructive border-destructive/40",
};

export function EquipamentoStatusBadge({ status }: { status: EquipamentoStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function InativoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground-faint">
      Inativo
    </span>
  );
}
