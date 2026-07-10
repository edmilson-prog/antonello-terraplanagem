import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdemResumoCard } from "@/features/ordem-servico/components/ordem-resumo-card";
import { ApontamentosDaOS } from "@/features/ordem-servico/components/apontamentos-da-os";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosDaOS, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";

export function OrdemDetalheOperador({ ordemId }: { ordemId: string }) {
  const ordem = ordensStore.useOrdem(ordemId);
  const { isLoading, error } = ordensStore.useEstado();
  const apontamentos = apontamentosStore.useTodos();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <Icon icon="lucide:triangle-alert" className="mx-auto h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={ordensStore.retry} className="gap-2">
          <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!ordem) return <OrdemNaoEncontrada />;

  const daOS = apontamentosDaOS(ordem.id, apontamentos);
  const fechada = statusEfetivoOS(ordem, apontamentos) === "fechada";

  return (
    <div className="space-y-5">
      <Link
        to="/app/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Minhas OS
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
        <Button
          size="lg"
          onClick={() => navigate({ to: "/app/apontamento/novo", search: { os: ordem.id } })}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Apontar nesta OS
        </Button>
      ) : null}
    </div>
  );
}

export function OrdemNaoEncontrada() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="font-display text-xl font-bold text-foreground">OS não encontrada</h2>
      <p className="text-sm text-muted-foreground">
        Esta ordem pode ter sido removida ou ainda não foi atribuída a você.
      </p>
      <Link
        to="/app/ordens"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Voltar para Minhas OS
      </Link>
    </div>
  );
}
