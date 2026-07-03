/* eslint-disable react-refresh/only-export-components */
import type { TipoComponenteCusto } from "@/shared/types";
import { cn } from "@/lib/utils";

export const TIPO_COMPONENTE_LABEL: Record<TipoComponenteCusto, string> = {
  fixo_mensal: "Fixo mensal",
  variavel_hora: "Variável por hora",
  diesel: "Diesel",
  manutencao: "Manutenção",
};

// Únicos tipos que o usuário configura manualmente — diesel/manutenção são
// sempre derivados (PRD-012/PRD-010), nunca um ComponenteCusto criado à mão.
export const TIPOS_CONFIGURAVEIS: TipoComponenteCusto[] = ["fixo_mensal", "variavel_hora"];

export function unidadeComponente(tipo: TipoComponenteCusto): string {
  return tipo === "variavel_hora" ? "/h" : "/mês";
}

export function TipoComponenteCustoBadge({ tipo }: { tipo: TipoComponenteCusto }) {
  const derivado = tipo === "diesel" || tipo === "manutencao";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        derivado
          ? "border-steel/40 bg-steel/20 text-foreground"
          : "border-primary/50 bg-primary/20 text-foreground",
      )}
    >
      {TIPO_COMPONENTE_LABEL[tipo]}
    </span>
  );
}
