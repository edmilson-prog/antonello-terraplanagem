import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Linha } from "@/shared/components/linha-resumo";
import { EquipamentoStatusBadge, TIPO_LABEL, TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatHorimetro } from "@/shared/lib/format";
import type { EquipamentoFormValues } from "@/features/equipamentos/equipamento-schema";

export function ResumoNovoEquipamento({ control }: { control: Control<EquipamentoFormValues> }) {
  const valores = useWatch({ control });
  const tipo = valores.tipo ?? "escavadeira";
  const propria = (valores.propriedade ?? "propria") === "propria";
  const marcaValor = valores.marca?.trim()
    ? valores.marca.trim() + (valores.ano?.trim() ? " · " + valores.ano.trim() : "")
    : "";

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
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="border-steel/40 bg-steel/20 text-foreground">
                {TIPO_LABEL[tipo]}
              </Badge>
              <Badge
                variant="outline"
                className={
                  propria
                    ? "border-primary/50 bg-primary/20 text-foreground"
                    : "border-secondary/50 bg-secondary/20 text-foreground"
                }
              >
                {propria ? "Própria" : "Locada"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Capacidade"
            valor={valores.capacidade?.trim() || "a definir"}
            vazio={!valores.capacidade?.trim()}
          />
          <Linha rotulo="Marca" valor={marcaValor || "a definir"} vazio={!marcaValor} />
          <Linha
            rotulo="Placa/pat."
            valor={valores.identificador?.trim() || "a definir"}
            vazio={!valores.identificador?.trim()}
          />
          <Linha rotulo="Horímetro" valor={formatHorimetro(valores.horimetro_atual ?? 0)} />
          <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span className="text-muted-foreground">Situação</span>
            <EquipamentoStatusBadge status="disponivel" />
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O equipamento fica disponível para{" "}
          <strong className="text-foreground">apontamentos</strong> e{" "}
          <strong className="text-foreground">OS</strong>. O horímetro alimenta o{" "}
          <strong className="text-foreground">Custo da Hora</strong> e dispara os{" "}
          <strong className="text-foreground">planos de manutenção</strong> pelo intervalo definido.
        </p>
      </div>
    </div>
  );
}
