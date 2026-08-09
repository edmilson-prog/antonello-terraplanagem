import { LogoTile } from "@/shared/components/logo-tile";
import { cn } from "@/lib/utils";

export interface MarcaAntonelloProps {
  className?: string;
}

// Logo-tile + nome da marca, reaproveitado no header e no rodapé da landing.
export function MarcaAntonello({ className }: MarcaAntonelloProps) {
  return (
    <a href="#top" className={cn("flex items-center gap-2.5", className)}>
      <LogoTile size={36} />
      <span className="font-display text-sm font-extrabold leading-tight text-foreground">
        ANTONELLO
        <span className="block text-[9px] font-semibold tracking-[0.22em] text-primary">
          TERRAPLANAGEM
        </span>
      </span>
    </a>
  );
}
