import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export function AtalhosOperacional() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
        <Link to="/admin/ordens">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Nova O.S.
        </Link>
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <Link to="/admin/clientes">
          <Icon icon="lucide:user-plus" className="h-4 w-4" />
          Novo cliente
        </Link>
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <Link to="/admin/rentabilidade">
          <Icon icon="lucide:bar-chart-3" className="h-4 w-4" />
          Gerar relatório de rentabilidade
        </Link>
      </Button>
    </div>
  );
}
