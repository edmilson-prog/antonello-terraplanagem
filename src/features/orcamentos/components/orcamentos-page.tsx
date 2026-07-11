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
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { OrcamentoForm } from "@/features/orcamentos/components/orcamento-form";
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
  const [formAberto, setFormAberto] = useState(false);
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
      <Select
        value={filtroStatus}
        onValueChange={(v) => setFiltroStatus(v as StatusOrcamento | "todos")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_ORCAMENTO.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_ORCAMENTO_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    <Button
      onClick={() => setFormAberto(true)}
      className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
    >
      <Icon icon="lucide:plus" className="h-4 w-4" />
      Novo orçamento
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Orçamentos"
        descricao="Monte estimativas a partir das tabelas de preço, antes de executar a obra."
        acoes={novoBtn}
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
          icon: "lucide:file-spreadsheet",
          titulo: todos.length === 0 ? "Nenhum orçamento ainda" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Crie o primeiro orçamento para um cliente."
              : "Ajuste a busca ou o filtro.",
          cta: todos.length === 0 ? novoBtn : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Novo orçamento"
        descricao="Os campos com * são obrigatórios."
      >
        <OrcamentoForm onCancel={() => setFormAberto(false)} />
      </FormDialog>
    </div>
  );
}
