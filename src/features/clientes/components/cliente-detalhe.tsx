import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { formatData, formatDataHora, formatDocumento, formatTelefone } from "@/shared/lib/format";
import { formatBRL } from "@/features/retaguarda/format";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteForm } from "@/features/clientes/components/cliente-form";

const TIPO_PESSOA_LABEL: Record<string, string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

const CURVA_LABEL: Record<string, string> = {
  A: "A — maior faturamento",
  B: "B — faturamento intermediário",
  C: "C — menor faturamento",
};

export function ClienteDetalhe({ clienteId }: { clienteId: string }) {
  const cliente = clientesStore.useCliente(clienteId);
  const { isLoading, error } = clientesStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  const voltar = (
    <Link
      to="/admin/clientes"
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon icon="lucide:arrow-left" className="h-4 w-4" />
      Clientes
    </Link>
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        {voltar}
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
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
          <Button variant="outline" onClick={clientesStore.retry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">Cliente não encontrado</h2>
        <Link
          to="/admin/clientes"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <Icon icon="lucide:arrow-left" className="h-4 w-4" />
          Voltar para Clientes
        </Link>
      </div>
    );
  }

  const reativar = async () => {
    try {
      await clientesStore.setAtivo(cliente.id, true);
      toast.success("Cliente reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o cliente${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const confirmarInativar = async () => {
    try {
      await clientesStore.setAtivo(cliente.id, false);
      toast.success("Cliente inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o cliente${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(false);
  };

  const temHistoricoLegado = cliente.cli_codigo_legado != null;

  return (
    <div className="space-y-6">
      {voltar}

      <PageHeader
        titulo={cliente.nome}
        descricao={cliente.tipo_pessoa ? TIPO_PESSOA_LABEL[cliente.tipo_pessoa] : undefined}
        acoes={
          <div className="flex items-center gap-2">
            <StatusAtivo ativo={cliente.ativo} />
            {!editando ? (
              <>
                <Button variant="outline" onClick={() => setEditando(true)} className="gap-1.5">
                  <Icon icon="lucide:pencil" className="h-4 w-4" />
                  Editar
                </Button>
                {cliente.ativo ? (
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
          <ClienteForm
            inicial={cliente}
            onSuccess={() => setEditando(false)}
            onCancel={() => setEditando(false)}
          />
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Documento
              </dt>
              <dd className="mt-1 font-mono text-sm text-card-foreground">
                {formatDocumento(cliente.documento ?? null)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Telefone
              </dt>
              <dd className="mt-1 font-mono text-sm text-card-foreground">
                {formatTelefone(cliente.telefone ?? null)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wide text-foreground-faint">
                Cliente desde
              </dt>
              <dd className="mt-1 text-sm text-card-foreground">
                {formatDataHora(cliente.created_at)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {temHistoricoLegado ? (
        <section className="space-y-4">
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
              Histórico no ERP legado (FarolTI)
            </h3>
            <p className="text-xs text-muted-foreground">
              Snapshot importado no cadastro (código {cliente.cli_codigo_legado}) — não é
              recalculado ao vivo pelo sistema.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              rotulo="Faturado (LTV)"
              valor={cliente.legado_ltv != null ? formatBRL(cliente.legado_ltv) : "—"}
              icone="lucide:wallet"
            />
            <KpiCard
              rotulo="Ticket médio"
              valor={
                cliente.legado_ticket_medio != null ? formatBRL(cliente.legado_ticket_medio) : "—"
              }
              icone="lucide:receipt"
            />
            <KpiCard
              rotulo="OS realizadas"
              valor={
                cliente.legado_frequencia_os != null ? String(cliente.legado_frequencia_os) : "—"
              }
              icone="lucide:file-text"
            />
            <KpiCard
              rotulo="Curva ABC"
              valor={cliente.legado_curva_abc ?? "—"}
              descricao={
                cliente.legado_curva_abc ? CURVA_LABEL[cliente.legado_curva_abc] : undefined
              }
              icone="lucide:trending-up"
            />
            <KpiCard
              rotulo="Primeira OS"
              valor={formatData(cliente.legado_primeira_os ?? null)}
              icone="lucide:calendar"
            />
            <KpiCard
              rotulo="Última OS"
              valor={formatData(cliente.legado_ultima_os ?? null)}
              icone="lucide:calendar-clock"
            />
            <KpiCard
              rotulo="Recência"
              valor={
                cliente.legado_recencia_dias != null ? `${cliente.legado_recencia_dias} dias` : "—"
              }
              descricao="Desde a última OS"
              icone="lucide:history"
            />
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={inativando}
        onOpenChange={setInativando}
        titulo="Inativar cliente?"
        descricao={`"${cliente.nome}" não aparecerá para novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
