import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export function WidgetAtalhos() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
        <Link to="/admin/ordens">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Nova OS
        </Link>
      </Button>
      <Button asChild variant="outline" className="gap-2">
        <Link to="/admin/orcamentos">
          <Icon icon="lucide:file-plus" className="h-4 w-4" />
          Novo orçamento
        </Link>
      </Button>
    </div>
  );
}
