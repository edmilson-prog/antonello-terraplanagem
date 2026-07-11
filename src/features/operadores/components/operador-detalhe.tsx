import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { formatDataHora, formatDocumento, formatTelefone } from "@/shared/lib/format";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { StatusOSBadge } from "@/features/ordem-servico/labels";

export function OperadorDetalhe({ operadorId }: { operadorId: string }) {
  const operador = operadoresStore.useOperador(operadorId);
  const { isLoading, error } = operadoresStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  const osDoOperador = ordensStore.useTodas().filter((o) => o.responsavel_id === operadorId);

  const voltar = (
    <Link
      to="/admin/operadores"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Operadores
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        {voltar}
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        {voltar}
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
        >
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={operadoresStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!operador) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">Operador não encontrado</h2>
        <Link
          to="/admin/operadores"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Voltar para Operadores
        </Link>
      </div>
    );
  }

  const reativar = async () => {
    try {
      await operadoresStore.setAtivo(operador.id, true);
      toast.success("Operador reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const confirmarInativar = async () => {
    try {
      await operadoresStore.setAtivo(operador.id, false);
      toast.success("Operador inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(false);
  };

  return (
    <div className="space-y-6">
      {voltar}

      <PageHeader
        titulo={operador.nome}
        acoes={
          <div className="flex items-center gap-2">
            <StatusAtivo ativo={operador.ativo} />
            {!editando ? (
              <>
                <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
                  <Icon icon="lucide:pencil" className="h-4 w-4" />
                  Editar
                </Button>
                {operador.ativo ? (
                  <Button
                    variant="outline"
                    onClick={() => setInativando(true)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Icon icon="lucide:ban" className="h-4 w-4" />
                    Inativar
                  </Button>
                ) : (
                  <Button variant="outline" onClick={reativar} className="gap-1.5">
                    <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
                    Reativar
                  </Button>
                )}
              </>
            ) : null}
          </div>
        }
      />

      {editando ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
            Editar dados básicos
          </h3>
          <OperadorForm
            inicial={operador}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                CPF
              </dt>
              <dd className="mt-1 font-mono text-sm text-card-foreground">
                {formatDocumento(operador.cpf)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Telefone
              </dt>
              <dd className="mt-1 font-mono text-sm text-card-foreground">
                {formatTelefone(operador.telefone)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Operador desde
              </dt>
              <dd className="mt-1 text-sm text-card-foreground">
                {formatDataHora(operador.created_at)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Atividade no sistema
        </h3>
        <SecaoAtividade
          titulo="Ordens de Serviço"
          icone="lucide:file-text"
          quantidade={osDoOperador.length}
          vazio="Nenhuma OS registrada com este operador como responsável."
        >
          {osDoOperador.map((o) => (
            <li key={o.id}>
              <Link
                to="/admin/ordens/$ordemId"
                params={{ ordemId: o.id }}
                className="-mx-1 flex items-center justify-between gap-3 rounded px-1 py-2.5 text-sm hover:bg-muted/40"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-xs text-foreground-faint">{o.numero}</span>
                  <span className="truncate text-card-foreground">{o.obra_nome}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <StatusOSBadge status={o.status} />
                  <Icon icon="lucide:chevron-right" className="h-4 w-4 text-muted-foreground" />
                </span>
              </Link>
            </li>
          ))}
        </SecaoAtividade>
      </section>

      <ConfirmDialog
        open={inativando}
        onOpenChange={setInativando}
        titulo="Inativar operador?"
        descricao={`"${operador.nome}" não poderá ser atribuído a novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}

function SecaoAtividade({
  titulo,
  icone,
  quantidade,
  vazio,
  children,
}: {
  titulo: string;
  icone: string;
  quantidade: number;
  vazio: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          <Icon icon={icone} className="h-4 w-4" />
          {titulo}
        </h4>
        <span className="font-mono text-xs text-muted-foreground">{quantidade}</span>
      </div>
      {quantidade === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="divide-y divide-border">{children}</ul>
      )}
    </div>
  );
}
