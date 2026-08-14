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
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import { historicoPrecosStore } from "@/features/precos/historico-precos-store";
import { PrecoMobilizacaoForm } from "@/features/precos/components/preco-mobilizacao-form";
import type { PrecoMobilizacao } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PrecoMobilizacaoList() {
  const todos = precoMobilizacaoStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PrecoMobilizacao | null>(null);
  const [inativando, setInativando] = useState<PrecoMobilizacao | null>(null);

  const lista = useMemo(
    () => todos.filter((p) => mostrarInativos || p.ativo),
    [todos, mostrarInativos],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PrecoMobilizacao) => {
    setEditando(p);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    historicoPrecosStore.registrar("mobilizacao", inativando);
    precoMobilizacaoStore.setAtivo(inativando.id, false);
    toast.success("Item inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoMobilizacao) => {
    historicoPrecosStore.registrar("mobilizacao", p);
    precoMobilizacaoStore.setAtivo(p.id, true);
    toast.success("Item reativado.");
  };

  const columns: Column<PrecoMobilizacao>[] = [
    {
      header: "Descrição",
      cell: (p) => (
        <div className={cn("min-w-0 max-w-[28rem]", !p.ativo && "opacity-60")}>
          <span className="text-foreground">{p.descricao}</span>
        </div>
      ),
    },
    { header: "Valor", className: "font-mono", cell: (p) => formatBRL(p.valor) },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PrecoMobilizacao) => (
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

  const renderCard = (p: PrecoMobilizacao) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm font-medium text-card-foreground">{p.descricao}</div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-foreground">{formatBRL(p.valor)}</span>
        {rowActions(p)}
      </div>
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
        Novo item
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataList
        data={lista}
        columns={columns}
        getRowKey={(p) => p.id}
        gridKey="admin-precos-mobilizacao"
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:truck",
          titulo: todos.length === 0 ? "Nenhuma mobilização" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro valor de mobilização/transporte."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeira mobilização
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar mobilização" : "Nova mobilização"}
        descricao="Os campos com * são obrigatórios."
      >
        <PrecoMobilizacaoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar item?"
        descricao="Este item deixa de ser oferecido a novos faturamentos, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
