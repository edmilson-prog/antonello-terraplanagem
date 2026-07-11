import { cn } from "@/lib/utils";

interface SparklineProps {
  pontos: number[];
  className?: string;
}

const W = 64;
const H = 26;

// Sparkline em SVG puro (fiel ao mock). Valores em 0..100; mapeados para a
// altura do viewBox. Cor via `currentColor` — o container define text-primary.
export function Sparkline({ pontos, className }: SparklineProps) {
  const coords =
    pontos.length > 1
      ? pontos
          .map((v, i) => {
            const x = (i / (pontos.length - 1)) * W;
            const y = H - (Math.max(0, Math.min(100, v)) / 100) * H;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : pontos.length === 1
        ? `0,${(H - (pontos[0] / 100) * H).toFixed(1)} ${W},${(H - (pontos[0] / 100) * H).toFixed(1)}`
        : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-hidden
      className={cn("text-primary/90", className)}
    >
      {coords ? (
        <polyline
          points={coords}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
