import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import type { AlertaManutencao } from "@/features/manutencao/derivacoes";

interface RegistrarManutencaoDialogProps {
  alerta: AlertaManutencao | null;
  onOpenChange: (open: boolean) => void;
}

export function RegistrarManutencaoDialog({
  alerta,
  onOpenChange,
}: RegistrarManutencaoDialogProps) {
  const [horimetroRealizado, setHorimetroRealizado] = useState("");
  const [custo, setCusto] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (alerta) {
      setHorimetroRealizado(String(alerta.equipamento.horimetro_atual));
      setCusto("");
      setObservacao("");
    }
  }, [alerta]);

  function handleConfirmar() {
    if (!alerta) return;
    const valor = Number(horimetroRealizado);
    if (Number.isNaN(valor) || valor < 0) {
      toast.error("Informe um horímetro válido.");
      return;
    }
    setSalvando(true);
    const r = registrosManutencaoStore.registrarRealizada(alerta.registro.id, {
      horimetroRealizado: valor,
      intervaloHoras: alerta.plano.intervalo_horas,
      custo: custo.trim() ? Number(custo) : null,
      observacao: observacao.trim() || null,
    });
    setSalvando(false);
    if (r.ok) {
      toast.success("Manutenção registrada. O ciclo foi reiniciado.");
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={alerta !== null}
      onOpenChange={onOpenChange}
      titulo="Registrar Manutenção Realizada"
      descricao={alerta ? `${alerta.equipamento.nome} — ${alerta.plano.descricao}` : undefined}
    >
      <div className="space-y-4">
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
            value={custo}
            onChange={(e) => setCusto(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="observacao">Observação — opcional</Label>
          <Textarea
            id="observacao"
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando || !horimetroRealizado}>
            {salvando ? "Salvando…" : "Registrar Manutenção"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
