import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { formatDocumento, formatTelefone } from "@/shared/lib/format";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import type { Operador } from "@/shared/types";
import { cn } from "@/lib/utils";

export function OperadoresPage() {
  const todos = operadoresStore.useAll();
  const { isLoading, error } = operadoresStore.useEstado();
  const retry = operadoresStore.retry;

  const [q, setQ] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Operador | null>(null);
  const [inativando, setInativando] = useState<Operador | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((o) => {
      if (!mostrarInativos && !o.ativo) return false;
      if (!termo) return true;
      return o.nome.toLowerCase().includes(termo);
    });
  }, [todos, q, mostrarInativos]);

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (o: Operador) => {
    setEditando(o);
    setFormAberto(true);
  };
  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await operadoresStore.setAtivo(inativando.id, false);
      toast.success("Operador inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(null);
  };
  const reativar = async (o: Operador) => {
    try {
      await operadoresStore.setAtivo(o.id, true);
      toast.success("Operador reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const columns: Column<Operador>[] = [
    {
      header: "Nome",
      cell: (o) => (
        <Link
          to="/admin/operadores/$operadorId"
          params={{ operadorId: o.id }}
          className={cn(
            "font-medium text-foreground hover:text-primary hover:underline",
            !o.ativo && "opacity-60",
          )}
        >
          {o.nome}
        </Link>
      ),
    },
    { header: "CPF", className: "font-mono", cell: (o) => formatDocumento(o.cpf) },
    { header: "Telefone", className: "font-mono", cell: (o) => formatTelefone(o.telefone) },
    { header: "Status", cell: (o) => <StatusAtivo ativo={o.ativo} /> },
  ];

  const rowActions = (o: Operador) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(o)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {o.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(o)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(o)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (o: Operador) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !o.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/operadores/$operadorId"
          params={{ operadorId: o.id }}
          className="min-w-0 font-display font-bold text-card-foreground hover:text-primary hover:underline"
        >
          {o.nome}
        </Link>
        <StatusAtivo ativo={o.ativo} />
      </div>
      <div className="mt-1 font-mono text-sm text-muted-foreground">
        {formatDocumento(o.cpf)} · {formatTelefone(o.telefone)}
      </div>
      <div className="mt-3 flex justify-end">{rowActions(o)}</div>
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder="Buscar por nome"
          className="pl-9"
        />
      </div>
      <Button
        variant={mostrarInativos ? "secondary" : "outline"}
        onClick={() => setMostrarInativos((v) => !v)}
        className="gap-1.5"
      >
        <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
        Inativos
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Operadores"
        descricao="Quem opera as máquinas e aponta as horas em campo."
        acoes={
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo operador
          </Button>
        }
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(o) => o.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:hard-hat",
          titulo: todos.length === 0 ? "Nenhum operador cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro operador da equipe."
              : "Ajuste a busca.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro operador
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar operador" : "Novo operador"}
        descricao="Os campos com * são obrigatórios."
      >
        <OperadorForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar operador?"
        descricao={`"${inativando?.nome ?? ""}" não poderá ser atribuído a novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
