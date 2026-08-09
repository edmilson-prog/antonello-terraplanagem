import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, LogOut } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { encerrarSessaoOperador, lerSessaoOperador } from "@/features/auth/operador-session";
import { ConfiguracaoPush, limparNotificacoesLocais, useNaoLidas } from "@/features/notificacoes";
import { desativarPush } from "@/features/notificacoes/push";

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
  const sessao = typeof window !== "undefined" ? lerSessaoOperador() : null;
  const naoLidas = useNaoLidas();

  async function sair() {
    // Antes de encerrar: tira o push e apaga o cache local. Este aparelho é
    // compartilhado — o próximo operador não pode receber aviso nem ver
    // notificação de quem usou antes.
    await desativarPush();
    limparNotificacoesLocais();

    if (sessao) {
      await supabase.rpc("logout_operador", { p_token: sessao.token });
    }
    encerrarSessaoOperador();
    navigate({ to: "/app/entrar" });
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
              {sessao?.operadorNome ?? "Operador"}
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
              Perfil: operador
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/app/notificacoes"
        className="flex min-h-[44px] items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon icon="lucide:bell" className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 text-sm font-semibold text-card-foreground">
          Notificações
          {naoLidas > 0 ? (
            <span className="ml-1.5 font-mono text-[11px] font-medium text-primary">
              · {naoLidas} {naoLidas === 1 ? "nova" : "novas"}
            </span>
          ) : null}
        </span>
        <Icon icon="lucide:chevron-right" className="h-4 w-4 flex-none text-foreground-faint" />
      </Link>

      <ConfiguracaoPush />

      <Button variant="outline" size="lg" onClick={sair} className="w-full justify-center gap-2">
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  );
}
