import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

interface CampoResultadoIAProps {
  children: ReactNode;
  rotulo?: string;
}

export function CampoResultadoIA({
  children,
  rotulo = "Sugerido pela IA — confira antes de salvar",
}: CampoResultadoIAProps) {
  return (
    <div className="space-y-1">
      {children}
      <p className="flex items-center gap-1 text-[11px] text-primary">
        <Icon icon="lucide:sparkles" className="h-3 w-3" />
        {rotulo}
      </p>
    </div>
  );
}
