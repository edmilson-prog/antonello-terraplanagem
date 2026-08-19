import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/shared/components/page-header";
import { DataList, type Column } from "@/shared/components/data-list";
import { FormDialog } from "@/shared/components/form-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { LinhaEntidadeCell } from "@/shared/components/linha-entidade-cell";
import { formatDocumento, formatHorimetro, formatTelefone } from "@/shared/lib/format";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { OperadorForm } from "@/features/operadores/components/operador-form";
import { iniciais } from "@/features/operadores/components/operador-hero";
import { ordensDoOperador } from "@/features/operadores/derivacoes";
import { acessoAppStore } from "@/features/operadores/acesso-app-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import type { Operador } from "@/shared/types";
import { cn } from "@/lib/utils";

interface OperadorListView {
  operador: Operador;
  iniciais: string;
  osAtivasLabel: string;
  vinculo: string;
  base: string;
  horasMes: string;
  acessoLiberado: boolean;
}

const TRACO = "—";
const DIAS_DO_MES = 30;

export function OperadoresPage() {
  const todos = operadoresStore.useAll();
  const { isLoading, error } = operadoresStore.useEstado();
  const retry = operadoresStore.retry;

  const [q, setQ] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Operador | null>(null);
  const [inativando, setInativando] = useState<Operador | null>(null);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return todos.filter((o) => {
      if (!mostrarInativos && !o.ativo) return false;
      if (!termo) return true;
      return o.nome.toLowerCase().includes(termo);
    });
  }, [todos, q, mostrarInativos]);

  const apontamentos = apontamentosStore.useTodos();
  const ordens = ordensStore.useTodas();
  acessoAppStore.useEstado(); // re-renderiza quando as sessões chegam

  const views: OperadorListView[] = useMemo(() => {
    const corte = Date.now() - DIAS_DO_MES * 24 * 60 * 60 * 1000;

    return lista.map((operador) => {
      const ativas = ordensDoOperador(ordens, apontamentos, operador.id).filter(
        (os) => os.status !== "fechada",
      ).length;

      const horas = apontamentos
        .filter(
          (a) =>
            a.operador_id === operador.id &&
            new Date(a.iniciado_em ?? a.created_at).getTime() >= corte,
        )
        .reduce((soma, a) => soma + (a.horas_trabalhadas ?? 0), 0);

      return {
        operador,
        iniciais: iniciais(operador.nome),
        osAtivasLabel: ativas === 1 ? "1 OS ativa" : `${ativas} OS ativas`,
        vinculo: operador.vinculo ?? TRACO,
        base: operador.base ?? TRACO,
        horasMes: formatHorimetro(horas),
        acessoLiberado: acessoAppStore.doOperador(operador.id)?.liberado ?? false,
      };
    });
  }, [lista, ordens, apontamentos]);

  const abrirEdicao = (o: Operador) => {
    setEditando(o);
    setFormAberto(true);
  };
  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await operadoresStore.setAtivo(inativando.id, false);
      toast.success("Operador inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(null);
  };
  const reativar = async (o: Operador) => {
    try {
      await operadoresStore.setAtivo(o.id, true);
      toast.success("Operador reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o operador${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const columns: Column<OperadorListView>[] = [
    {
      header: "Operador",
      cell: ({ operador, iniciais: init, osAtivasLabel }) => (
        <LinhaEntidadeCell
          variante="avatar"
          iniciais={init}
          titulo={
            <Link
              to="/admin/operadores/$operadorId"
              params={{ operadorId: operador.id }}
              className={cn("hover:text-primary hover:underline", !operador.ativo && "opacity-60")}
            >
              {operador.nome}
            </Link>
          }
          subtitulo={osAtivasLabel}
        />
      ),
    },
    {
      header: "CPF",
      className: "font-mono",
      cell: ({ operador }) => formatDocumento(operador.cpf),
    },
    {
      header: "Telefone",
      className: "font-mono",
      cell: ({ operador }) => formatTelefone(operador.telefone),
    },
    {
      header: "Vínculo",
      // Vínculo é opcional no cadastro: sem valor, um badge vazio pareceria
      // um estado ("—" dentro de uma pílula lê como categoria).
      cell: ({ vinculo }) =>
        vinculo === TRACO ? (
          <span className="text-muted-foreground">{TRACO}</span>
        ) : (
          <Badge variant="secondary">{vinculo}</Badge>
        ),
    },
    { header: "Base", cell: ({ base }) => base },
    {
      header: "Horas (mês)",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ horasMes }) => horasMes,
    },
    {
      header: "Acesso ao app",
      cell: ({ acessoLiberado }) => (
        <Badge variant={acessoLiberado ? "default" : "secondary"}>
          {acessoLiberado ? "Liberado" : "Sem acesso"}
        </Badge>
      ),
    },
    { header: "Status", cell: ({ operador }) => <StatusAtivo ativo={operador.ativo} /> },
  ];

  const rowActions = ({ operador }: OperadorListView) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(operador)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {operador.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(operador)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(operador)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (view: OperadorListView) => {
    const {
      operador,
      iniciais: init,
      osAtivasLabel,
      vinculo,
      base,
      horasMes,
      acessoLiberado,
    } = view;
    return (
      <div
        className={cn("rounded-xl border bg-card p-4 shadow-sm", !operador.ativo && "opacity-70")}
      >
        <div className="flex items-start justify-between gap-2">
          <LinhaEntidadeCell
            variante="avatar"
            iniciais={init}
            titulo={
              <Link
                to="/admin/operadores/$operadorId"
                params={{ operadorId: operador.id }}
                className="hover:text-primary hover:underline"
              >
                {operador.nome}
              </Link>
            }
            subtitulo={osAtivasLabel}
          />
          <StatusAtivo ativo={operador.ativo} />
        </div>
        <dl className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">CPF</dt>
            <dd className="font-mono text-foreground">{formatDocumento(operador.cpf)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Telefone</dt>
            <dd className="font-mono text-foreground">{formatTelefone(operador.telefone)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Vínculo</dt>
            <dd className="text-foreground">{vinculo}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Base</dt>
            <dd className="text-foreground">{base}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Horas (mês)</dt>
            <dd className="font-mono text-foreground">{horasMes}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Acesso ao app</dt>
            <dd className="text-foreground">{acessoLiberado ? "Liberado" : "Sem acesso"}</dd>
          </div>
        </dl>
        <div className="mt-3 flex justify-end">{rowActions(view)}</div>
      </div>
    );
  };

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
          placeholder="Buscar por nome"
          className="pl-9"
        />
      </div>
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
        titulo="Operadores"
        descricao="Quem opera as máquinas e aponta as horas em campo."
        acoes={
          <Button
            asChild
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link to="/admin/operadores/novo">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Novo operador
            </Link>
          </Button>
        }
      />

      <DataList
        data={views}
        columns={columns}
        getRowKey={(v) => v.operador.id}
        gridKey="admin-operadores"
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:hard-hat",
          titulo: todos.length === 0 ? "Nenhum operador cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0 ? "Cadastre o primeiro operador da equipe." : "Ajuste a busca.",
          cta:
            todos.length === 0 ? (
              <Button
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Link to="/admin/operadores/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro operador
                </Link>
              </Button>
            ) : undefined,
        }}
      />

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Editar operador"
        descricao="Os campos com * são obrigatórios."
      >
        <OperadorForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar operador?"
        descricao={`"${inativando?.nome ?? ""}" não poderá ser atribuído a novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
