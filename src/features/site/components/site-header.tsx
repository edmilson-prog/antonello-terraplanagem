import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { MarcaAntonello } from "@/features/site/components/marca-antonello";
import { contato } from "@/features/site/lib/contato";

const LINKS_NAV = [
  { href: "#servicos", label: "Serviços" },
  { href: "#frota", label: "Frota" },
  { href: "#processo", label: "Como trabalhamos" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <MarcaAntonello className="mr-auto" />
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS_NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <Button
          asChild
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <a href={contato.whatsappOrcamento} target="_blank" rel="noopener noreferrer">
            Pedir orçamento
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
