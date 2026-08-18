import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { SituacaoRegistroBadge, TIPO_MANUTENCAO_LABEL } from "@/features/manutencao/labels";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatBRL } from "@/features/retaguarda/format";
import { formatHorimetro } from "@/shared/lib/format";
import { textoParaNumero } from "@/features/parametros/derivacoes";
import type { Equipamento, PrioridadeManutencao, TipoManutencao } from "@/shared/types";
import { cn } from "@/lib/utils";

// Resumo ao vivo do UI kit: espelha o que será gravado enquanto o formulário é
// preenchido, e troca a nota quando a prioridade é alta.

const PRIORIDADE_CLASSE: Record<PrioridadeManutencao, string> = {
  alta: "border-destructive/40 bg-destructive/15 text-destructive",
  media: "border-primary/50 bg-primary/15 text-foreground",
  baixa: "border-steel/40 bg-steel/15 text-muted-foreground",
};

const PRIORIDADE_CURTA: Record<PrioridadeManutencao, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

interface Props {
  equipamento: Equipamento | undefined;
  tipo: TipoManutencao;
  prioridade: PrioridadeManutencao;
  descricao: string;
  horimetro: string;
  custo: string;
  fornecedor: string;
}

export function ResumoNovaManutencao({
  equipamento,
  tipo,
  prioridade,
  descricao,
  horimetro,
  custo,
  fornecedor,
}: Props) {
  const horimetroNum = textoParaNumero(horimetro);
  const custoNum = textoParaNumero(custo);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon
              icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:wrench"}
              className="h-6 w-6"
            />
          </div>
          <div className="min-w-0">
            <div
              className={cn(
                "truncate text-sm font-semibold",
                equipamento ? "text-foreground" : "text-foreground-faint",
              )}
            >
              {equipamento?.nome ?? "Equipamento a definir"}
            </div>
            <span className="mt-1 inline-flex items-center rounded-full border border-steel/40 bg-steel/15 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {TIPO_MANUTENCAO_LABEL[tipo]}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          <Linha
            rotulo="Serviço"
            valor={descricao.trim() || "a definir"}
            vazio={!descricao.trim()}
          />
          {/* Fora do componente Linha porque o valor é um selo, não texto. */}
          <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
            <span className="text-muted-foreground">Prioridade</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                PRIORIDADE_CLASSE[prioridade],
              )}
            >
              {PRIORIDADE_CURTA[prioridade]}
            </span>
          </div>
          <Linha
            rotulo="Horímetro"
            valor={horimetroNum != null ? formatHorimetro(horimetroNum) : "a definir"}
            vazio={horimetroNum == null}
          />
          <Linha
            rotulo="Custo est."
            valor={custoNum != null ? formatBRL(custoNum) : "a definir"}
            vazio={custoNum == null}
          />
          <Linha
            rotulo="Oficina"
            valor={fornecedor.trim() || "a definir"}
            vazio={!fornecedor.trim()}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Situação</span>
          <SituacaoRegistroBadge situacao="em_andamento" />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon
          icon={prioridade === "alta" ? "lucide:circle-alert" : "lucide:info"}
          className={cn("mt-0.5 h-4 w-4 shrink-0", prioridade === "alta" && "text-destructive")}
        />
        {prioridade === "alta" ? (
          <p>
            Prioridade <strong className="text-foreground">alta</strong> significa máquina fora de
            operação: o equipamento passa a contar em{" "}
            <strong className="text-foreground">Em manutenção</strong> até a ordem ser concluída.
          </p>
        ) : (
          <p>
            O custo confirmado na conclusão alimenta o{" "}
            <strong className="text-foreground">Custo da Hora</strong> do equipamento e o histórico
            da <strong className="text-foreground">ficha</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
