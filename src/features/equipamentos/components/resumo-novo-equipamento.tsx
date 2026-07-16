import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { TIPO_LABEL, TIPO_ICONE, STATUS_LABEL } from "@/features/equipamentos/labels";
import { formatHorimetro } from "@/shared/lib/format";
import type { EquipamentoFormValues } from "@/features/equipamentos/equipamento-schema";

export function ResumoNovoEquipamento({ control }: { control: Control<EquipamentoFormValues> }) {
  const valores = useWatch({ control });
  const tipo = valores.tipo ?? "escavadeira";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon={TIPO_ICONE[tipo]} className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {/* useWatch captura o valor antes do onChange do campo aplicar o uppercase, então normaliza aqui também */}
              {valores.nome?.trim().toUpperCase() || "Novo equipamento"}
            </div>
            <div className="text-xs text-muted-foreground">{TIPO_LABEL[tipo]}</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Capacidade"
            valor={valores.capacidade?.trim() || "a definir"}
            vazio={!valores.capacidade?.trim()}
          />
          <Linha
            rotulo="Identificador"
            valor={valores.identificador?.trim() || "a definir"}
            vazio={!valores.identificador?.trim()}
          />
          <Linha rotulo="Horímetro" valor={formatHorimetro(valores.horimetro_atual ?? 0)} />
          <Linha rotulo="Status" valor={STATUS_LABEL[valores.status ?? "disponivel"]} />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O equipamento fica disponível para <strong className="text-foreground">apontamentos</strong>{" "}
          e <strong className="text-foreground">OS</strong>. O horímetro alimenta o{" "}
          <strong className="text-foreground">Custo da Hora</strong> e os{" "}
          <strong className="text-foreground">planos de manutenção</strong>.
        </p>
      </div>
    </div>
  );
}
