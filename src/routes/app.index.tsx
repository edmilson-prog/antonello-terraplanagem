import { createFileRoute } from "@tanstack/react-router";
import { Sun, Clock } from "lucide-react";
import { EmptyState } from "@/shared/components/empty-state";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Início · Painel do Operador · Antonello" },
      {
        name: "description",
        content: "Resumo do turno, equipamento atribuído e OS do dia para o operador da Antonello.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AppInicio,
});

function AppInicio() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-foreground-faint">
          <Sun className="h-3.5 w-3.5" />
          Bom dia
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-card-foreground">
          Pronto pra começar?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui você verá o resumo do dia: equipamento do turno, OS abertas e seu horímetro.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-xs font-mono text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          Sem turno aberto no momento
        </div>
      </div>

      <EmptyState
        titulo="Resumo do dia em construção"
        descricao="Em breve: equipamento atribuído, horímetro de início e fim, e suas ordens do dia."
      />
    </div>
  );
}
