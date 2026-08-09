import { cn } from "@/lib/utils";

export interface LogoTileProps {
  /** Lado do tile em px. O raio e o traço acompanham proporcionalmente. */
  size?: number;
  className?: string;
}

/*
 * Logo-tile da marca: quadrado âmbar com o pictograma de terraplanagem.
 * SVG de marca (cor fixa, não token de UI) — legível sobre fundo claro ou
 * escuro, diferente dos PNGs `/logo-antonello-*.png`, que trazem fundo sólido.
 */
export function LogoTile({ size = 36, className }: LogoTileProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Antonello Terraplanagem"
      className={cn("shrink-0", className)}
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
  );
}
