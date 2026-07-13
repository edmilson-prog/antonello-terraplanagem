import { useState } from "react";
import { BotaoIA } from "@/features/ia/components/botao-ia";
import { sugerirAlocacao } from "@/features/ia/mock/atendimento";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import type { SugestaoAlocacao } from "@/features/ia/types";
import type { ModeloCobranca } from "@/shared/types";

interface SugestaoAlocacaoPainelProps {
  modeloCobranca: ModeloCobranca;
}

export function SugestaoAlocacaoPainel({ modeloCobranca }: SugestaoAlocacaoPainelProps) {
  const [sugestoes, setSugestoes] = useState<SugestaoAlocacao[] | null>(null);
  const equipamentos = equipamentosStore.useAll();

  if (modeloCobranca !== "hora_maquina") {
    return (
      <p className="text-sm text-muted-foreground">
        Sugestão de alocação não se aplica ao modelo "por metro" — esse modelo não vincula um
        equipamento específico na abertura da OS.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <BotaoIA
        label="Sugerir equipamento disponível"
        onAcionar={async () => setSugestoes(await sugerirAlocacao({ modeloCobranca }))}
      />
      {sugestoes ? (
        sugestoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum equipamento disponível no momento — todos estão em uso.
          </p>
        ) : (
          <ul className="space-y-2">
            {sugestoes.map((s) => (
              <li key={s.equipamento_id} className="rounded-md border bg-surface/40 p-3 text-sm">
                <p className="font-medium text-foreground">
                  {equipamentos.find((e) => e.id === s.equipamento_id)?.nome ?? "Equipamento"}
                </p>
                <p className="text-xs text-muted-foreground">{s.justificativa}</p>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
