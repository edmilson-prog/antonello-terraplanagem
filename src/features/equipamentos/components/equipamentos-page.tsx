import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { formatHorimetro } from "@/shared/lib/format";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import {
  EquipamentoStatusBadge,
  InativoBadge,
  TIPOS,
  TIPO_LABEL,
  STATUS,
  STATUS_LABEL,
} from "@/features/equipamentos/labels";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";
import type { Equipamento, EquipamentoStatus, TipoEquipamento } from "@/shared/types";
import { cn } from "@/lib/utils";

export function EquipamentosPage() {
  const todos = equipamentosStore.useAll();
  const { isLoading, error, retry } = useMockResource(todos);

  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<EquipamentoStatus | "todos">("todos");
  const [mostrarInativos, setMostrarInativos] = useState(true);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Equipamento | null>(null);
  const [inativando, setInativando] = useState<Equipamento | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((e) => {
      if (!mostrarInativos && !e.ativo) return false;
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      // Status operacional só se aplica a equipamentos ativos (inativos exibem
      // o badge "Inativo", não o status), então um filtro de status específico
      // implica ativo + status correspondente.
      if (filtroStatus !== "todos" && (!e.ativo || e.status !== filtroStatus)) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        (e.identificador?.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroTipo, filtroStatus, mostrarInativos]);

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (e: Equipamento) => {
    setEditando(e);
    setFormAberto(true);
  };

  const confirmarInativar = () => {
    if (!inativando) return;
    equipamentosStore.setAtivo(inativando.id, false);
    toast.success("Equipamento inativado.");
    setInativando(null);
  };
  const reativar = (e: Equipamento) => {
    equipamentosStore.setAtivo(e.id, true);
    toast.success("Equipamento reativado.");
  };

  const columns: Column<Equipamento>[] = [
    {
      header: "Nome",
      cell: (e) => (
        <div className={cn("min-w-0", !e.ativo && "opacity-60")}>
          <div className="truncate font-medium text-foreground">{e.nome}</div>
          <div className="font-mono text-xs text-foreground-faint">
            {e.identificador ?? "sem identificador"}
          </div>
        </div>
      ),
    },
    { header: "Tipo", cell: (e) => TIPO_LABEL[e.tipo] },
    { header: "Capacidade", cell: (e) => e.capacidade },
    {
      header: "Horímetro",
      className: "font-mono",
      cell: (e) => formatHorimetro(e.horimetro_atual),
    },
    {
      header: "Status",
      cell: (e) =>
        e.ativo ? <EquipamentoStatusBadge status={e.status} /> : <InativoBadge />,
    },
  ];

  const rowActions = (e: Equipamento) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(e)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {e.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(e)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(e)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (e: Equipamento) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !e.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-card-foreground">{e.nome}</div>
          <div className="font-mono text-xs text-foreground-faint">
            {e.identificador ?? "sem identificador"}
          </div>
        </div>
        {e.ativo ? <EquipamentoStatusBadge status={e.status} /> : <InativoBadge />}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-foreground-faint">Tipo</dt>
          <dd className="text-foreground">{TIPO_LABEL[e.tipo]}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Capacidade</dt>
          <dd className="text-foreground">{e.capacidade}</dd>
        </div>
        <div>
          <dt className="text-foreground-faint">Horímetro</dt>
          <dd className="font-mono text-foreground">{formatHorimetro(e.horimetro_atual)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(e)}</div>
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
          placeholder="Buscar por nome ou identificador"
          className="pl-9"
        />
      </div>
      <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoEquipamento | "todos")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os tipos</SelectItem>
          {TIPOS.map((t) => (
            <SelectItem key={t} value={t}>
              {TIPO_LABEL[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filtroStatus}
        onValueChange={(v) => setFiltroStatus(v as EquipamentoStatus | "todos")}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
        titulo="Equipamentos"
        descricao="Cadastro da frota: escavadeiras, carregadeiras, caçambas e tratores."
        acoes={
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo equipamento
          </Button>
        }
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(e) => e.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:truck",
          titulo: todos.length === 0 ? "Nenhum equipamento cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro equipamento da frota para começar."
              : "Ajuste a busca ou os filtros.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro equipamento
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar equipamento" : "Novo equipamento"}
        descricao="Os campos com * são obrigatórios."
      >
        <EquipamentoForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar equipamento?"
        descricao={`"${inativando?.nome ?? ""}" deixará de aparecer para novas ordens, mas permanece no histórico. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
