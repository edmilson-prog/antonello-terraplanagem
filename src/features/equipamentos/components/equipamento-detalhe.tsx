import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { formatDataHora, formatHorimetro } from "@/shared/lib/format";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";
import { EquipamentoStatusBadge, InativoBadge, TIPO_LABEL } from "@/features/equipamentos/labels";

export function EquipamentoDetalhe({ equipamentoId }: { equipamentoId: string }) {
  const equipamento = equipamentosStore.useEquipamento(equipamentoId);
  const { isLoading, error } = equipamentosStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  const voltar = (
    <Link
      to="/admin/equipamentos"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Equipamentos
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
          <Button variant="outline" onClick={equipamentosStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!equipamento) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">
          Equipamento não encontrado
        </h2>
        <Link
          to="/admin/equipamentos"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Voltar para Equipamentos
        </Link>
      </div>
    );
  }

  const reativar = async () => {
    try {
      await equipamentosStore.setAtivo(equipamento.id, true);
      toast.success("Equipamento reativado.");
    } catch (err) {
      toast.error(
        `Falha ao reativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
  };

  const confirmarInativar = async () => {
    try {
      await equipamentosStore.setAtivo(equipamento.id, false);
      toast.success("Equipamento inativado.");
    } catch (err) {
      toast.error(
        `Falha ao inativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
    setInativando(false);
  };

  return (
    <div className="space-y-6">
      {voltar}

      <PageHeader
        titulo={equipamento.nome}
        descricao={equipamento.identificador ?? undefined}
        acoes={
          <div className="flex items-center gap-2">
            {equipamento.ativo ? (
              <EquipamentoStatusBadge status={equipamento.status} />
            ) : (
              <InativoBadge />
            )}
            {!editando ? (
              <>
                <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
                  <Icon icon="lucide:pencil" className="h-4 w-4" />
                  Editar
                </Button>
                {equipamento.ativo ? (
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
          <EquipamentoForm
            inicial={equipamento}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Tipo
              </dt>
              <dd className="mt-1 text-sm text-card-foreground">{TIPO_LABEL[equipamento.tipo]}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Capacidade
              </dt>
              <dd className="mt-1 text-sm text-card-foreground">{equipamento.capacidade}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Horímetro atual
              </dt>
              <dd className="mt-1 font-mono text-sm text-card-foreground">
                {formatHorimetro(equipamento.horimetro_atual)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Identificador
              </dt>
              <dd className="mt-1 font-mono text-sm text-card-foreground">
                {equipamento.identificador ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Na frota desde
              </dt>
              <dd className="mt-1 text-sm text-card-foreground">
                {formatDataHora(equipamento.created_at)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <ConfirmDialog
        open={inativando}
        onOpenChange={setInativando}
        titulo="Inativar equipamento?"
        descricao={`"${equipamento.nome}" deixará de aparecer para novas ordens, mas permanece no histórico. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
