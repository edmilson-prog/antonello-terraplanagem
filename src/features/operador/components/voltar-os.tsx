import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { BOTAO_VOLTAR } from "@/features/operador/components/kit";

/* Botão de voltar das sub-telas de uma OS — todas voltam para o detalhe dela. */
export function VoltarParaOS({ ordemId }: { ordemId: string }) {
  return (
    <Link
      to="/app/ordens/$ordemId"
      params={{ ordemId }}
      aria-label="Voltar"
      className={BOTAO_VOLTAR}
    >
      <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
    </Link>
  );
}
