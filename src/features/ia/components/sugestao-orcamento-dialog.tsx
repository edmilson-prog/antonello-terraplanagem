import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/shared/components/form-dialog";
import { BotaoIA } from "@/features/ia/components/botao-ia";
import { sugerirOrcamento } from "@/features/ia/mock/comercial";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { criarItemHora, criarItemMetro } from "@/features/orcamentos/calculo";
import type { SugestaoOrcamento } from "@/features/ia/types";
import type { ModeloCobranca, OrcamentoItem } from "@/shared/types";

interface SugestaoOrcamentoDialogProps {
  clienteId: string;
  modeloCobranca: ModeloCobranca;
  onConfirmar: (itens: OrcamentoItem[]) => void;
}

export function SugestaoOrcamentoDialog({ clienteId, modeloCobranca, onConfirmar }: SugestaoOrcamentoDialogProps) {
  const [aberto, setAberto] = useState(false);
  const [sugestao, setSugestao] = useState<SugestaoOrcamento | null>(null);
  const equipamentos = equipamentosStore.useAll();
  const precosHM = precoHoraMaquinaStore.useAll();
  const precosFund = precoFundacaoStore.useAll();

  async function buscar() {
    const resultado = await sugerirOrcamento({
      clienteId,
      modeloCobranca: modeloCobranca === "por_metro" ? "por_metro" : "hora_maquina",
    });
    setSugestao(resultado);
    setAberto(true);
  }

  function confirmar() {
    if (!sugestao) return;
    const itens: OrcamentoItem[] = sugestao.itens.flatMap((item) => {
      if (item.tipo === "hora_maquina") {
        const equipamento = equipamentos.find((e) => e.id === item.origem_id);
        return equipamento ? [criarItemHora(equipamento, precosHM, item.quantidade_estimada)] : [];
      }
      const preco = precosFund.find((p) => p.id === item.origem_id);
      return preco ? [criarItemMetro(preco, item.quantidade_estimada)] : [];
    });
    onConfirmar(itens);
    setAberto(false);
  }

  return (
    <>
      <BotaoIA label="Sugerir com IA" labelProcessando="Buscando obras semelhantes…" onAcionar={buscar} size="sm" />
      <FormDialog
        open={aberto}
        onOpenChange={setAberto}
        titulo="Sugestão de orçamento (IA)"
        descricao={sugestao?.justificativa ?? ""}
      >
        {sugestao && sugestao.itens.length > 0 ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {sugestao.itens.map((item) => (
                <li key={item.origem_id} className="rounded-md border bg-surface/40 p-3 text-sm">
                  <p className="font-medium text-foreground">
                    {item.tipo === "hora_maquina"
                      ? (equipamentos.find((e) => e.id === item.origem_id)?.nome ?? "Equipamento")
                      : "Estaqueamento"}{" "}
                    — {item.quantidade_estimada} {item.tipo === "hora_maquina" ? "h" : "m"}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.justificativa}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Descartar
              </Button>
              <Button type="button" onClick={confirmar}>
                Adicionar itens sugeridos
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{sugestao?.justificativa ?? "Sem sugestão disponível."}</p>
        )}
      </FormDialog>
    </>
  );
}
