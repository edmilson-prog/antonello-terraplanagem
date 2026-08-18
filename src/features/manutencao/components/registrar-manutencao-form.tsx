import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { ResumoRegistrarManutencao } from "@/features/manutencao/components/resumo-registrar-manutencao";
import type { Equipamento, PlanoManutencao, RegistroManutencao } from "@/shared/types";

interface Props {
  registro: RegistroManutencao;
  equipamento: Equipamento;
  // Null quando a ordem foi aberta à mão (corretiva ou preventiva avulsa).
  plano: PlanoManutencao | null;
  onCancel: () => void;
}

export function RegistrarManutencaoForm({ registro, equipamento, plano, onCancel }: Props) {
  const navigate = useNavigate();
  const [horimetroRealizado, setHorimetroRealizado] = useState(String(equipamento.horimetro_atual));
  // Corretiva costuma nascer com custo estimado; a conclusão só o confirma.
  const [custo, setCusto] = useState(registro.custo != null ? String(registro.custo) : "");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleConfirmar() {
    const valor = Number(horimetroRealizado);
    if (Number.isNaN(valor) || valor < 0) {
      toast.error("Informe um horímetro válido.");
      return;
    }
    setSalvando(true);
    const r = await registrosManutencaoStore.registrarRealizada(registro.id, {
      horimetroRealizado: valor,
      intervaloHoras: plano?.intervalo_horas ?? null,
      custo: custo.trim() ? Number(custo) : null,
      observacao: observacao.trim() || null,
    });
    setSalvando(false);
    if (!r.ok) {
      toast.error(r.motivo);
      return;
    }
    toast.success(
      plano ? "Manutenção registrada. O ciclo foi reiniciado." : "Manutenção concluída.",
    );
    navigate({ to: "/admin/manutencao" });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados da manutenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="horimetro-realizado">Horímetro no momento *</Label>
            <Input
              id="horimetro-realizado"
              type="number"
              step="0.1"
              min="0"
              className="font-mono"
              value={horimetroRealizado}
              onChange={(e) => setHorimetroRealizado(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="custo">Custo (R$) — opcional</Label>
            <Input
              id="custo"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="font-mono"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação — opcional</Label>
            <Textarea
              id="observacao"
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={salvando || !horimetroRealizado.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {salvando ? "Salvando…" : plano ? "Registrar manutenção" : "Concluir manutenção"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResumoRegistrarManutencao
        registro={registro}
        equipamento={equipamento}
        plano={plano}
        horimetroRealizado={horimetroRealizado}
        custo={custo}
      />
    </div>
  );
}
