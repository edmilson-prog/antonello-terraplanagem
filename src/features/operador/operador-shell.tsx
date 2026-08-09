import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

/*
 * Shell do Ambiente OPERADOR (campo, mobile-first) — UI kit `ui_kits/app-campo`.
 *
 * REGRA RÍGIDA: nenhuma tela deste ambiente pode exibir preço, valor ou
 * qualquer informação financeira — restrição comercial do projeto.
 *
 * Estrutura do kit: a coluna ocupa a altura da viewport, cada tela rola por
 * dentro e a barra de abas é um item flex (não `fixed`) — assim o teclado do
 * celular não empurra a barra por cima do conteúdo. Cabeçalho é de cada tela:
 * as abas usam `ac-head` e as sub-telas usam `ac-form-head`.
 */

interface Aba {
  to: "/app" | "/app/ordens" | "/app/abastecer" | "/app/perfil";
  label: string;
  icone: string;
}

const ABAS: Aba[] = [
  { to: "/app", label: "Hoje", icone: "lucide:layout-dashboard" },
  { to: "/app/ordens", label: "Minhas OS", icone: "lucide:clipboard-list" },
  { to: "/app/abastecer", label: "Abastecer", icone: "lucide:fuel" },
  { to: "/app/perfil", label: "Perfil", icone: "lucide:user" },
];

function normalizar(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function OperadorShell() {
  const pathname = normalizar(useRouterState({ select: (s) => s.location.pathname }));

  if (pathname === "/app/entrar") {
    return <Outlet />;
  }

  // A barra só aparece nas quatro raízes de aba: sub-telas do kit ocupam a
  // tela inteira e voltam pelo cabeçalho.
  const emAba = ABAS.some((a) => a.to === pathname);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <h1 className="sr-only">Antonello Terraplanagem · App de Campo</h1>
      <Outlet />
      {emAba ? <AbasOperador pathname={pathname} /> : null}
    </div>
  );
}

function AbasOperador({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Navegação principal" className="shrink-0 border-t bg-surface">
      <ul className="grid grid-cols-4">
        {ABAS.map((aba) => {
          const ativo = aba.to === pathname;
          return (
            <li key={aba.to}>
              <Link
                to={aba.to}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex min-h-[62px] flex-col items-center justify-center gap-1.5 text-[10.5px] font-semibold transition-colors",
                  ativo ? "text-primary" : "text-foreground-faint hover:text-muted-foreground",
                )}
              >
                <Icon icon={aba.icone} className="h-[19px] w-[19px]" />
                <span>{aba.label}</span>
                <span
                  aria-hidden
                  className={cn("h-1 w-1 rounded-full", ativo ? "bg-primary" : "bg-transparent")}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
