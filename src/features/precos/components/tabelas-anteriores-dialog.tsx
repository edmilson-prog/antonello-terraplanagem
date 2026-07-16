import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPO_HISTORICO_LABEL, descreverHistorico } from "@/features/precos/labels";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function TabelasAnterioresDialog({ open, onOpenChange }: Props) {
  const historico = historicoPrecosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Tabelas anteriores</DialogTitle>
          <DialogDescription>
            Histórico de alterações nos preços de hora-máquina, por metro e mobilização.
          </DialogDescription>
        </DialogHeader>
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Icon icon="lucide:history" className="mb-3 h-10 w-10 text-foreground-faint" />
            <p className="text-sm font-medium text-foreground">Nenhuma alteração registrada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Alterações em preços existentes aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {historico.map((entrada) => {
              const { titulo, detalhe } = descreverHistorico(entrada, equipamentos);
              return (
                <li key={entrada.id} className="rounded-lg border bg-surface/40 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{titulo}</span>
                    <span className="rounded-full border bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {TIPO_HISTORICO_LABEL[entrada.tipo]}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{detalhe}</span>
                    <span className="font-mono">{formatarData(entrada.alterado_em)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
