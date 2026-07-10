import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  Truck,
  Building2,
  HardHat,
  Receipt,
  Tags,
  FileSpreadsheet,
  Wallet,
  Wrench,
  Fuel,
  Calculator,
  TrendingUp,
  LineChart,
  Plug,
  Menu,
  ChevronRight,
  MessageCircle,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { PerguntarIABar } from "@/features/ia/components/perguntar-ia-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useUsuarioRetaguarda } from "@/features/auth/usuario-retaguarda";

const PERFIL_LABEL: Record<string, string> = {
  proprietario: "Proprietário",
  recepcao: "Recepção",
  operador: "Operador",
};

interface NavItem {
  to: string;
  label: string;
  icone: LucideIcon;
}

interface NavGroup {
  titulo: string | null;
  itens: NavItem[];
}

const grupos: NavGroup[] = [
  {
    titulo: "Operação",
    itens: [
      { to: "/admin", label: "Dashboard", icone: LayoutDashboard },
      { to: "/admin/ordens", label: "Ordens de Serviço", icone: FileText },
      { to: "/admin/comprovantes", label: "Comprovantes", icone: FileCheck2 },
    ],
  },
  {
    titulo: "Cadastros",
    itens: [
      { to: "/admin/equipamentos", label: "Equipamentos", icone: Truck },
      { to: "/admin/operadores", label: "Operadores", icone: HardHat },
      { to: "/admin/clientes", label: "Clientes", icone: Building2 },
    ],
  },
  {
    titulo: "Comercial",
    itens: [
      { to: "/admin/precos", label: "Preços", icone: Tags },
      { to: "/admin/orcamentos", label: "Orçamentos", icone: FileSpreadsheet },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      { to: "/admin/faturamento", label: "Faturamento", icone: Receipt },
      { to: "/admin/financeiro", label: "Financeiro", icone: Wallet },
      { to: "/admin/custo-hora", label: "Custo da Hora", icone: Calculator },
      { to: "/admin/rentabilidade", label: "Rentabilidade", icone: TrendingUp },
      { to: "/admin/gerencial", label: "Painel Gerencial", icone: LineChart },
    ],
  },
  {
    titulo: "Frota",
    itens: [
      { to: "/admin/manutencao", label: "Manutenção", icone: Wrench },
      { to: "/admin/diesel", label: "Diesel", icone: Fuel },
    ],
  },
  {
    titulo: null,
    itens: [
      { to: "/admin/integracoes", label: "Integrações", icone: Plug },
      { to: "/admin/ia/chatbot", label: "Chatbot IA", icone: MessageCircle },
    ],
  },
];

const todosItens: NavItem[] = grupos.flatMap((g) => g.itens);

function isActive(pathname: string, to: string) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

function NavList({ pathname, onSelect }: { pathname: string; onSelect?: () => void }) {
  return (
    <nav className="space-y-4">
      {grupos.map((grupo, i) => (
        <div key={grupo.titulo ?? `grupo-${i}`}>
          {grupo.titulo ? (
            <div className="px-3 pb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">
              {grupo.titulo}
            </div>
          ) : null}
          <ul className="space-y-1">
            {grupo.itens.map((item) => {
              const ativo = isActive(pathname, item.to);
              const Icone = item.icone;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onSelect}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      ativo
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icone className="h-4 w-4" />
                    <span>{item.label}</span>
                    {ativo ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Branding() {
  return (
    <div className="flex items-center justify-center px-3 py-4">
      <img
        src="/logo-antonello.png"
        alt="Antonello Terraplanagem"
        className="h-[3.3rem] w-auto object-contain"
      />
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const atual = todosItens.find((i) => isActive(pathname, i.to));
  return (
    <nav aria-label="Trilha" className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Retaguarda</span>
      <ChevronRight className="h-3.5 w-3.5 text-foreground-faint" />
      <span className="font-medium text-foreground">{atual?.label ?? "Início"}</span>
    </nav>
  );
}

export function RetaguardaShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const usuario = useUsuarioRetaguarda();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
      }
    });
  }, [navigate]);

  async function sair() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <Branding />
        <div className="px-3 pb-4">
          <HazardStripe className="rounded-full" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
          <NavList pathname={pathname} />
        </div>
        <div className="border-t border-sidebar-border px-3 py-3 text-[11px] text-sidebar-foreground/50">
          v0.1 · fundação
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <HazardStripe />
          <div className="flex items-center gap-3 px-4 py-3 md:px-8">
            {/* Hambúrguer mobile */}
            <Sheet open={aberto} onOpenChange={setAberto}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <Branding />
                <div className="px-3 pb-4">
                  <HazardStripe className="rounded-full" />
                </div>
                <div className="px-3">
                  <NavList pathname={pathname} onSelect={() => setAberto(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <Breadcrumbs pathname={pathname} />

            <PerguntarIABar />

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden h-9 items-center gap-2 rounded-full border bg-surface px-3 outline-none transition-colors hover:bg-sidebar-accent sm:flex"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {(usuario?.nome ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {usuario?.nome ?? "Carregando..."}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium text-foreground">{usuario?.nome ?? "—"}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {usuario ? (PERFIL_LABEL[usuario.perfil] ?? usuario.perfil) : ""}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={sair}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="w-full px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
