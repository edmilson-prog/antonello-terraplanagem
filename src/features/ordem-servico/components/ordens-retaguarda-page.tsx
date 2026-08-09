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
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import {
  apontamentosDaOS,
  statusEfetivoOS,
  totalHorasOS,
  totalMetragemOS,
} from "@/features/ordem-servico/derivacoes";
import { StatusOSBadge, MODELO_LABEL } from "@/features/ordem-servico/labels";
import { clientesStore } from "@/features/clientes/clientes-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { faturamentosStore } from "@/features/faturamento/faturamentos-store";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData, formatHorimetro } from "@/shared/lib/format";
import type { Apontamento, OrdemServico, StatusOS } from "@/shared/types";

function equipamentosDaOrdem(osId: string, apontamentos: Apontamento[]): string[] {
  return Array.from(new Set(apontamentosDaOS(osId, apontamentos).map((a) => a.equipamento_id)));
}

function operadorPrincipal(
  o: OrdemServico,
  apontamentos: Apontamento[],
): { nome: string; extras: number } {
  if (o.responsavel_id) {
    const op = operadoresStore.getById(o.responsavel_id);
    return { nome: op?.nome ?? "—", extras: 0 };
  }
  const ids = Array.from(new Set(apontamentosDaOS(o.id, apontamentos).map((a) => a.operador_id)));
  if (ids.length === 0) return { nome: "—", extras: 0 };
  const primeiro = operadoresStore.getById(ids[0]);
  return { nome: primeiro?.nome ?? "—", extras: ids.length - 1 };
}

export function OrdensRetaguardaPage({ statusInicial }: { statusInicial?: StatusOS } = {}) {
  const todas = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const { isLoading, error } = ordensStore.useEstado();
  const retry = ordensStore.retry;

  const [q, setQ] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusOS | "todos">(statusInicial ?? "todos");

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

  // Contadores dos chips derivam só da busca (não do status ativo), para não
  // mudarem quando o usuário troca de chip — mesmo comportamento do mock.
  const buscaAplicada = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return todas;
    return todas.filter((o) => {
      const cliente = clientesStore.getById(o.cliente_id);
      return (
        o.numero.toLowerCase().includes(termo) ||
        o.obra_nome.toLowerCase().includes(termo) ||
        (cliente?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todas, q]);

  const chipItens: StatusFilterChipItem[] = [
    { id: "todos", label: "Todas" },
    { id: "aberta", label: "Abertas", tone: "info" },
    { id: "em_andamento", label: "Em andamento", tone: "warn" },
    { id: "fechada", label: "Concluídas", tone: "success" },
  ];
  const chipCounts = {
    todos: buscaAplicada.length,
    aberta: buscaAplicada.filter((o) => statusEfetivoOS(o, apontamentos) === "aberta").length,
    em_andamento: buscaAplicada.filter((o) => statusEfetivoOS(o, apontamentos) === "em_andamento")
      .length,
    fechada: buscaAplicada.filter((o) => statusEfetivoOS(o, apontamentos) === "fechada").length,
  };

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
        <div className="min-w-0 truncate">{clientesStore.getById(o.cliente_id)?.nome ?? "—"}</div>
      ),
    },
    { header: "Obra", cell: (o) => <span className="text-muted-foreground">{o.obra_nome}</span> },
    {
      header: "Equipamento",
      cell: (o) => {
        const ids = equipamentosDaOrdem(o.id, apontamentos);
        if (ids.length === 0) return <span className="text-muted-foreground">—</span>;
        const nome = equipamentosStore.getById(ids[0])?.nome ?? "—";
        return (
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
              <Icon icon="lucide:truck" className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="truncate">{nome}</span>
            {ids.length > 1 ? <CardPill>+{ids.length - 1}</CardPill> : null}
          </div>
        );
      },
    },
    {
      header: "Operador",
      cell: (o) => {
        const { nome, extras } = operadorPrincipal(o, apontamentos);
        return (
          <span>
            {nome}
            {extras > 0 ? ` +${extras}` : ""}
          </span>
        );
      },
    },
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
    {
      header: "Valor",
      className: "font-mono text-right",
      cell: (o) => {
        const fat = faturamentosStore.listar().find((f) => f.os_id === o.id);
        return fat ? formatBRL(fat.valor_total) : "—";
      },
    },
    {
      header: "Período",
      className: "font-mono text-xs",
      cell: (o) =>
        o.fechada_em
          ? `${formatData(o.aberta_em.slice(0, 10))}–${formatData(o.fechada_em.slice(0, 10))}`
          : `desde ${formatData(o.aberta_em.slice(0, 10))}`,
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
      <StatusFilterChips
        itens={chipItens}
        ativo={filtroStatus}
        onChange={(id) => setFiltroStatus(id as StatusOS | "todos")}
        counts={chipCounts}
      />
    </div>
  );

  const renderCard = (o: OrdemServico) => {
    const equipamentoIds = equipamentosDaOrdem(o.id, apontamentos);
    const equipamentoNome =
      equipamentoIds.length > 0 ? (equipamentosStore.getById(equipamentoIds[0])?.nome ?? "—") : "—";
    const { nome: operadorNome, extras } = operadorPrincipal(o, apontamentos);
    const fat = faturamentosStore.listar().find((f) => f.os_id === o.id);
    const periodo = o.fechada_em
      ? `${formatData(o.aberta_em.slice(0, 10))}–${formatData(o.fechada_em.slice(0, 10))}`
      : `desde ${formatData(o.aberta_em.slice(0, 10))}`;

    return (
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
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {equipamentoNome} · {operadorNome}
          {extras > 0 ? ` +${extras}` : ""} · {fat ? formatBRL(fat.valor_total) : "—"} · {periodo}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Ordens de Serviço"
        descricao="Abertura, acompanhamento e fechamento das OS de campo."
        acoes={
          <Button
            asChild
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link to="/admin/ordens/nova">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Nova OS
            </Link>
          </Button>
        }
      />

      <DataList
        data={lista}
        columns={columns}
        getRowKey={(o) => o.id}
        resizableKey="admin-ordens"
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
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Link to="/admin/ordens/nova">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Abrir primeira OS
                </Link>
              </Button>
            ) : undefined,
        }}
      />
    </div>
  );
}
