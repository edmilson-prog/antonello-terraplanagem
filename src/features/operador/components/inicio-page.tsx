import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { SyncBadge } from "@/shared/components/sync-badge";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import {
  apontamentosStore,
  apontamentosDoOperador,
  apontamentoEmAndamentoDoOperador,
} from "@/features/apontamento/apontamentos-store";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { ApontamentoCard } from "@/features/apontamento/components/apontamento-card";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { ordensDoOperador, statusEfetivoOS } from "@/features/ordem-servico/derivacoes";
import { StatusOSBadge } from "@/features/ordem-servico/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { RegistrarAbastecimentoOperadorDialog } from "@/features/diesel/components/registrar-abastecimento-operador-dialog";

export function InicioOperadorPage() {
  const todosApontamentos = apontamentosStore.useTodos();
  const todasOrdens = ordensStore.useTodas();
  const { isLoading, error, retry } = useMockResource(todosApontamentos);
  const [abastecimentoAberto, setAbastecimentoAberto] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
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

  const operadorLogadoId = getOperadorLogadoId();
  const emAndamento = apontamentoEmAndamentoDoOperador(todosApontamentos, operadorLogadoId);
  const equipamentoEmAndamento = emAndamento
    ? equipamentosStore.getById(emAndamento.equipamento_id)
    : undefined;

  const minhasOrdens = ordensDoOperador(todasOrdens, todosApontamentos, operadorLogadoId);
  const ordensAtivas = minhasOrdens.filter((o) => statusEfetivoOS(o, todosApontamentos) !== "fechada");

  const meusApontamentos = apontamentosDoOperador(todosApontamentos, operadorLogadoId);
  const pendentesSync =
    meusApontamentos.filter((a) => a.pendente_sync).length +
    minhasOrdens.filter((o) => o.pendente_sync).length;

  return (
    <div className="space-y-6">
      {pendentesSync > 0 ? (
        <div className="flex items-center justify-between rounded-lg border border-steel/40 bg-steel/10 px-4 py-2.5">
          <SyncBadge />
          <span className="font-mono text-xs text-foreground-faint">
            {pendentesSync} {pendentesSync === 1 ? "item" : "itens"}
          </span>
        </div>
      ) : null}

      <section className="space-y-3">
        {emAndamento ? (
          <>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
              Apontamento em andamento
            </h2>
            <ApontamentoCard apontamento={emAndamento} />
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbastecimentoAberto(true)}
              className="w-full gap-2"
            >
              <Icon icon="lucide:fuel" className="h-4 w-4" />
              Registrar abastecimento
            </Button>
          </>
        ) : (
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
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Minhas OS
          </h2>
          <Link
            to="/app/ordens"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {ordensAtivas.length === 0 ? (
          <EmptyState
            icon="lucide:file-text"
            titulo="Nenhuma OS ativa"
            descricao="Suas ordens de serviço aparecerão aqui."
          />
        ) : (
          <ul className="space-y-3">
            {ordensAtivas.map((o) => {
              const cliente = clientesStore.getById(o.cliente_id);
              return (
                <li key={o.id}>
                  <Link
                    to="/app/ordens/$ordemId"
                    params={{ ordemId: o.id }}
                    className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/60 active:bg-surface"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground">{o.numero}</span>
                        <StatusOSBadge status={statusEfetivoOS(o, todosApontamentos)} />
                      </div>
                      <div className="truncate font-display text-sm font-bold text-card-foreground">
                        {cliente?.nome ?? "Cliente"}
                      </div>
                    </div>
                    <Icon icon="lucide:chevron-right" className="h-5 w-5 shrink-0 text-foreground-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {emAndamento ? (
        <RegistrarAbastecimentoOperadorDialog
          open={abastecimentoAberto}
          onOpenChange={setAbastecimentoAberto}
          equipamentoId={emAndamento.equipamento_id}
          horimetroAtual={equipamentoEmAndamento?.horimetro_atual}
        />
      ) : null}
    </div>
  );
}
