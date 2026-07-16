import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { iniciais } from "@/features/operadores/components/operador-hero";
import type { OperadorFormValues } from "@/features/operadores/operador-schema";
import type { Equipamento } from "@/shared/types";

interface Props {
  control: Control<OperadorFormValues>;
  equipamentosSelecionados: Equipamento[];
}

export function ResumoNovoOperador({ control, equipamentosSelecionados }: Props) {
  const valores = useWatch({ control });
  const cnh = valores.cnh_categoria
    ? `Categoria ${valores.cnh_categoria}${valores.cnh_validade ? ` · ${valores.cnh_validade}` : ""}`
    : "a definir";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
            {iniciais(valores.nome ?? "")}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.nome?.trim().toUpperCase() || "Novo operador"}
            </div>
            <div className="text-xs text-muted-foreground">
              Operador · {valores.vinculo ?? "CLT"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="CPF"
            valor={valores.cpf?.trim() || "a definir"}
            vazio={!valores.cpf?.trim()}
          />
          <Linha
            rotulo="Telefone"
            valor={valores.telefone?.trim() || "a definir"}
            vazio={!valores.telefone?.trim()}
          />
          <Linha rotulo="CNH" valor={cnh} vazio={!valores.cnh_categoria} />
          <Linha
            rotulo="Base"
            valor={valores.base?.trim() || "a definir"}
            vazio={!valores.base?.trim()}
          />
          <Linha
            rotulo="Equipamentos"
            valor={
              equipamentosSelecionados.length > 0
                ? `${equipamentosSelecionados.length} habilitados`
                : "nenhum"
            }
            vazio={equipamentosSelecionados.length === 0}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:lock" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Perfil operacional — sem dados financeiros. O PIN inicial de acesso ao app de campo será
          os últimos 4 dígitos do CPF.
        </p>
      </div>
    </div>
  );
}
