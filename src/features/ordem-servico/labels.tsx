/* eslint-disable react-refresh/only-export-components */
import type { ModeloCobranca, StatusOS, TipoServico } from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_OS_LABEL: Record<StatusOS, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  fechada: "Fechada",
};

export const STATUS_OS: StatusOS[] = ["aberta", "em_andamento", "fechada"];

export const MODELO_LABEL: Record<ModeloCobranca, string> = {
  hora_maquina: "Hora-máquina",
  por_metro: "Por metro",
};

export const TIPO_SERVICO_LABEL: Record<TipoServico, string> = {
  terraplenagem: "Terraplenagem",
  drenagem: "Drenagem",
  nivelamento: "Nivelamento",
  fundacao_estacas: "Fundação — estacas",
  cascalhamento: "Cascalhamento",
  limpeza_terreno: "Limpeza de terreno",
};

export const TIPOS_SERVICO: TipoServico[] = [
  "terraplenagem",
  "drenagem",
  "nivelamento",
  "fundacao_estacas",
  "cascalhamento",
  "limpeza_terreno",
];

// Sentinelas dos selects opcionais do formulário de OS — <Select> não aceita
// value="" num item, então "nada selecionado" precisa de um valor próprio.
// Vivem aqui (não em ordem-form.tsx) para serem reaproveitadas por
// ResumoNovaOrdem sem criar import circular entre os dois componentes.
export const SEM_RESPONSAVEL = "sem-responsavel";
export const SEM_EQUIPAMENTO = "sem-equipamento";
export const SEM_ORCAMENTO = "sem-orcamento";

const STATUS_CLASSE: Record<StatusOS, string> = {
  aberta: "bg-steel/20 text-foreground border-steel/40",
  em_andamento: "bg-primary/20 text-foreground border-primary/50",
  fechada: "bg-secondary-soft/25 text-foreground border-secondary/40",
};

export function StatusOSBadge({ status, className }: { status: StatusOS; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSE[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_OS_LABEL[status]}
    </span>
  );
}
