import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import type { ContaPagar } from "@/shared/types";

interface DarBaixaPagarDialogProps {
  conta: ContaPagar | null;
  onOpenChange: (open: boolean) => void;
}

export function DarBaixaPagarDialog({ conta, onOpenChange }: DarBaixaPagarDialogProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [pagoEm, setPagoEm] = useState(hoje);
  const [salvando, setSalvando] = useState(false);

  function handleConfirmar() {
    if (!conta) return;
    setSalvando(true);
    const r = contasPagarStore.darBaixaPagar(conta.id, pagoEm);
    setSalvando(false);
    if (r.ok) {
      toast.success("Pagamento registrado com sucesso.");
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={conta !== null}
      onOpenChange={onOpenChange}
      titulo="Dar Baixa — Conta a Pagar"
      descricao={conta ? `Confirmar pagamento: ${conta.descricao}` : undefined}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="data-pagamento">Data de Pagamento</Label>
          <Input
            id="data-pagamento"
            type="date"
            value={pagoEm}
            onChange={(e) => setPagoEm(e.target.value)}
            max={hoje}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando || !pagoEm}>
            {salvando ? "Salvando…" : "Confirmar Pagamento"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
