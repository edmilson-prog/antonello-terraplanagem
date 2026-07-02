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
import { useMockResource } from "@/shared/hooks/use-mock-resource";
import { comprovantesStore } from "@/features/comprovantes/comprovantes-store";
import {
  StatusComprovanteBadge,
  STATUS_COMPROVANTE,
  STATUS_COMPROVANTE_LABEL,
} from "@/features/comprovantes/labels";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatDataHora } from "@/shared/lib/format";
import type { Comprovante, StatusComprovante } from "@/shared/types";

export function ComprovantesPage() {
  const todos = comprovantesStore.useTodos();
  const { isLoading, error, retry } = useMockResource(todos);
  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusComprovante | "todos">("todos");

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((c) => {
      if (filtroStatus !== "todos" && c.status !== filtroStatus) return false;
      if (!termo) return true;
      const os = ordensStore.obter(c.os_id);
      const cliente = clientesStore.getById(c.cliente_id);
      return (
        c.numero.toLowerCase().includes(termo) ||
        (os?.numero.toLowerCase().includes(termo) ?? false) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroStatus]);

  const columns: Column<Comprovante>[] = [
    {
      header: "Número",
      cell: (c) => (
        <Link
          to="/admin/comprovantes/$comprovanteId"
          params={{ comprovanteId: c.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {c.numero}
        </Link>
      ),
    },
    {
      header: "OS",
      cell: (c) => (
        <span className="font-mono text-sm text-muted-foreground">
          {ordensStore.obter(c.os_id)?.numero ?? "—"}
        </span>
      ),
    },
    {
      header: "Cliente",
      cell: (c) => (
        <div className="min-w-0 max-w-[16rem] truncate">{clientesStore.getById(c.cliente_id)?.nome ?? "—"}</div>
      ),
    },
    {
      header: "Gerado em",
      className: "font-mono",
      cell: (c) => formatDataHora(c.gerado_em),
    },
    { header: "Status", cell: (c) => <StatusComprovanteBadge status={c.status} /> },
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
          placeholder="Buscar por número, OS ou cliente"
          className="pl-9"
        />
      </div>
      <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as StatusComprovante | "todos")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_COMPROVANTE.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_COMPROVANTE_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCard = (c: Comprovante) => (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/comprovantes/$comprovanteId"
          params={{ comprovanteId: c.id }}
          className="font-mono text-sm font-semibold text-foreground"
        >
          {c.numero}
        </Link>
        <StatusComprovanteBadge status={c.status} />
      </div>
      <div className="mt-2 font-display font-bold text-card-foreground">
        {clientesStore.getById(c.cliente_id)?.nome ?? "—"}
      </div>
      <div className="truncate text-xs text-muted-foreground">OS {ordensStore.obter(c.os_id)?.numero ?? "—"}</div>
      <div className="mt-2 text-xs text-muted-foreground">{formatDataHora(c.gerado_em)}</div>
    </div>
  );

  const verOrdensBtn = (
    <Button asChild variant="outline" className="gap-2">
      <Link to="/admin/ordens">
        <Icon icon="lucide:arrow-right" className="h-4 w-4" />
        Ver Ordens de Serviço
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Comprovantes"
        descricao="Comprovantes de serviço gerados a partir de ordens de serviço fechadas."
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(c) => c.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        empty={{
          icon: "lucide:file-check-2",
          titulo: todos.length === 0 ? "Nenhum comprovante ainda" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Gere um comprovante a partir de uma OS fechada."
              : "Ajuste a busca ou o filtro.",
          cta: todos.length === 0 ? verOrdensBtn : undefined,
        }}
      />
    </div>
  );
}
