import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { LinhaEntidadeCell } from "@/shared/components/linha-entidade-cell";
import { FiltroChips, type FiltroChipItem } from "@/shared/components/filtro-chips";
import { formatHorimetro } from "@/shared/lib/format";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import {
  EquipamentoStatusBadge,
  InativoBadge,
  TIPOS,
  TIPO_LABEL,
  TIPO_ICONE,
  STATUS,
  STATUS_LABEL,
} from "@/features/equipamentos/labels";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";
import { showcaseDoEquipamento } from "@/features/equipamentos/equipamento-showcase-data";
import { planosManutencaoStore } from "@/features/manutencao/planos-manutencao-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { resumoProximaManutencao } from "@/features/manutencao/derivacoes";
import type { Equipamento, EquipamentoStatus, TipoEquipamento } from "@/shared/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<EquipamentoStatus, "neutral" | "success" | "warn"> = {
  disponivel: "neutral",
  em_uso: "success",
  manutencao: "warn",
};

const STATUS_FILTRO_ITENS: FiltroChipItem[] = [
  { id: "todos", label: "Todos" },
  ...STATUS.map((s) => ({ id: s, label: STATUS_LABEL[s], tone: STATUS_TONE[s] })),
];

interface EquipamentoListView {
  equipamento: Equipamento;
  horasMes: string;
  dieselMedio: string;
  manutencaoTexto: string;
  manutencaoVencida: boolean;
}

export function EquipamentosPage() {
  const todos = equipamentosStore.useAll();
  const { isLoading, error } = equipamentosStore.useEstado();
  const retry = equipamentosStore.retry;
  const planos = planosManutencaoStore.useAll();
  const registros = registrosManutencaoStore.useTodos();

  const [q, setQ] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoEquipamento | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<EquipamentoStatus | "todos">("todos");
  const [mostrarInativos, setMostrarInativos] = useState(true);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Equipamento | null>(null);
  const [inativando, setInativando] = useState<Equipamento | null>(null);

  // Filtro sem o Status ainda aplicado — usado para as contagens dos chips,
  // assim trocar de chip não muda a contagem dos outros chips.
  const listaAntesDoStatus = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((e) => {
      if (!mostrarInativos && !e.ativo) return false;
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      if (!termo) return true;
      return (
        e.nome.toLowerCase().includes(termo) ||
        (e.identificador?.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [todos, q, filtroTipo, mostrarInativos]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: listaAntesDoStatus.length };
    for (const s of STATUS) counts[s] = 0;
    for (const e of listaAntesDoStatus) {
      if (e.ativo) counts[e.status] = (counts[e.status] ?? 0) + 1;
    }
    return counts;
  }, [listaAntesDoStatus]);

  const lista = useMemo(() => {
    // Status operacional só se aplica a equipamentos ativos (inativos exibem
    // o badge "Inativo", não o status), então um filtro de status específico
    // implica ativo + status correspondente.
    if (filtroStatus === "todos") return listaAntesDoStatus;
    return listaAntesDoStatus.filter((e) => e.ativo && e.status === filtroStatus);
  }, [listaAntesDoStatus, filtroStatus]);

  const views: EquipamentoListView[] = useMemo(
    () =>
      lista.map((equipamento) => {
        const showcase = showcaseDoEquipamento(equipamento.id);
        const resumo = resumoProximaManutencao(equipamento, planos, registros);
        const manutencaoVencida = resumo?.status === "vencida";
        const manutencaoTexto = !resumo
          ? "—"
          : manutencaoVencida
            ? "vencida"
            : `em ${formatHorimetro(resumo.restantes)}`;
        return {
          equipamento,
          horasMes: showcase.kpis.horasMes.valor,
          dieselMedio: showcase.dieselMedioLh,
          manutencaoTexto,
          manutencaoVencida,
        };
      }),
    [lista, planos, registros],
  );

  const abrirEdicao = (e: Equipamento) => {
    setEditando(e);
    setFormAberto(true);
  };

  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await equipamentosStore.setAtivo(inativando.id, false);
      toast.success("Equipamento inativado.");
    } catch (err) {
      toast.error(
        `Falha ao inativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
    setInativando(null);
  };
  const reativar = async (e: Equipamento) => {
    try {
      await equipamentosStore.setAtivo(e.id, true);
      toast.success("Equipamento reativado.");
    } catch (err) {
      toast.error(
        `Falha ao reativar o equipamento${err instanceof Error ? `: ${err.message}` : ""}`,
      );
    }
  };

  const columns: Column<EquipamentoListView>[] = [
    {
      header: "Equipamento",
      cell: ({ equipamento }) => (
        <LinhaEntidadeCell
          variante="icone"
          icone={TIPO_ICONE[equipamento.tipo]}
          titulo={
            <Link
              to="/admin/equipamentos/$equipamentoId"
              params={{ equipamentoId: equipamento.id }}
              className={cn(
                "hover:text-primary hover:underline",
                !equipamento.ativo && "opacity-60",
              )}
            >
              {equipamento.nome}
            </Link>
          }
          subtitulo={equipamento.identificador ?? "sem identificador"}
        />
      ),
    },
    { header: "Tipo", cell: ({ equipamento }) => TIPO_LABEL[equipamento.tipo] },
    { header: "Capacidade", cell: ({ equipamento }) => equipamento.capacidade },
    {
      header: "Horímetro",
      className: "font-mono",
      cell: ({ equipamento }) => formatHorimetro(equipamento.horimetro_atual),
    },
    {
      header: "Horas (mês)",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ horasMes }) => horasMes,
    },
    {
      header: "Diesel médio",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ dieselMedio }) => dieselMedio,
    },
    {
      header: "Próx. manutenção",
      cell: ({ manutencaoTexto, manutencaoVencida }) => (
        <span className={manutencaoVencida ? "font-semibold text-destructive" : "text-foreground"}>
          {manutencaoTexto}
        </span>
      ),
    },
    {
      header: "Status",
      cell: ({ equipamento }) =>
        equipamento.ativo ? (
          <EquipamentoStatusBadge status={equipamento.status} />
        ) : (
          <InativoBadge />
        ),
    },
  ];

  const rowActions = ({ equipamento }: EquipamentoListView) => (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => abrirEdicao(equipamento)}
        className="gap-1.5"
      >
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {equipamento.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(equipamento)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(equipamento)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (view: EquipamentoListView) => {
    const { equipamento, horasMes, dieselMedio, manutencaoTexto, manutencaoVencida } = view;
    return (
      <div
        className={cn(
          "rounded-xl border bg-card p-4 shadow-sm",
          !equipamento.ativo && "opacity-70",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <LinhaEntidadeCell
            variante="icone"
            icone={TIPO_ICONE[equipamento.tipo]}
            titulo={
              <Link
                to="/admin/equipamentos/$equipamentoId"
                params={{ equipamentoId: equipamento.id }}
                className="hover:text-primary hover:underline"
              >
                {equipamento.nome}
              </Link>
            }
            subtitulo={equipamento.identificador ?? "sem identificador"}
          />
          {equipamento.ativo ? (
            <EquipamentoStatusBadge status={equipamento.status} />
          ) : (
            <InativoBadge />
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-foreground-faint">Tipo</dt>
            <dd className="text-foreground">{TIPO_LABEL[equipamento.tipo]}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Capacidade</dt>
            <dd className="text-foreground">{equipamento.capacidade}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Horímetro</dt>
            <dd className="font-mono text-foreground">
              {formatHorimetro(equipamento.horimetro_atual)}
            </dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Horas (mês)</dt>
            <dd className="font-mono text-foreground">{horasMes}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Diesel médio</dt>
            <dd className="font-mono text-foreground">{dieselMedio}</dd>
          </div>
          <div>
            <dt className="text-foreground-faint">Próx. manutenção</dt>
            <dd
              className={cn(
                "font-mono",
                manutencaoVencida ? "font-semibold text-destructive" : "text-foreground",
              )}
            >
              {manutencaoTexto}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-end">{rowActions(view)}</div>
      </div>
    );
  };

  const toolbar = (
    <div className="flex flex-col gap-2.5">
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
        <Select
          value={filtroTipo}
          onValueChange={(v) => setFiltroTipo(v as TipoEquipamento | "todos")}
        >
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
        <Button
          variant={mostrarInativos ? "secondary" : "outline"}
          onClick={() => setMostrarInativos((v) => !v)}
          className="gap-1.5"
        >
          <Icon icon={mostrarInativos ? "lucide:eye" : "lucide:eye-off"} className="h-4 w-4" />
          Inativos
        </Button>
      </div>
      <FiltroChips
        itens={STATUS_FILTRO_ITENS}
        ativo={filtroStatus}
        onChange={(id) => setFiltroStatus(id as EquipamentoStatus | "todos")}
        counts={statusCounts}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Equipamentos"
        descricao="Cadastro da frota: escavadeiras, carregadeiras, caçambas e tratores."
        acoes={
          <Button
            asChild
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link to="/admin/equipamentos/novo">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Novo equipamento
            </Link>
          </Button>
        }
      />

      <DataList
        data={views}
        columns={columns}
        getRowKey={(v) => v.equipamento.id}
        gridKey="admin-equipamentos"
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
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Link to="/admin/equipamentos/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro equipamento
                </Link>
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Editar equipamento"
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
