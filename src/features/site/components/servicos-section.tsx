import { Icon } from "@iconify/react";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";

interface Servico {
  icone: string;
  titulo: string;
  descricao: string;
}

const SERVICOS: Servico[] = [
  {
    icone: "lucide:truck",
    titulo: "Terraplenagem",
    descricao:
      "Corte, aterro e conformação de platôs para obras industriais, comerciais e rurais.",
  },
  {
    icone: "lucide:shovel",
    titulo: "Escavação e drenagem",
    descricao: "Valas, canais e redes pluviais com controle de cota e proteção de taludes.",
  },
  {
    icone: "lucide:building-2",
    titulo: "Fundações e estacas",
    descricao:
      "Escavação para fundação de galpões e estruturas, com apoio à cravação de estacas.",
  },
  {
    icone: "lucide:gauge",
    titulo: "Nivelamento de pátios",
    descricao:
      "Regularização e compactação de pátios de manobra, estacionamentos e acessos internos.",
  },
  {
    icone: "lucide:route",
    titulo: "Abertura de acessos",
    descricao: "Estradas de serviço e acessos rurais com cascalhamento e drenagem dimensionada.",
  },
  {
    icone: "lucide:trees",
    titulo: "Limpeza de terreno",
    descricao: "Supressão, destoca e remoção de material com destinação correta.",
  },
];

export function ServicosSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="servicos" className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Serviços
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold uppercase leading-tight text-foreground sm:text-4xl">
            Infraestrutura de solo do início ao fim
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Da limpeza do terreno à compactação final — uma equipe, uma frota e um responsável
            pela sua obra.
          </p>
        </div>

        <div
          ref={ref}
          className={`mt-10 grid gap-3.5 transition-all duration-700 sm:grid-cols-2 lg:grid-cols-3 ${
            revelado ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          {SERVICOS.map((servico) => (
            <div
              key={servico.titulo}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-[11px] bg-primary/10 text-primary">
                <Icon icon={servico.icone} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-[15px] font-bold uppercase tracking-wide text-foreground">
                {servico.titulo}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {servico.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
