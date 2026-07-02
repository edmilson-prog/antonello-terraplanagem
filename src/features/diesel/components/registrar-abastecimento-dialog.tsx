import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import type { Equipamento } from "@/shared/types";

interface RegistrarAbastecimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipamentos: Equipamento[];
}

export function RegistrarAbastecimentoDialog({
  open,
  onOpenChange,
  equipamentos,
}: RegistrarAbastecimentoDialogProps) {
  const [equipamentoId, setEquipamentoId] = useState("");
  const [litros, setLitros] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [precoLitro, setPrecoLitro] = useState("");
  const [custoTotal, setCustoTotal] = useState("");
  const [local, setLocal] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setEquipamentoId("");
      setLitros("");
      setHorimetro("");
      setPrecoLitro("");
      setCustoTotal("");
      setLocal("");
    }
  }, [open]);

  function handleConfirmar() {
    const litrosNum = Number(litros);
    const horimetroNum = Number(horimetro);
    if (!equipamentoId) {
      toast.error("Selecione o equipamento.");
      return;
    }
    if (!litros.trim() || Number.isNaN(litrosNum) || litrosNum <= 0) {
      toast.error("Informe os litros abastecidos.");
      return;
    }
    if (!horimetro.trim() || Number.isNaN(horimetroNum) || horimetroNum < 0) {
      toast.error("Informe o horímetro no momento do abastecimento.");
      return;
    }
    setSalvando(true);
    const r = abastecimentosStore.registrar({
      equipamento_id: equipamentoId,
      litros: litrosNum,
      horimetro: horimetroNum,
      preco_litro: precoLitro.trim() ? Number(precoLitro) : null,
      custo_total: custoTotal.trim() ? Number(custoTotal) : null,
      local: local.trim() || null,
    });
    setSalvando(false);
    if (!r.ok) {
      toast.error(
        r.erro === "litros_invalido"
          ? "Os litros devem ser maiores que zero."
          : "O horímetro não pode ser menor que o último abastecimento deste equipamento.",
      );
      return;
    }
    toast.success("Abastecimento registrado.");
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      titulo="Registrar Abastecimento"
      descricao="Litros e horímetro são obrigatórios; custo é opcional."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="diesel-equipamento">Equipamento *</Label>
          <Select value={equipamentoId} onValueChange={setEquipamentoId}>
            <SelectTrigger id="diesel-equipamento">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {equipamentos.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="diesel-litros">Litros *</Label>
            <Input
              id="diesel-litros"
              type="number"
              step="0.1"
              min="0"
              className="font-mono"
              value={litros}
              onChange={(e) => setLitros(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diesel-horimetro">Horímetro *</Label>
            <Input
              id="diesel-horimetro"
              type="number"
              step="0.1"
              min="0"
              className="font-mono"
              value={horimetro}
              onChange={(e) => setHorimetro(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="diesel-preco">Preço/litro (R$) — opcional</Label>
            <Input
              id="diesel-preco"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={precoLitro}
              onChange={(e) => setPrecoLitro(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diesel-custo">Custo total (R$) — opcional</Label>
            <Input
              id="diesel-custo"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={custoTotal}
              onChange={(e) => setCustoTotal(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="diesel-local">Local — opcional</Label>
          <Input
            id="diesel-local"
            placeholder="Posto, comboio próprio..."
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando}>
            {salvando ? "Salvando…" : "Registrar Abastecimento"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
