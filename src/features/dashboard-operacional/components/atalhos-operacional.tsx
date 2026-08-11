import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export function AtalhosOperacional() {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Button asChild size="sm" className="gap-2">
        <Link to="/admin/ordens/nova">
          <Icon icon="lucide:file-plus" className="h-4 w-4" />
          Nova O.S.
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <Link to="/admin/orcamentos/novo">
          <Icon icon="lucide:file-text" className="h-4 w-4" />
          Novo orçamento
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <Link to="/admin/clientes/novo">
          <Icon icon="lucide:users" className="h-4 w-4" />
          Novo cliente
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <Link to="/admin/diesel/novo">
          <Icon icon="lucide:fuel" className="h-4 w-4" />
          Registrar abastecimento
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <Link to="/admin/rentabilidade">
          <Icon icon="lucide:bar-chart-3" className="h-4 w-4" />
          Gerar relatório
        </Link>
      </Button>
    </div>
  );
}
