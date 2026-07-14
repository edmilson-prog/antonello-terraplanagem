import { Icon } from "@iconify/react";
import { FotoPlaceholder } from "@/features/site/components/foto-placeholder";
import { EquipamentoStatusBadge } from "@/features/equipamentos/labels";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";
import type { EquipamentoStatus } from "@/shared/types";

// PLACEHOLDER: máquinas de exemplo do mock do design system, não o inventário
// real de equipamentos do sistema — revisar com o cliente numa rodada futura.
interface MaquinaExemplo {
  icone: string;
  nome: string;
  especificacoes: string;
  status: EquipamentoStatus;
}

const FROTA: MaquinaExemplo[] = [
  {
    icone: "lucide:truck",
    nome: "Escavadeira CAT 320",
    especificacoes: "Peso operacional 20,5 t · Caçamba 1,19 m³ · Profundidade de escavação 6,7 m",
    status: "disponivel",
  },
  {
    icone: "lucide:shovel",
    nome: "Retroescavadeira JCB 3CX",
    especificacoes: "4×4 · Caçamba frontal 1,0 m³ · Profundidade de escavação 5,4 m",
    status: "disponivel",
  },
  {
    icone: "lucide:building-2",
    nome: "Pá Carregadeira XCMG",
    especificacoes: "Caçamba 1,8 m³ · Carga 3,5 t · Ideal para carregamento e pátio",
    status: "em_uso",
  },
];

export function FrotaSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="frota" className="bg-sidebar px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Frota própria
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold uppercase leading-tight text-sidebar-foreground sm:text-4xl">
            Máquina certa, hora certa
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-sidebar-foreground/70">
            Frota própria com manutenção preditiva por horímetro — menos parada, mais
            previsibilidade no seu cronograma.
          </p>
        </div>

        <div
          ref={ref}
          className={`mt-10 grid gap-3.5 transition-all duration-700 sm:grid-cols-2 lg:grid-cols-3 ${
            revelado ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          {FROTA.map((maquina) => (
            <div
              key={maquina.nome}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <FotoPlaceholder
                icone={maquina.icone}
                legenda={`Foto — ${maquina.nome}`}
                className="h-[190px] rounded-b-none border-x-0 border-t-0"
              />
              <div className="p-4">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
                  <Icon icon={maquina.icone} className="h-4 w-4 text-primary" />
                  {maquina.nome}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {maquina.especificacoes}
                </p>
                <div className="mt-3">
                  <EquipamentoStatusBadge status={maquina.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
