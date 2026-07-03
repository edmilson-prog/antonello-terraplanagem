import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
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
  Menu,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icone: LucideIcon;
}

const itens: NavItem[] = [
  { to: "/admin", label: "Dashboard", icone: LayoutDashboard },
  { to: "/admin/ordens", label: "Ordens de Serviço", icone: FileText },
  { to: "/admin/comprovantes", label: "Comprovantes", icone: FileCheck2 },
  { to: "/admin/equipamentos", label: "Equipamentos", icone: Truck },
  { to: "/admin/manutencao", label: "Manutenção", icone: Wrench },
  { to: "/admin/diesel", label: "Diesel", icone: Fuel },
  { to: "/admin/clientes", label: "Clientes", icone: Building2 },
  { to: "/admin/operadores", label: "Operadores", icone: HardHat },
  { to: "/admin/precos", label: "Preços", icone: Tags },
  { to: "/admin/orcamentos", label: "Orçamentos", icone: FileSpreadsheet },
  { to: "/admin/faturamento", label: "Faturamento", icone: Receipt },
  { to: "/admin/financeiro", label: "Financeiro", icone: Wallet },
  { to: "/admin/custo-hora", label: "Custo da Hora", icone: Calculator },
  { to: "/admin/rentabilidade", label: "Rentabilidade", icone: TrendingUp },
];

function isActive(pathname: string, to: string) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

function NavList({ pathname, onSelect }: { pathname: string; onSelect?: () => void }) {
  return (
    <ul className="space-y-1">
      {itens.map((item) => {
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
  );
}

function Branding() {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <div className="hazard-stripe h-9 w-9 rounded-md border border-sidebar-border" />
      <div className="leading-tight">
        <div className="font-display text-base font-bold text-sidebar-foreground">Antonello</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
          Terraplanagem
        </div>
      </div>
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const atual = itens.find((i) => isActive(pathname, i.to));
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

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <Branding />
        <div className="px-3 pb-4">
          <HazardStripe className="rounded-full" />
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <NavList pathname={pathname} />
        </div>
        <div className="border-t border-sidebar-border px-3 py-3 text-[11px] text-sidebar-foreground/50">
          v0.1 · fundação
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden h-9 items-center gap-2 rounded-full border bg-surface px-3 sm:flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  A
                </div>
                <span className="text-xs font-medium text-foreground">Recepção</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
