import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cobrancasStore } from "@/features/cobranca-gateway/cobrancas-store";
import { PROVEDOR_GATEWAY_LABEL } from "@/features/cobranca-gateway/labels";
import { useProvedorGatewayAtivo } from "@/features/integracoes/use-provedor-gateway";
import type { ContaReceber, ProvedorGateway } from "@/shared/types";

const PROVEDORES: ProvedorGateway[] = ["mercado_pago", "asaas"];

interface EmitirCobrancaDialogProps {
  conta: ContaReceber | null;
  onOpenChange: (open: boolean) => void;
}

export function EmitirCobrancaDialog({ conta, onOpenChange }: EmitirCobrancaDialogProps) {
  const { provedor: provedorPadrao } = useProvedorGatewayAtivo();
  const [provedor, setProvedor] = useState<ProvedorGateway>(provedorPadrao);
  const [emitindo, setEmitindo] = useState(false);

  useEffect(() => {
    if (conta) setProvedor(provedorPadrao);
  }, [conta, provedorPadrao]);

  function handleEmitir() {
    if (!conta) return;
    setEmitindo(true);
    const r = cobrancasStore.emitirCobranca(conta.id, provedor);
    setEmitindo(false);
    if (r.ok) {
      toast.success(`Cobrança emitida via ${PROVEDOR_GATEWAY_LABEL[provedor]}.`);
      onOpenChange(false);
    } else {
      toast.error(r.motivo);
    }
  }

  return (
    <FormDialog
      open={conta !== null}
      onOpenChange={onOpenChange}
      titulo="Emitir Cobrança"
      descricao="Selecione o gateway para gerar o boleto/PIX desta conta."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="provedor-gateway">Gateway</Label>
          <Select value={provedor} onValueChange={(v) => setProvedor(v as ProvedorGateway)}>
            <SelectTrigger id="provedor-gateway">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVEDORES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVEDOR_GATEWAY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEmitir} disabled={emitindo}>
            {emitindo ? "Emitindo…" : "Emitir Cobrança"}
          </Button>
        </div>
      </div>
    </FormDialog>
  );
}
