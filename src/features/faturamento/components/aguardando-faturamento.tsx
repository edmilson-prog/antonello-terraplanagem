import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import type { Apontamento, OrdemServico } from "@/shared/types";

interface AguardandoFaturamentoProps {
  ordens: OrdemServico[];
  apontamentos: Apontamento[];
}

export function AguardandoFaturamento({ ordens, apontamentos }: AguardandoFaturamentoProps) {
  const navigate = useNavigate();

  if (ordens.length === 0) return null;

  const gerar = async (os: OrdemServico) => {
    const fat = await faturamentosStore.gerarDeOS(
      os,
      apontamentos,
      equipamentosStore.getAll(),
      precoHoraMaquinaStore.getAll(),
      precoFundacaoStore.getAll(),
    );
    toast.success(`Rascunho ${fat.numero} gerado.`);
    navigate({ to: "/admin/faturamento/$faturamentoId", params: { faturamentoId: fat.id } });
  };

  return (
    <section className="space-y-3 rounded-xl border border-dashed bg-surface/40 p-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
        <Icon icon="lucide:clock" className="h-4 w-4" />
        Aguardando faturamento ({ordens.length})
      </h3>
      <ul className="space-y-2">
        {ordens.map((os) => (
          <li
            key={os.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-3"
          >
            <div className="min-w-0">
              <span className="font-mono text-sm font-semibold text-foreground">{os.numero}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {clientesStore.getById(os.cliente_id)?.nome ?? "—"} · {os.obra_nome}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => gerar(os)}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <Icon icon="lucide:file-plus-2" className="h-4 w-4" />
              Gerar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
