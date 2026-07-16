import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import type { ClienteFormValues } from "@/features/clientes/cliente-schema";

export function ResumoNovoCliente({ control }: { control: Control<ClienteFormValues> }) {
  const valores = useWatch({ control });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:user" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {/* useWatch captura o valor antes do onChange do campo aplicar o uppercase, então normaliza aqui também */}
              {valores.nome?.trim().toUpperCase() || "Novo cliente"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Documento"
            valor={valores.documento?.trim() || "a definir"}
            vazio={!valores.documento?.trim()}
          />
          <Linha
            rotulo="Telefone"
            valor={valores.telefone?.trim() || "a definir"}
            vazio={!valores.telefone?.trim()}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O cliente entra <strong className="text-foreground">ativo</strong> e já pode receber{" "}
          <strong className="text-foreground">orçamentos</strong> e{" "}
          <strong className="text-foreground">ordens de serviço</strong>.
        </p>
      </div>
    </div>
  );
}
