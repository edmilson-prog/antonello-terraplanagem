import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { formatBRL } from "@/features/retaguarda/format";
import type { Equipamento } from "@/shared/types";

interface Props {
  equipamento: Equipamento | undefined;
  litros: string;
  horimetro: string;
  precoLitro: string;
  custoTotal: string;
  local: string;
}

export function ResumoNovoAbastecimento({
  equipamento,
  litros,
  horimetro,
  precoLitro,
  custoTotal,
  local,
}: Props) {
  const litrosNum = Number(litros) || 0;
  const precoNum = Number(precoLitro) || 0;
  const custoManual = Number(custoTotal) || 0;

  const custoEstimado = custoManual === 0 && litrosNum > 0 && precoNum > 0;
  const total = custoManual > 0 ? custoManual : custoEstimado ? litrosNum * precoNum : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:fuel" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {equipamento?.nome ?? "Novo abastecimento"}
            </div>
            <div className="text-xs text-muted-foreground">diesel</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Litros"
            valor={litrosNum > 0 ? `${litrosNum.toLocaleString("pt-BR")} L` : "a definir"}
            vazio={litrosNum === 0}
          />
          <Linha
            rotulo="Horímetro"
            valor={horimetro.trim() || "a definir"}
            vazio={!horimetro.trim()}
          />
          <Linha
            rotulo="Preço/litro"
            valor={precoNum > 0 ? `${formatBRL(precoNum)}/L` : "a definir"}
            vazio={precoNum === 0}
          />
          <Linha rotulo="Local" valor={local.trim() || "a definir"} vazio={!local.trim()} />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <div>
            <span className="text-sm text-muted-foreground">Custo do abastecimento</span>
            {custoEstimado ? (
              <div className="text-[10.5px] text-foreground-faint">
                estimado: litros × preço/litro
              </div>
            ) : null}
          </div>
          <span className="font-mono text-lg font-bold text-primary">{formatBRL(total)}</span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Entra no <strong className="text-foreground">Custo da Hora</strong> do equipamento pelo
          horímetro. Preço e custo são <strong className="text-foreground">opcionais</strong> — se
          informar só um dos dois, o outro é estimado aqui no resumo.
        </p>
      </div>
    </div>
  );
}
