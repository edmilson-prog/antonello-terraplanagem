import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { formatDataHora } from "@/shared/lib/format";
import { idMockDoCliente } from "@/shared/lib/cliente-mock-id";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import { ClienteHero } from "@/features/clientes/components/cliente-hero";
import { ClienteKpis } from "@/features/clientes/components/cliente-kpis";
import { OrdensClienteCard } from "@/features/clientes/components/ordens-cliente-card";
import { ContasReceberCard } from "@/features/clientes/components/contas-receber-card";
import { DadosCadastraisClienteCard } from "@/features/clientes/components/dados-cadastrais-cliente-card";
import { OrcamentosClienteCard } from "@/features/clientes/components/orcamentos-cliente-card";
import { RecebimentosClienteCard } from "@/features/clientes/components/recebimentos-cliente-card";
import { FaroltiSnapshotCard } from "@/features/clientes/components/farolti-snapshot-card";
import { showcaseDoCliente } from "@/features/clientes/cliente-showcase-data";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import { contaVencida } from "@/features/financeiro/derivacoes";

export function ClienteDetalhe({ clienteId }: { clienteId: string }) {
  const cliente = clientesStore.useCliente(clienteId);
  const { isLoading, error } = clientesStore.useEstado();
  const [editando, setEditando] = useState(false);
  const [inativando, setInativando] = useState(false);

  const showcase = useMemo(() => showcaseDoCliente(clienteId), [clienteId]);

  const idMock = idMockDoCliente(clienteId);
  const osDoCliente = ordensStore.useTodas().filter((o) => o.cliente_id === idMock);
  const orcamentosDoCliente = orcamentosStore.useTodos().filter((o) => o.cliente_id === idMock);
  const contasDoCliente = contasReceberStore.useTodas().filter((c) => c.cliente_id === idMock);

  const osAtivas = osDoCliente.filter((o) => o.status !== "fechada").length;
  const orcamentosAbertos = orcamentosDoCliente.filter(
    (o) => o.status !== "aprovado" && o.status !== "recusado",
  ).length;

  const agoraISO = new Date().toISOString().slice(0, 10);
  const abertas = contasDoCliente.filter((c) => c.status === "aberta");
  const saldoReceber = abertas.reduce((s, c) => s + c.valor, 0);
  const vencidas = abertas.filter((c) => contaVencida(c, agoraISO)).length;
  const saldoRodape = `${abertas.length} título(s) · ${vencidas} vencido(s)`;

  const ordensView = osDoCliente.map((o, i) => ({
    id: o.id,
    numero: o.numero,
    obraNome: o.obra_nome,
    status: o.status,
    ...showcase.porOS[i % showcase.porOS.length],
  }));

  const ultimaOS = osDoCliente.length
    ? formatDataHora(
        [...osDoCliente].sort((a, b) => b.aberta_em.localeCompare(a.aberta_em))[0].aberta_em,
      )
    : showcase.ultimaOS;

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

  return (
    <div className="space-y-6">
      {voltar}

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
        <div className="space-y-4">
          <ClienteHero
            cliente={cliente}
            recorrente={showcase.recorrente}
            ultimaOS={ultimaOS}
            onEditar={() => setEditando(true)}
            onInativar={() => setInativando(true)}
            onReativar={reativar}
          />
          <ClienteKpis
            kpis={showcase.kpis}
            osAtivas={osAtivas}
            orcamentosAbertos={orcamentosAbertos}
            saldoReceber={saldoReceber}
            saldoRodape={saldoRodape}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <OrdensClienteCard ordens={ordensView} />
              <ContasReceberCard contas={contasDoCliente} />
            </div>
            <div className="space-y-4">
              <DadosCadastraisClienteCard cliente={cliente} cadastrais={showcase.cadastrais} />
              <OrcamentosClienteCard orcamentos={orcamentosDoCliente} />
              <RecebimentosClienteCard recebimentos={showcase.recebimentos} />
            </div>
          </div>
          <FaroltiSnapshotCard cliente={cliente} origemMigracao={showcase.origemMigracao} />
          <div className="mt-2 flex items-start gap-2.5 rounded-lg border border-dashed px-4 py-3 text-[12.5px] text-foreground-faint">
            <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
            <span>
              O snapshot do ERP legado (FarolTI) é <b>congelado</b> na importação; o restante da
              página é ao vivo. Recebimentos são dados de exemplo nesta fase.
            </span>
          </div>
        </div>
      )}

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
