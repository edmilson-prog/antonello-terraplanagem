import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataList, type Column } from "@/shared/components/data-list";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { combinarEstados } from "@/shared/hooks/use-estado-consulta";
import {
  StatusFaturamentoBadge,
  STATUS_FATURAMENTO,
  STATUS_FATURAMENTO_LABEL,
} from "@/features/faturamento/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { formatBRL } from "@/features/retaguarda/format";
import type { Faturamento, StatusFaturamento } from "@/shared/types";

export function FaturasList({ faturamentos }: { faturamentos: Faturamento[] }) {
  const { isLoading, error, retry } = combinarEstados(
    { estado: clientesStore.useEstado(), retry: clientesStore.retry },
    { estado: ordensStore.useEstado(), retry: ordensStore.retry },
    { estado: faturamentosStore.useEstado(), retry: faturamentosStore.retry },
  );
  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusFaturamento | "todos">("todos");

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return faturamentos.filter((f) => {
      if (filtroStatus !== "todos" && f.status !== filtroStatus) return false;
      if (!termo) return true;
      const cliente = clientesStore.getById(f.cliente_id);
      const os = ordensStore.obter(f.os_id);
      return (
        f.numero.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false) ||
        (os?.numero.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [faturamentos, q, filtroStatus]);

  const columns: Column<Faturamento>[] = [
    {
      header: "Fatura",
      cell: (f) => (
        <Link
          to="/admin/faturamento/$faturamentoId"
          params={{ faturamentoId: f.id }}
          className="font-mono text-sm font-semibold text-foreground hover:text-primary"
        >
          {f.numero}
        </Link>
      ),
    },
    {
      header: "Cliente",
      cell: (f) => (
        <div className="min-w-0 max-w-[18rem] truncate">
          {clientesStore.getById(f.cliente_id)?.nome ?? "—"}
        </div>
      ),
    },
    {
      header: "OS",
      cell: (f) => (
        <span className="font-mono text-muted-foreground">
          {ordensStore.obter(f.os_id)?.numero ?? "—"}
        </span>
      ),
    },
    {
      header: "Valor",
      className: "font-mono",
      cell: (f) => formatBRL(f.valor_total),
    },
    { header: "Status", cell: (f) => <StatusFaturamentoBadge status={f.status} /> },
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
          placeholder="Buscar por fatura, cliente ou OS"
          className="pl-9"
        />
      </div>
      <Select
        value={filtroStatus}
        onValueChange={(v) => setFiltroStatus(v as StatusFaturamento | "todos")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {STATUS_FATURAMENTO.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_FATURAMENTO_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCard = (f: Faturamento) => (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/faturamento/$faturamentoId"
          params={{ faturamentoId: f.id }}
          className="font-mono text-sm font-semibold text-foreground"
        >
          {f.numero}
        </Link>
        <StatusFaturamentoBadge status={f.status} />
      </div>
      <div className="mt-2 font-display font-bold text-card-foreground">
        {clientesStore.getById(f.cliente_id)?.nome ?? "—"}
      </div>
      <div className="text-xs text-muted-foreground">
        {ordensStore.obter(f.os_id)?.numero ?? "—"}
      </div>
      <div className="mt-2 font-mono text-sm font-semibold text-foreground">
        {formatBRL(f.valor_total)}
      </div>
    </div>
  );

  return (
    <DataList
      data={lista}
      columns={columns}
      getRowKey={(f) => f.id}
      gridKey="admin-faturamento"
      renderCard={renderCard}
      isLoading={isLoading}
      error={error}
      onRetry={retry}
      toolbar={toolbar}
      empty={{
        icon: "lucide:receipt",
        titulo: faturamentos.length === 0 ? "Nenhum faturamento ainda" : "Nada encontrado",
        descricao:
          faturamentos.length === 0
            ? "Gere o primeiro faturamento a partir de uma OS fechada acima."
            : "Ajuste a busca ou o filtro.",
      }}
    />
  );
}
