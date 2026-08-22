import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusAtivo } from "@/shared/components/status-ativo";
import { formatDataHora, formatDocumento, formatTelefone } from "@/shared/lib/format";
import type { Cliente } from "@/shared/types";

export interface ClienteHeroProps {
  cliente: Cliente;
  recorrente: boolean;
  /** `null` quando o cliente ainda não tem nenhuma OS. */
  ultimaOS: string | null;
  onEditar: () => void;
  onInativar: () => void;
  onReativar: () => void;
}

function whatsappHref(telefone: string | null): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/55${digitos}`;
}

export function ClienteHero({
  cliente,
  recorrente,
  ultimaOS,
  onEditar,
  onInativar,
  onReativar,
}: ClienteHeroProps) {
  const wa = whatsappHref(cliente.telefone);

  return (
    <section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-card to-surface p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          aria-hidden
          className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover font-display text-3xl font-extrabold text-primary-foreground shadow-lg"
        >
          <Icon icon="lucide:building-2" className="h-9 w-9" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-foreground sm:text-3xl">
            {cliente.nome}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusAtivo ativo={cliente.ativo} />
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Icon icon="lucide:building" className="h-3.5 w-3.5" />
              {cliente.tipo_pessoa === "PF" ? "Pessoa física" : "Pessoa jurídica"}
            </span>
            {recorrente ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground">
                <Icon icon="lucide:repeat" className="h-3.5 w-3.5" />
                Cliente recorrente
              </span>
            ) : null}
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <Quickfact rotulo="Documento" valor={formatDocumento(cliente.documento)} mono />
            <Quickfact rotulo="Telefone" valor={formatTelefone(cliente.telefone)} mono />
            <Quickfact rotulo="Cliente desde" valor={formatDataHora(cliente.created_at)} />
            <Quickfact rotulo="Última OS" valor={ultimaOS ?? "—"} />
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={onEditar} className="gap-1.5">
            <Icon icon="lucide:pencil" className="h-4 w-4" />
            Editar
          </Button>
          {wa ? (
            <Button asChild variant="outline" className="gap-1.5">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <Icon icon="lucide:message-circle" className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          ) : null}
          <Button
            asChild
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Link to="/admin/orcamentos">
              <Icon icon="lucide:file-plus" className="h-4 w-4" />
              Novo orçamento
            </Link>
          </Button>
          {cliente.ativo ? (
            <Button
              variant="outline"
              onClick={onInativar}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Icon icon="lucide:ban" className="h-4 w-4" />
              Inativar
            </Button>
          ) : (
            <Button variant="outline" onClick={onReativar} className="gap-1.5">
              <Icon icon="lucide:rotate-ccw" className="h-4 w-4" />
              Reativar
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Quickfact({ rotulo, valor, mono }: { rotulo: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </dt>
      <dd className={mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
        {valor}
      </dd>
    </div>
  );
}
