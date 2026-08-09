import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  formatDataHora,
  formatDocumento,
  formatTelefone,
  iniciaisDoNome,
} from "@/shared/lib/format";
import type { Operador } from "@/shared/types";

export interface OperadorHeroProps {
  operador: Operador;
  ultimaAtividade: string;
  onEditar: () => void;
  onInativar: () => void;
  onReativar: () => void;
}

// Reexport histórico: a implementação vive em `shared/lib/format` desde que o
// app de campo passou a precisar das mesmas iniciais no login por PIN.
// eslint-disable-next-line react-refresh/only-export-components
export const iniciais = iniciaisDoNome;

function whatsappHref(telefone: string | null): string | null {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return `https://wa.me/55${digitos}`;
}

export function OperadorHero({
  operador,
  ultimaAtividade,
  onEditar,
  onInativar,
  onReativar,
}: OperadorHeroProps) {
  const wa = whatsappHref(operador.telefone);

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
          {iniciais(operador.nome)}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-foreground sm:text-3xl">
            {operador.nome}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={
                operador.ativo
                  ? "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground"
                  : "inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground-faint"
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {operador.ativo ? "Ativo" : "Inativo"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Icon icon="lucide:hard-hat" className="h-3.5 w-3.5" />
              Operador
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-steel/40 bg-steel/15 px-2.5 py-1 text-xs font-semibold text-foreground">
              <Icon icon="lucide:smartphone" className="h-3.5 w-3.5" />
              Acesso ao app
            </span>
          </div>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <Quickfact rotulo="CPF" valor={formatDocumento(operador.cpf)} mono />
            <Quickfact rotulo="Telefone" valor={formatTelefone(operador.telefone)} mono />
            <Quickfact rotulo="Operador desde" valor={formatDataHora(operador.created_at)} />
            <Quickfact rotulo="Última atividade" valor={ultimaAtividade} />
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
          {operador.ativo ? (
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
