import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { contato } from "@/features/site/lib/contato";

export function ContatoBand() {
  return (
    <section id="contato" className="border-y border-border bg-sidebar px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-8">
        <h2 className="max-w-lg text-balance font-display text-2xl font-extrabold uppercase leading-tight text-sidebar-foreground sm:text-3xl">
          Tem um terreno para <em className="not-italic text-primary">preparar</em>?
        </h2>
        <div className="ml-auto flex flex-col items-end gap-3">
          <Button
            asChild
            className="gap-1.5 rounded-xl bg-primary px-5 py-3 text-primary-foreground hover:bg-primary-hover"
          >
            <a href={contato.whatsappOrcamento} target="_blank" rel="noopener noreferrer">
              Pedir orçamento
              <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            </a>
          </Button>
          <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-sidebar-foreground/80">
            <Icon icon="lucide:phone" className="h-4 w-4 text-primary" />
            {contato.telefoneExibicao}
          </span>
        </div>
      </div>
    </section>
  );
}
