import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatBRL } from "@/features/retaguarda/format";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TipoComponenteCustoBadge, unidadeComponente } from "@/features/custo-hora/labels";
import { ComponenteCustoForm } from "@/features/custo-hora/components/componente-custo-form";
import type { ComponenteCusto } from "@/shared/types";
import { cn } from "@/lib/utils";

export function ComponenteCustoList() {
  const todos = componentesCustoStore.useAll();
  const equipamentos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<ComponenteCusto | null>(null);
  const [inativando, setInativando] = useState<ComponenteCusto | null>(null);

  const lista = useMemo(
    () => todos.filter((c) => mostrarInativos || c.ativo),
    [todos, mostrarInativos],
  );

  const nomeDoEquipamento = (id: string) =>
    equipamentos.find((e) => e.id === id)?.nome ?? "Equipamento removido";

  const abrirEdicao = (c: ComponenteCusto) => {
    setEditando(c);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    componentesCustoStore.setAtivo(inativando.id, false);
    toast.success("Componente inativado.");
    setInativando(null);
  };
  const reativar = (c: ComponenteCusto) => {
    componentesCustoStore.setAtivo(c.id, true);
    toast.success("Componente reativado.");
  };

  const columns: Column<ComponenteCusto>[] = [
    {
      header: "Equipamento",
      cell: (c) => (
        <span className={cn("font-medium text-foreground", !c.ativo && "opacity-60")}>
          {nomeDoEquipamento(c.equipamento_id)}
        </span>
      ),
    },
    { header: "Descrição", cell: (c) => c.descricao },
    { header: "Tipo", cell: (c) => <TipoComponenteCustoBadge tipo={c.tipo} /> },
    {
      header: "Valor",
      className: "font-mono",
      cell: (c) => `${formatBRL(c.valor)}${unidadeComponente(c.tipo)}`,
    },
    { header: "Status", cell: (c) => <StatusAtivo ativo={c.ativo} /> },
  ];

  const rowActions = (c: ComponenteCusto) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(c)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {c.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(c)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(c)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (c: ComponenteCusto) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !c.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">{c.descricao}</div>
          <div className="text-xs text-muted-foreground">{nomeDoEquipamento(c.equipamento_id)}</div>
        </div>
        <StatusAtivo ativo={c.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Tipo</dt>
          <dd>
            <TipoComponenteCustoBadge tipo={c.tipo} />
          </dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Valor</dt>
          <dd className="font-mono text-foreground">
            {formatBRL(c.valor)}
            {unidadeComponente(c.tipo)}
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(c)}</div>
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
      <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
        <Link to="/admin/custo-hora/novo">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Novo componente
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <DataList
        data={lista}
        columns={columns}
        getRowKey={(c) => c.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:calculator",
          titulo: todos.length === 0 ? "Nenhum componente cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro componente de custo (fixo mensal ou variável por hora)."
              : "Ajuste o filtro de inativos.",
          cta:
            todos.length === 0 ? (
              <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/admin/custo-hora/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro componente
                </Link>
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Editar componente de custo"
        descricao="Os campos com * são obrigatórios."
      >
        <ComponenteCustoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar componente?"
        descricao="Este componente deixa de entrar no cálculo do custo/hora, mas permanece no histórico. Você pode reativá-lo depois."
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
