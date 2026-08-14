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
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import {
  StatusOrcamentoBadge,
  STATUS_ORCAMENTO,
  STATUS_ORCAMENTO_LABEL,
} from "@/features/orcamentos/labels";
import { validadeVencida } from "@/features/orcamentos/derivacoes";
import { clientesStore } from "@/features/clientes/clientes-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { Orcamento, StatusOrcamento } from "@/shared/types";
import { cn } from "@/lib/utils";

function validadeInfo(orc: Orcamento, agoraISO: string): { texto: string; vencida: boolean } {
  if (!orc.validade) return { texto: "—", vencida: false };
  return {
    texto: orc.validade.split("-").reverse().join("/"),
    vencida: validadeVencida(orc, agoraISO),
  };
}

export function OrcamentosPage() {
  const todos = orcamentosStore.useTodos();
  const { isLoading, error } = orcamentosStore.useEstado();
  const retry = orcamentosStore.retry;
  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOrcamento | "todos">("todos");
  const agoraISO = new Date().toISOString();

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((o) => {
      if (filtroStatus !== "todos" && o.status !== filtroStatus) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.descricao_obra.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroStatus]);

  const totalEmAberto = useMemo(
    () =>
      todos
        .filter((o) => o.status === "rascunho" || o.status === "enviado")
        .reduce((s, o) => s + o.valor_total, 0),
    [todos],
  );

  const chipItens: StatusFilterChipItem[] = [
    { id: "todos", label: "Todos" },
    ...STATUS_ORCAMENTO.map((s) => ({
      id: s,
      label: STATUS_ORCAMENTO_LABEL[s],
      tone: (s === "aprovado"
        ? "success"
        : s === "recusado"
          ? "neutral"
          : "info") as StatusFilterChipItem["tone"],
    })),
  ];
  const buscaAplicada = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return todos;
    return todos.filter((o) => {
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.descricao_obra.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q]);
  const chipCounts: Record<string, number> = { todos: buscaAplicada.length };
  for (const s of STATUS_ORCAMENTO)
    chipCounts[s] = buscaAplicada.filter((o) => o.status === s).length;

  const columns: Column<Orcamento>[] = [
    {
      header: "Número",
      cell: (o) => (
        <Link
          to="/admin/orcamentos/$orcamentoId"
          params={{ orcamentoId: o.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {o.numero}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (o) => (
        <div className="min-w-0 max-w-[16rem] truncate">
          {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
        </div>
      ),
    },
    {
      header: "Obra",
      cell: (o) => (
        <div className="min-w-0 max-w-[14rem] truncate text-muted-foreground">
          {o.descricao_obra}
        </div>
      ),
    },
    { header: "Valor", className: "font-mono", cell: (o) => formatBRL(o.valor_total) },
    {
      header: "Validade",
      className: "font-mono",
      cell: (o) => {
        const v = validadeInfo(o, agoraISO);
        return <span className={cn(v.vencida && "text-destructive")}>{v.texto}</span>;
      },
    },
    { header: "Status", cell: (o) => <StatusOrcamentoBadge status={o.status} /> },
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
      <StatusFilterChips
        itens={chipItens}
        ativo={filtroStatus}
        onChange={(id) => setFiltroStatus(id as StatusOrcamento | "todos")}
        counts={chipCounts}
      />
    </div>
  );

  const renderCard = (o: Orcamento) => {
    const v = validadeInfo(o, agoraISO);
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/admin/orcamentos/$orcamentoId"
            params={{ orcamentoId: o.id }}
            className="font-mono text-sm font-semibold text-foreground"
          >
            {o.numero}
          </Link>
          <StatusOrcamentoBadge status={o.status} />
        </div>
        <div className="mt-2 font-display font-bold text-card-foreground">
          {clientesStore.getById(o.cliente_id)?.nome ?? "—"}
        </div>
        <div className="truncate text-xs text-muted-foreground">{o.descricao_obra}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-foreground">
            {formatBRL(o.valor_total)}
          </span>
          <span
            className={cn(
              "font-mono text-xs",
              v.vencida ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {v.texto}
          </span>
        </div>
      </div>
    );
  };

  const novoBtn = (
    <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
      <Link to="/admin/orcamentos/novo">
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Novo orçamento
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Orçamentos"
        descricao="Monte estimativas a partir das tabelas de preço, antes de executar a obra."
        acoes={novoBtn}
      />

      <div className="-mt-2">
        <CardPill>{formatBRL(totalEmAberto)} em aberto</CardPill>
      </div>

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(o) => o.id}
        gridKey="admin-orcamentos"
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        empty={{
          icon: "lucide:file-spreadsheet",
          titulo: todos.length === 0 ? "Nenhum orçamento ainda" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Crie o primeiro orçamento para um cliente."
              : "Ajuste a busca ou o filtro.",
          cta: todos.length === 0 ? novoBtn : undefined,
        }}
      />
    </div>
  );
}
