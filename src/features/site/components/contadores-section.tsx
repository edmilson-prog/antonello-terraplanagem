import { useCountUp } from "@/features/site/hooks/use-count-up";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";

// PLACEHOLDER: números ilustrativos do mock do design system, não medidos —
// confirmar com o cliente antes de tratar como dado real do negócio.
interface Contador {
  alvo: number;
  sufixo: string;
  rotulo: string;
}

const CONTADORES: Contador[] = [
  { alvo: 20, sufixo: "+", rotulo: "Anos de estrada" },
  { alvo: 14, sufixo: "", rotulo: "Equipamentos próprios" },
  { alvo: 180, sufixo: "+", rotulo: "Obras entregues" },
  { alvo: 2140, sufixo: "h", rotulo: "Operadas por ano" },
];

export function ContadoresSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-12 sm:grid-cols-4">
      {CONTADORES.map((contador) => (
        <ContadorItem key={contador.rotulo} contador={contador} ativo={revelado} />
      ))}
    </div>
  );
}

function ContadorItem({ contador, ativo }: { contador: Contador; ativo: boolean }) {
  const valor = useCountUp(contador.alvo, ativo);

  return (
    <div className="border-l border-border pl-5 text-left">
      <div className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-[42px]">
        {valor.toLocaleString("pt-BR")}
        <b className="font-semibold text-primary">{contador.sufixo}</b>
      </div>
      <div className="mt-2.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {contador.rotulo}
      </div>
    </div>
  );
}
