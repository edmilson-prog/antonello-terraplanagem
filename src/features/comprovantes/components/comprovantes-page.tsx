import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import {
  StatusFilterChips,
  type StatusFilterChipItem,
} from "@/shared/components/status-filter-chips";
import { CardPill } from "@/shared/components/card-secao";
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

  const pendentes = todos.filter((c) => c.status === "pendente").length;
  const pillTexto =
    pendentes > 0
      ? `${pendentes} pendente${pendentes > 1 ? "s" : ""} de assinatura`
      : `${todos.length} comprovante${todos.length !== 1 ? "s" : ""}`;

  const chipItens: StatusFilterChipItem[] = [
    { id: "todos", label: "Todos" },
    ...STATUS_COMPROVANTE.map((s) => ({
      id: s,
      label: STATUS_COMPROVANTE_LABEL[s],
      tone: (s === "assinado"
        ? "success"
        : s === "recusado"
          ? "neutral"
          : "warn") as StatusFilterChipItem["tone"],
    })),
  ];
  const buscaAplicada = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return todos;
    return todos.filter((c) => {
      const os = ordensStore.obter(c.os_id);
      const cliente = clientesStore.getById(c.cliente_id);
      return (
        c.numero.toLowerCase().includes(termo) ||
        (os?.numero.toLowerCase().includes(termo) ?? false) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q]);
  const chipCounts: Record<string, number> = { todos: buscaAplicada.length };
  for (const s of STATUS_COMPROVANTE)
    chipCounts[s] = buscaAplicada.filter((c) => c.status === s).length;

  const columns: Column<Comprovante>[] = [
    {
      header: "Número",
      cell: (c) => (
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
            <Icon icon="lucide:file-signature" className="h-3.5 w-3.5" aria-hidden />
          </span>
          <Link
            to="/admin/comprovantes/$comprovanteId"
            params={{ comprovanteId: c.id }}
            className="font-mono text-sm font-semibold text-foreground hover:text-primary"
          >
            {c.numero}
          </Link>
        </div>
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
        <div className="min-w-0 max-w-[16rem] truncate">
          {clientesStore.getById(c.cliente_id)?.nome ?? "—"}
        </div>
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
      <StatusFilterChips
        itens={chipItens}
        ativo={filtroStatus}
        onChange={(id) => setFiltroStatus(id as StatusComprovante | "todos")}
        counts={chipCounts}
      />
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
      <div className="truncate text-xs text-muted-foreground">
        OS {ordensStore.obter(c.os_id)?.numero ?? "—"}
      </div>
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

      <div className="-mt-2">
        <CardPill>{pillTexto}</CardPill>
      </div>

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
