import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { FotoPlaceholder } from "@/features/site/components/foto-placeholder";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";
import { contato } from "@/features/site/lib/contato";

const CHIPS = ["Apontamento por horímetro", "Medição e NF por etapa", "Orçamento em até 48 h"];

export function HeroSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="top" className="relative overflow-hidden px-6 pb-18 pt-20 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        ref={ref}
        className={`mx-auto grid max-w-6xl gap-14 transition-all duration-700 lg:grid-cols-[1.06fr_1fr] lg:items-center ${
          revelado ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div>
          <span className="inline-flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="hazard-stripe h-2 w-6 rounded-sm" />
            {contato.cidadeUf} · Frota própria
          </span>
          <h1 className="mt-4 text-balance font-display text-[42px] font-extrabold uppercase leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
            O terreno <em className="not-italic text-primary">pronto</em> para o seu projeto
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Terraplenagem, escavação e infraestrutura de solo com equipamentos próprios, operadores
            experientes e gestão de obra em tempo real — do orçamento à nota fiscal.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <a href={contato.whatsappOrcamento} target="_blank" rel="noopener noreferrer">
                Pedir orçamento
                <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5 rounded-xl">
              <a href={contato.whatsappContato} target="_blank" rel="noopener noreferrer">
                <Icon icon="lucide:message-circle" className="h-4 w-4" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <li
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <Icon icon="lucide:check" className="h-3.5 w-3.5 text-primary" />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <FotoPlaceholder
            icone="lucide:image"
            legenda="Foto de obra (escavadeira em operação)"
            className="h-[340px] sm:h-[400px]"
          />
          <div className="absolute -right-3 top-5 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Icon icon="lucide:clipboard-list" className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">OS-021 em andamento</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Terraplenagem · lote industrial
              </div>
            </div>
          </div>
          <div className="absolute -left-4 bottom-6 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Icon icon="lucide:gauge" className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">Horímetro 4.210 → 4.218</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                8,0 h apontadas hoje
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
