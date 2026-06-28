import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import {
  apontamentosStore,
  apontamentosDoOperador,
  OPERADOR_LOGADO_ID,
} from "@/features/apontamento/apontamentos-store";
import { ApontamentoCard } from "@/features/apontamento/components/apontamento-card";

export function ApontamentosPage() {
  const todos = apontamentosStore.useTodos();
  const meus = apontamentosDoOperador(todos, OPERADOR_LOGADO_ID);
  const { isLoading, error, retry } = useMockResource(meus);

  const emAndamento = meus.filter((a) => a.status === "em_andamento");
  const recentes = meus.filter((a) => a.status === "finalizado");

  const botaoIniciar = (
    <Button
      size="lg"
      asChild
      className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
    >
      <Link to="/app/apontamento/novo">
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Iniciar apontamento
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={retry} className="gap-2">
          <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (meus.length === 0) {
    return (
      <EmptyState
        icon="lucide:clipboard-list"
        titulo="Nenhum apontamento ainda"
        descricao="Inicie o primeiro apontamento de horímetro do seu turno."
        acao={botaoIniciar}
      />
    );
  }

  return (
    <div className="space-y-6">
      {botaoIniciar}

      {emAndamento.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Em andamento
          </h2>
          {emAndamento.map((a) => (
            <ApontamentoCard key={a.id} apontamento={a} />
          ))}
        </section>
      ) : null}

      {recentes.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Recentes
          </h2>
          {recentes.map((a) => (
            <ApontamentoCard key={a.id} apontamento={a} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
