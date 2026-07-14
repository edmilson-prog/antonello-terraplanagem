import { cn } from "@/lib/utils";

export interface MarcaAntonelloProps {
  className?: string;
}

// Logo-tile + nome da marca, reaproveitado no header e no rodapé da landing.
// SVG fixo (cor âmbar de marca, não um ícone de UI) — funciona sobre fundo
// claro ou escuro, diferente dos PNGs `/logo-antonello-*.png` que já trazem
// um fundo sólido embutido (ver `login-page.tsx`).
export function MarcaAntonello({ className }: MarcaAntonelloProps) {
  return (
    <a href="#top" className={cn("flex items-center gap-2.5", className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 48 48"
        role="img"
        aria-label="Antonello Terraplanagem"
        className="shrink-0"
      >
        <rect width="48" height="48" rx="14" fill="#ffb300" />
        <g
          transform="translate(12,12)"
          fill="none"
          stroke="#16140f"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 20h18" />
          <path d="M6 20v-4h4v4" />
          <path d="m10 16 3-7 5 4v3" />
        </g>
      </svg>
      <span className="font-display text-sm font-extrabold leading-tight text-foreground">
        ANTONELLO
        <span className="block text-[9px] font-semibold tracking-[0.22em] text-primary">
          TERRAPLANAGEM
        </span>
      </span>
    </a>
  );
}
