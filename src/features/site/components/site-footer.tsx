import { MarcaAntonello } from "@/features/site/components/marca-antonello";
import { contato } from "@/features/site/lib/contato";

const NAV_LINKS = [
  { href: "#servicos", label: "Serviços" },
  { href: "#frota", label: "Frota" },
  { href: "#processo", label: "Como trabalhamos" },
];

export function SiteFooter() {
  return (
    <footer className="px-6 pb-8 pt-11">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start gap-10">
          <MarcaAntonello className="mr-auto" />

          <div className="flex min-w-[150px] flex-col gap-2">
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Navegação
            </span>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex min-w-[150px] flex-col gap-2">
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contato
            </span>
            <span className="font-mono text-[12.5px] text-muted-foreground">
              {contato.telefoneExibicao}
            </span>
            <span className="text-sm text-muted-foreground">{contato.cidadeUf}</span>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-border pt-[18px] font-mono text-[11.5px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Antonello Terraplanagem</span>
          <span className="flex-1" />
          <span>CNPJ {contato.cnpj}</span>
        </div>
      </div>
    </footer>
  );
}
