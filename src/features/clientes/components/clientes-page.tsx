import { useEffect, useMemo, useState } from "react";
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
import { StatusAtivo } from "@/shared/components/status-ativo";
import { formatDocumento, formatTelefone } from "@/shared/lib/format";
import { clientesStore } from "@/features/clientes/clientes-store";
import { ClienteForm } from "@/features/clientes/components/cliente-form";
import type { Cliente } from "@/shared/types";
import { cn } from "@/lib/utils";

const OPCOES_POR_PAGINA = [20, 50, 100] as const;

export function ClientesPage() {
  const todos = clientesStore.useAll();
  const { isLoading, error } = clientesStore.useEstado();
  const retry = clientesStore.retry;

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

  const columns: Column<Cliente>[] = [
    {
      header: "Nome",
      cell: (c) => (
        <Link
          to="/admin/clientes/$clienteId"
          params={{ clienteId: c.id }}
          className={cn(
            "font-medium text-foreground hover:text-primary hover:underline",
            !c.ativo && "opacity-60",
          )}
        >
          {c.nome}
        </Link>
      ),
    },
    { header: "Documento", className: "font-mono", cell: (c) => formatDocumento(c.documento) },
    { header: "Telefone", className: "font-mono", cell: (c) => formatTelefone(c.telefone) },
    { header: "Status", cell: (c) => <StatusAtivo ativo={c.ativo} /> },
  ];

  const rowActions = (c: Cliente) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(c)} className="gap-1.5">
        <Icon icon="lucide:pencil" className="h-4 w-4" />
        Editar
      </Button>
      {c.ativo ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInativando(c)}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Icon icon="lucide:ban" className="h-4 w-4" />
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => reativar(c)} className="gap-1.5">
          <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
          Reativar
        </Button>
      )}
    </div>
  );

  const renderCard = (c: Cliente) => (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", !c.ativo && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/clientes/$clienteId"
          params={{ clienteId: c.id }}
          className="min-w-0 font-display font-bold text-card-foreground hover:text-primary hover:underline"
        >
          {c.nome}
        </Link>
        <StatusAtivo ativo={c.ativo} />
      </div>
      <dl className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-foreground-faint">Documento</dt>
          <dd className="font-mono text-foreground">{formatDocumento(c.documento)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-foreground-faint">Telefone</dt>
          <dd className="font-mono text-foreground">{formatTelefone(c.telefone)}</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">{rowActions(c)}</div>
    </div>
  );

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
        data={listaPaginada}
        columns={columns}
        getRowKey={(c) => c.id}
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
