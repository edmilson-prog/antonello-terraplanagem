import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
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
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import {
  statusEfetivoOS,
  totalHorasOS,
  totalMetragemOS,
} from "@/features/ordem-servico/derivacoes";
import {
  StatusOSBadge,
  STATUS_OS,
  STATUS_OS_LABEL,
  MODELO_LABEL,
} from "@/features/ordem-servico/labels";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatHorimetro } from "@/shared/lib/format";
import type { OrdemServico, StatusOS } from "@/shared/types";

export function OrdensRetaguardaPage({ statusInicial }: { statusInicial?: StatusOS } = {}) {
  const todas = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const { isLoading, error } = ordensStore.useEstado();
  const retry = ordensStore.retry;

  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOS | "todos">(statusInicial ?? "todos");
  const [formAberto, setFormAberto] = useState(false);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todas.filter((o) => {
      if (filtroStatus !== "todos" && statusEfetivoOS(o, apontamentos) !== filtroStatus) {
        return false;
      }
      if (!termo) return true;
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.obra_nome.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todas, q, filtroStatus, apontamentos]);

  const columns: Column<OrdemServico>[] = [
    {
      header: "OS",
      cell: (o) => (
        <Link
          to="/admin/ordens/$ordemId"
          params={{ ordemId: o.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {o.numero}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (o) => (
        <div className="min-w-0 max-w-[20rem] truncate">
          {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
        </div>
      ),
    },
    { header: "Obra", cell: (o) => <span className="text-muted-foreground">{o.obra_nome}</span> },
    { header: "Modelo", cell: (o) => MODELO_LABEL[o.modelo_cobranca] },
    {
      header: "Horas",
      className: "font-mono",
      cell: (o) => {
        if (o.modelo_cobranca === "hora_maquina")
          return formatHorimetro(totalHorasOS(o.id, apontamentos));
        const metros = totalMetragemOS(o.id, apontamentos);
        return metros > 0 ? `${metros} m` : "—";
      },
    },
    { header: "Status", cell: (o) => <StatusOSBadge status={statusEfetivoOS(o, apontamentos)} /> },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Icon
          icon="lucide:search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número, cliente ou obra"
          className="pl-9"
        />
      </div>
      <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as StatusOS | "todos")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_OS.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_OS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCard = (o: OrdemServico) => (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/ordens/$ordemId"
          params={{ ordemId: o.id }}
          className="font-mono text-sm font-semibold text-foreground"
        >
          {o.numero}
        </Link>
        <StatusOSBadge status={statusEfetivoOS(o, apontamentos)} />
      </div>
      <div className="mt-2 font-display font-bold text-card-foreground">
        {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
      </div>
      <div className="text-xs text-muted-foreground">{o.obra_nome}</div>
      <div className="mt-2 font-mono text-xs text-foreground">
        {MODELO_LABEL[o.modelo_cobranca]} ·{" "}
        {o.modelo_cobranca === "hora_maquina"
          ? formatHorimetro(totalHorasOS(o.id, apontamentos))
          : totalMetragemOS(o.id, apontamentos) > 0
            ? `${totalMetragemOS(o.id, apontamentos)} m`
            : "—"}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Ordens de Serviço"
        descricao="Abertura, acompanhamento e fechamento das OS de campo."
        acoes={
          <Button
            onClick={() => setFormAberto(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Nova OS
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
        empty={{
          icon: "lucide:file-text",
          titulo: todas.length === 0 ? "Nenhuma OS" : "Nada encontrado",
          descricao:
            todas.length === 0
              ? "Abra a primeira ordem de serviço para começar."
              : "Ajuste a busca ou o filtro.",
          cta:
            todas.length === 0 ? (
              <Button
                onClick={() => setFormAberto(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Abrir primeira OS
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Nova OS"
        descricao="Os campos com * são obrigatórios."
      >
        <OrdemForm
          inicial={null}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>
    </div>
  );
}
