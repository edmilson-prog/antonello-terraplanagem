import { useEffect } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, FileText, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import { cn } from "@/lib/utils";

/*
 * Shell do Ambiente OPERADOR (campo, mobile-first).
 * REGRA RÍGIDA: nenhuma tela deste ambiente pode exibir preço, valor ou
 * qualquer informação financeira — restrição comercial do projeto.
 */

interface NavItem {
  to: string;
  label: string;
  icone: LucideIcon;
}

const itens: NavItem[] = [
  { to: "/app", label: "Início", icone: Home },
  { to: "/app/apontamento", label: "Apontamento", icone: ClipboardList },
  { to: "/app/ordens", label: "Minhas OS", icone: FileText },
  { to: "/app/perfil", label: "Perfil", icone: User },
];

const titulos: { prefixo: string; titulo: string }[] = [
  { prefixo: "/app/apontamento", titulo: "Apontamento" },
  { prefixo: "/app/ordens", titulo: "Minhas OS" },
  { prefixo: "/app/perfil", titulo: "Perfil" },
  { prefixo: "/app", titulo: "Início" },
];

export function OperadorShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const titulo = titulos.find((t) => pathname.startsWith(t.prefixo))?.titulo ?? "Antonello";

  useEffect(() => {
    if (pathname !== "/app/entrar" && !lerSessaoOperador()) {
      navigate({ to: "/app/entrar" });
    }
  }, [pathname, navigate]);

  if (pathname === "/app/entrar") {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <HazardStripe />
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-faint">
              Antonello · Campo
            </span>
            <span className="font-display text-lg font-bold text-foreground">{titulo}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="mx-auto w-full max-w-md px-4 py-5">
          <h1 className="sr-only">
            Antonello Terraplanagem · Painel do Operador — {titulo}
          </h1>
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur"
      >
        <ul className="mx-auto grid w-full max-w-md grid-cols-4">
          {itens.map((item) => {
            const ativo =
              item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
            const Icone = item.icone;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-[64px] flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-colors",
                    ativo
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icone className="h-6 w-6" strokeWidth={ativo ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
