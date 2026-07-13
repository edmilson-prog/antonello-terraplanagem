import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { StatusAtivo } from "@/shared/components/status-ativo";
import { LinhaEntidadeCell } from "@/shared/components/linha-entidade-cell";
import { formatDocumento, formatTelefone } from "@/shared/lib/format";
import { formatBRL } from "@/features/retaguarda/format";
import { idMockDoCliente } from "@/shared/lib/cliente-mock-id";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import { showcaseDoCliente } from "@/features/clientes/cliente-showcase-data";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { contasReceberStore } from "@/features/financeiro/contas-receber-store";
import type { Cliente } from "@/shared/types";
import { cn } from "@/lib/utils";

const OPCOES_POR_PAGINA = [20, 50, 100] as const;

interface ClienteListView {
  cliente: Cliente;
  cidade: string;
  osAtivas: number;
  saldo: number;
}

export function ClientesPage() {
  const todos = clientesStore.useAll();
  const { isLoading, error } = clientesStore.useEstado();
  const retry = clientesStore.retry;
  const ordens = ordensStore.useTodas();
  const contas = contasReceberStore.useTodas();

  const [q, setQ] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [inativando, setInativando] = useState<Cliente | null>(null);
  const [itensPorPagina, setItensPorPagina] = useState<number>(OPCOES_POR_PAGINA[0]);
  const [pagina, setPagina] = useState(1);

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    const soDigitos = termo.replace(/\D/g, "");
    return todos.filter((c) => {
      if (!mostrarInativos && !c.ativo) return false;
      if (!termo) return true;
      const nomeMatch = c.nome.toLowerCase().includes(termo);
      const docMatch = soDigitos.length > 0 && (c.documento?.includes(soDigitos) ?? false);
      return nomeMatch || docMatch;
    });
  }, [todos, q, mostrarInativos]);

  useEffect(() => {
    setPagina(1);
  }, [q, mostrarInativos, itensPorPagina]);

  const totalPaginas = Math.max(1, Math.ceil(lista.length / itensPorPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const listaPaginada = useMemo(
    () => lista.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina),
    [lista, paginaAtual, itensPorPagina],
  );
  const inicioIntervalo = lista.length === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fimIntervalo = Math.min(paginaAtual * itensPorPagina, lista.length);

  const viewsPaginados: ClienteListView[] = useMemo(
    () =>
      listaPaginada.map((cliente) => {
        const idMock = idMockDoCliente(cliente.id);
        const osDoCliente = ordens.filter((o) => o.cliente_id === idMock);
        const contasDoCliente = contas.filter((c) => c.cliente_id === idMock);
        const osAtivas = osDoCliente.filter((o) => o.status !== "fechada").length;
        const saldo = contasDoCliente
          .filter((c) => c.status === "aberta")
          .reduce((s, c) => s + c.valor, 0);
        return {
          cliente,
          cidade: showcaseDoCliente(cliente.id).cadastrais.cidade,
          osAtivas,
          saldo,
        };
      }),
    [listaPaginada, ordens, contas],
  );

  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (c: Cliente) => {
    setEditando(c);
    setFormAberto(true);
  };
  const confirmarInativar = async () => {
    if (!inativando) return;
    try {
      await clientesStore.setAtivo(inativando.id, false);
      toast.success("Cliente inativado.");
    } catch (err) {
      toast.error(`Falha ao inativar o cliente${err instanceof Error ? `: ${err.message}` : ""}`);
    }
    setInativando(null);
  };
  const reativar = async (c: Cliente) => {
    try {
      await clientesStore.setAtivo(c.id, true);
      toast.success("Cliente reativado.");
    } catch (err) {
      toast.error(`Falha ao reativar o cliente${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  const columns: Column<ClienteListView>[] = [
    {
      header: "Cliente",
      cell: ({ cliente, cidade }) => (
        <LinhaEntidadeCell
          variante="icone"
          icone={cliente.tipo_pessoa === "PJ" ? "lucide:building-2" : "lucide:user"}
          titulo={
            <Link
              to="/admin/clientes/$clienteId"
              params={{ clienteId: cliente.id }}
              className={cn("hover:text-primary hover:underline", !cliente.ativo && "opacity-60")}
            >
              {cliente.nome}
            </Link>
          }
          subtitulo={cidade}
        />
      ),
    },
    {
      header: "Tipo",
      cell: ({ cliente }) =>
        cliente.tipo_pessoa ? (
          <Badge variant="secondary">{cliente.tipo_pessoa}</Badge>
        ) : (
          <span className="text-foreground-faint">—</span>
        ),
    },
    {
      header: "Documento",
      className: "font-mono",
      cell: ({ cliente }) => formatDocumento(cliente.documento),
    },
    {
      header: "Telefone",
      className: "font-mono",
      cell: ({ cliente }) => formatTelefone(cliente.telefone),
    },
    {
      header: "OS ativas",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ osAtivas }) => osAtivas,
    },
    {
      header: "Saldo",
      className: "text-right font-mono",
      headerClassName: "text-right",
      cell: ({ saldo }) =>
        saldo > 0 ? (
          <span className="font-semibold text-destructive">{formatBRL(saldo)}</span>
        ) : (
          formatBRL(saldo)
        ),
    },
    { header: "Status", cell: ({ cliente }) => <StatusAtivo ativo={cliente.ativo} /> },
  ];

  const rowActions = ({ cliente }: ClienteListView) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(cliente)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {cliente.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(cliente)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(cliente)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (view: ClienteListView) => {
    const { cliente, cidade, osAtivas, saldo } = view;
    return (
      <div
        className={cn("rounded-xl border bg-card p-4 shadow-sm", !cliente.ativo && "opacity-70")}
      >
        <div className="flex items-start justify-between gap-2">
          <LinhaEntidadeCell
            variante="icone"
            icone={cliente.tipo_pessoa === "PJ" ? "lucide:building-2" : "lucide:user"}
            titulo={
              <Link
                to="/admin/clientes/$clienteId"
                params={{ clienteId: cliente.id }}
                className="hover:text-primary hover:underline"
              >
                {cliente.nome}
              </Link>
            }
            subtitulo={cidade}
          />
          <StatusAtivo ativo={cliente.ativo} />
        </div>
        <dl className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Documento</dt>
            <dd className="font-mono text-foreground">{formatDocumento(cliente.documento)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Telefone</dt>
            <dd className="font-mono text-foreground">{formatTelefone(cliente.telefone)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">OS ativas</dt>
            <dd className="font-mono text-foreground">{osAtivas}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-foreground-faint">Saldo</dt>
            <dd
              className={cn(
                "font-mono",
                saldo > 0 ? "font-semibold text-destructive" : "text-foreground",
              )}
            >
              {formatBRL(saldo)}
            </dd>
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
          placeholder="Buscar por nome ou documento"
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
        titulo="Clientes"
        descricao="Para quem as obras são executadas e a cobrança é emitida."
        acoes={
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <DataList
        data={viewsPaginados}
        columns={columns}
        getRowKey={(v) => v.cliente.id}
        renderCard={renderCard}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        toolbar={toolbar}
        rowActions={rowActions}
        empty={{
          icon: "lucide:building-2",
          titulo: todos.length === 0 ? "Nenhum cliente cadastrado" : "Nada encontrado",
          descricao:
            todos.length === 0
              ? "Cadastre o primeiro cliente para vincular às obras."
              : "Ajuste a busca.",
          cta:
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro cliente
              </Button>
            ) : undefined,
        }}
      />

      {!isLoading && !error && lista.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Itens por página</span>
            <Select
              value={String(itensPorPagina)}
              onValueChange={(v) => setItensPorPagina(Number(v))}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCOES_POR_PAGINA.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>
              {inicioIntervalo}–{fimIntervalo} de {lista.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual <= 1}
              className="gap-1.5"
            >
              <Icon icon="lucide:chevron-left" className="h-4 w-4" />
              Anterior
            </Button>
            <span className="font-mono text-xs">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              className="gap-1.5"
            >
              Próxima
              <Icon icon="lucide:chevron-right" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar cliente" : "Novo cliente"}
        descricao="Os campos com * são obrigatórios."
      >
        <ClienteForm
          inicial={editando}
          onSuccess={() => setFormAberto(false)}
          onCancel={() => setFormAberto(false)}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!inativando}
        onOpenChange={(o) => !o && setInativando(null)}
        titulo="Inativar cliente?"
        descricao={`"${inativando?.nome ?? ""}" não aparecerá para novas ordens. Você pode reativá-lo depois.`}
        confirmLabel="Inativar"
        destrutivo
        onConfirm={confirmarInativar}
      />
    </div>
  );
}
