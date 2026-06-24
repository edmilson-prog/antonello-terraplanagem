import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { encerrarSessao, lerSessao } from "@/shared/hooks/use-mock-session";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil · Antonello" },
      {
        name: "description",
        content: "Perfil e logout do operador no app de campo da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AppPerfil,
});

function AppPerfil() {
  const navigate = useNavigate();
  const sessao = typeof window !== "undefined" ? lerSessao() : null;

  function sair() {
    encerrarSessao();
    navigate({ to: "/login" });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-7 w-7" />
          </div>
          <div>
            <div className="font-display text-lg font-bold text-card-foreground">
              {sessao?.nome ?? "Operador"}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
              Perfil: {sessao?.perfil ?? "operador"}
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={sair}
        className="w-full justify-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );
}
