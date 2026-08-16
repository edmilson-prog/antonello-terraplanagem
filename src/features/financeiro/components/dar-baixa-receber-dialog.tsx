import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParametroTexto } from "@/features/parametros/uso";
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
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { FORMA_RECEBIMENTO_LABEL } from "@/features/financeiro/labels";
import type { ContaReceber, FormaRecebimento } from "@/shared/types";

const FORMAS: FormaRecebimento[] = [
  "dinheiro",
  "pix",
  "transferencia",
  "boleto",
  "cheque",
  "outro",
];

interface DarBaixaReceberDialogProps {
  conta: ContaReceber | null;
  onOpenChange: (open: boolean) => void;
}

export function DarBaixaReceberDialog({ conta, onOpenChange }: DarBaixaReceberDialogProps) {
  const hoje = new Date().toISOString().slice(0, 10);
  const formaPadrao = useParametroTexto("recebimento_padrao", "pix") as FormaRecebimento;
  const [recebidoEm, setRecebidoEm] = useState(hoje);
  const [forma, setForma] = useState<FormaRecebimento>(formaPadrao);
  const [salvando, setSalvando] = useState(false);

  // Cada abertura do diálogo parte da forma padrão configurada em Parâmetros,
  // em vez de guardar a escolha da baixa anterior.
  useEffect(() => {
    if (conta) setForma(formaPadrao);
  }, [conta, formaPadrao]);

  function handleConfirmar() {
    if (!conta) return;
    setSalvando(true);
    const r = contasReceberStore.darBaixaReceber(conta.id, {
      recebido_em: recebidoEm,
      forma_recebimento: forma,
    });
    setSalvando(false);
    if (r.ok) {
      toast.success("Recebimento registrado com sucesso.");
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={conta !== null}
      onOpenChange={onOpenChange}
      titulo="Dar Baixa — Conta a Receber"
      descricao="Informe a data e a forma de recebimento."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="data-recebimento">Data de Recebimento</Label>
          <Input
            id="data-recebimento"
            type="date"
            value={recebidoEm}
            onChange={(e) => setRecebidoEm(e.target.value)}
            max={hoje}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="forma-recebimento">Forma de Recebimento</Label>
          <Select value={forma} onValueChange={(v) => setForma(v as FormaRecebimento)}>
            <SelectTrigger id="forma-recebimento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAS.map((f) => (
                <SelectItem key={f} value={f}>
                  {FORMA_RECEBIMENTO_LABEL[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={salvando || !recebidoEm}>
            {salvando ? "Salvando…" : "Confirmar Recebimento"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
