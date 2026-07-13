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
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { descreverVinculo } from "@/features/precos/labels";
import { PrecoHoraMaquinaForm } from "@/features/precos/components/preco-hora-maquina-form";
import type { PrecoHoraMaquina } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PrecoHoraMaquinaList() {
  const todos = precoHoraMaquinaStore.useAll();
  const equipamentos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<PrecoHoraMaquina | null>(null);
  const [inativando, setInativando] = useState<PrecoHoraMaquina | null>(null);

  const lista = useMemo(
    () => todos.filter((p) => mostrarInativos || p.ativo),
    [todos, mostrarInativos],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (p: PrecoHoraMaquina) => {
    setEditando(p);
    setFormAberto(true);
  };
  const confirmarInativar = () => {
    if (!inativando) return;
    precoHoraMaquinaStore.setAtivo(inativando.id, false);
    toast.success("Preço inativado.");
    setInativando(null);
  };
  const reativar = (p: PrecoHoraMaquina) => {
    precoHoraMaquinaStore.setAtivo(p.id, true);
    toast.success("Preço reativado.");
  };

  const columns: Column<PrecoHoraMaquina>[] = [
    {
      header: "Vínculo",
      cell: (p) => (
        <span className={cn("font-medium text-foreground", !p.ativo && "opacity-60")}>
          {descreverVinculo(p, equipamentos)}
        </span>
      ),
    },
    {
      header: "Hora seca",
      className: "font-mono",
      cell: (p) => formatBRL(p.valor_hora_seca),
    },
    {
      header: "Hora operada",
      className: "font-mono",
      cell: (p) => formatBRL(p.valor_hora_operada),
    },
    { header: "Status", cell: (p) => <StatusAtivo ativo={p.ativo} /> },
  ];

  const rowActions = (p: PrecoHoraMaquina) => (
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

  const renderCard = (p: PrecoHoraMaquina) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !p.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 font-display font-bold text-card-foreground">
          {descreverVinculo(p, equipamentos)}
        </div>
        <StatusAtivo ativo={p.ativo} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Hora seca</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_hora_seca)}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Hora operada</dt>
          <dd className="font-mono text-foreground">{formatBRL(p.valor_hora_operada)}</dd>
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
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:banknote",
          titulo: todos.length === 0 ? "Nenhum preço cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro preço de hora-máquina."
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
        titulo={editando ? "Editar preço hora-máquina" : "Novo preço hora-máquina"}
        descricao="Os campos com * são obrigatórios."
      >
        <PrecoHoraMaquinaForm
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
