import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatBRL } from "@/features/retaguarda/format";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { PrecoFundacaoForm } from "@/features/precos/components/preco-fundacao-form";
import type { PrecoFundacao } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PrecoFundacaoList() {
  const todos = precoFundacaoStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PrecoFundacao | null>(null);
  const [inativando, setInativando] = useState<PrecoFundacao | null>(null);

  const lista = useMemo(
    () => todos.filter((p) => mostrarInativos || p.ativo),
    [todos, mostrarInativos],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PrecoFundacao) => {
    setEditando(p);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    historicoPrecosStore.registrar("fundacao", inativando);
    precoFundacaoStore.setAtivo(inativando.id, false);
    toast.success("Preço inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoFundacao) => {
    historicoPrecosStore.registrar("fundacao", p);
    precoFundacaoStore.setAtivo(p.id, true);
    toast.success("Preço reativado.");
  };

  const columns: Column<PrecoFundacao>[] = [
    {
      header: "Diâmetro",
      className: "font-mono",
      cell: (p) => <span className={cn(!p.ativo && "opacity-60")}>{p.diametro_broca_mm} mm</span>,
    },
    {
      header: "Valor/metro",
      className: "font-mono",
      cell: (p) => formatBRL(p.valor_metro),
    },
    {
      header: "Descrição",
      cell: (p) => <span className="text-muted-foreground">{p.descricao ?? "—"}</span>,
    },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PrecoFundacao) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(p)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {p.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(p)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(p)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (p: PrecoFundacao) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="font-display font-bold text-card-foreground">
          <span className="font-mono">{p.diametro_broca_mm} mm</span>
        </div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Valor/metro</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_metro)}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Descrição</dt>
          <dd className="text-foreground">{p.descricao ?? "—"}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(p)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
      <Button
        onClick={abrirNovo}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Novo preço
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataList
        data={lista}
        columns={columns}
        getRowKey={(p) => p.id}
        gridKey="admin-precos-fundacao"
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:drill",
          titulo: todos.length === 0 ? "Nenhum preço por metro" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro preço por diâmetro de broca."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro preço
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar preço por metro" : "Novo preço por metro"}
        descricao="Os campos com * são obrigatórios."
      >
        <PrecoFundacaoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar preço?"
        descricao="Este preço deixa de ser oferecido a novos faturamentos, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
