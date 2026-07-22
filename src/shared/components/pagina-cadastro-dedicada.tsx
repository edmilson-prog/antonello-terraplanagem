import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

type RotaListagemCadastro =
  | "/admin/clientes"
  | "/admin/equipamentos"
  | "/admin/custo-hora"
  | "/admin/financeiro"
  | "/admin/operadores"
  | "/admin/orcamentos"
  | "/admin/diesel";

interface PaginaCadastroDedicadaProps {
  backLabel: string;
  backTo: RotaListagemCadastro;
  title: string;
  tag: string;
  children: ReactNode;
}

// Header compartilhado das páginas dedicadas de cadastro (Cliente,
// Equipamento, Custo, Pagamento, Operador — mesmo padrão da Nova OS): link de
// voltar, título + tag. O layout de 2 colunas (campos + resumo ao vivo) fica
// dentro de cada formulário (XForm), não aqui — cada um tem conteúdo
// suficientemente diferente para não valer a pena abstrair além do header.
export function PaginaCadastroDedicada({
  backLabel,
  backTo,
  title,
  tag,
  children,
}: PaginaCadastroDedicadaProps) {
  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        <span className="rounded-full border bg-surface px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {tag}
        </span>
      </div>

      {children}
    </div>
  );
}
