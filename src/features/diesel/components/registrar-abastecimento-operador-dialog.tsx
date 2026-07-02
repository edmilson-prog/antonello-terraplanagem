import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HorimetroCapture } from "@/shared/components/horimetro-capture";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { abastecimentoOperadorSchema } from "@/features/diesel/abastecimento-schema";
import { OPERADOR_LOGADO_ID } from "@/features/apontamento/apontamentos-store";

interface RegistrarAbastecimentoOperadorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipamentoId: string;
  horimetroAtual?: number;
}

// Barreira financeira (RF-003/RF-008): este dialog NUNCA coleta dados
// financeiros — os campos nem existem aqui. equipamento_id vem do contexto
// (o apontamento em detalhe), sem seletor.
export function RegistrarAbastecimentoOperadorDialog({
  open,
  onOpenChange,
  equipamentoId,
  horimetroAtual,
}: RegistrarAbastecimentoOperadorDialogProps) {
  const [litros, setLitros] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [local, setLocal] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setLitros("");
      setHorimetro("");
      setLocal("");
      setErro(null);
    }
  }, [open]);

  function handleConfirmar() {
    if (litros.trim() === "" || horimetro.trim() === "") {
      setErro("Informe litros e horímetro.");
      return;
    }
    const parsed = abastecimentoOperadorSchema.safeParse({
      litros: Number(litros),
      horimetro: Number(horimetro),
    });
    if (!parsed.success) {
      setErro("Informe litros e horímetro válidos.");
      return;
    }
    setSalvando(true);
    const r = abastecimentosStore.registrar({
      equipamento_id: equipamentoId,
      litros: parsed.data.litros,
      horimetro: parsed.data.horimetro,
      operador_id: OPERADOR_LOGADO_ID,
      local: local.trim() || null,
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(
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
      descricao="Litros e horímetro do momento."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="ab-op-litros">Litros *</Label>
          <Input
            id="ab-op-litros"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            className="h-12 font-mono text-lg"
            value={litros}
            onChange={(e) => {
              setLitros(e.target.value);
              setErro(null);
            }}
          />
        </div>
        <HorimetroCapture
          label="Horímetro *"
          value={horimetro}
          onChange={(v) => {
            setHorimetro(v);
            setErro(null);
          }}
          ocrBase={horimetroAtual}
        />
        <div className="space-y-1.5">
          <Label htmlFor="ab-op-local">Local — opcional</Label>
          <Input id="ab-op-local" value={local} onChange={(e) => setLocal(e.target.value)} />
        </div>
        {erro ? <p className="text-xs text-destructive">{erro}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando || !litros || !horimetro}>
            {salvando ? "Salvando…" : "Registrar"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
