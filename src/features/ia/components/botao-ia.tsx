import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BotaoIAProps {
  label: string;
  labelProcessando?: string;
  onAcionar: () => Promise<void>;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
}

export function BotaoIA({
  label,
  labelProcessando = "Analisando…",
  onAcionar,
  disabled,
  variant = "outline",
  size = "default",
  className,
}: BotaoIAProps) {
  const [processando, setProcessando] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || processando}
      onClick={async () => {
        setProcessando(true);
        try {
          await onAcionar();
        } finally {
          setProcessando(false);
        }
      }}
      className={cn("gap-2", className)}
    >
      <Icon
        icon={processando ? "lucide:loader-circle" : "lucide:sparkles"}
        className={cn("h-4 w-4", processando && "animate-spin")}
      />
      {processando ? labelProcessando : label}
    </Button>
  );
}
