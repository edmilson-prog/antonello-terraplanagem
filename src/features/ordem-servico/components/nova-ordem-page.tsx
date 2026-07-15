import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { OrdemForm } from "@/features/ordem-servico/components/ordem-form";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";

export function NovaOrdemPage() {
  const navigate = useNavigate();
  const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());
  const voltar = () => navigate({ to: "/admin/ordens" });

  return (
    <div className="space-y-6">
      <Link
        to="/admin/ordens"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Ordens de Serviço
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Nova OS
        </h1>
        <span className="rounded-full border bg-surface px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {numero} · rascunho
        </span>
      </div>

      <OrdemForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </div>
  );
}
