import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { OrdemResumoCard } from "@/features/ordem-servico/components/ordem-resumo-card";
import { ApontamentosDaOS } from "@/features/ordem-servico/components/apontamentos-da-os";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosDaOS, podeFecharOS, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export function OrdemDetalheRetaguarda({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const apontamentos = apontamentosStore.useTodos();
  const [editando, setEditando] = useState(false);
  const [confirmarFechar, setConfirmarFechar] = useState(false);

  if (!ordem) return <OrdemNaoEncontradaAdmin />;

  const daOS = apontamentosDaOS(ordem.id, apontamentos);
  const fechada = statusEfetivoOS(ordem, apontamentos) === "fechada";
  const podeFechar = podeFecharOS(ordem, apontamentos);

  const fechar = () => {
    const r = ordensStore.fechar(ordem.id, apontamentos);
    if (!r.ok) {
      toast.error(r.motivo);
      setConfirmarFechar(false);
      return;
    }
    toast.success(`OS ${r.ordem.numero} fechada.`);
    setConfirmarFechar(false);
  };

  return (
    <div className="space-y-5">
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Ordens de Serviço
      </Link>

      <OrdemResumoCard ordem={ordem} apontamentos={apontamentos} />

      {ordem.observacao ? (
        <section className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground-faint">
            <Icon icon="lucide:sticky-note" className="h-4 w-4" />
            Observação
          </div>
          <p className="text-sm text-card-foreground">{ordem.observacao}</p>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Apontamentos ({daOS.length})
        </h3>
        <ApontamentosDaOS apontamentos={daOS} />
      </section>

      {!fechada ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
            <Icon icon="lucide:pencil" className="h-4 w-4" />
            Editar
          </Button>
          <Button
            onClick={() => setConfirmarFechar(true)}
            disabled={!podeFechar.pode}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:lock" className="h-4 w-4" />
            Fechar OS
          </Button>
          {!podeFechar.pode ? (
            <p className="w-full text-xs text-destructive">{podeFechar.motivo}</p>
          ) : null}
        </div>
      ) : null}

      <FormDialog
        open={editando}
        onOpenChange={setEditando}
        titulo="Editar OS"
        descricao="Os campos com * são obrigatórios."
      >
        <OrdemForm
          inicial={ordem}
          onSuccess={() => setEditando(false)}
          onCancel={() => setEditando(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={confirmarFechar}
        onOpenChange={setConfirmarFechar}
        titulo="Fechar esta OS?"
        descricao={`A OS ${ordem.numero} será marcada como fechada. Esta ação encerra os apontamentos da obra.`}
        confirmLabel="Fechar OS"
        onConfirm={fechar}
      />
    </div>
  );
}

function OrdemNaoEncontradaAdmin() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">OS não encontrada</h2>
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Ordens de Serviço
      </Link>
    </div>
  );
}
