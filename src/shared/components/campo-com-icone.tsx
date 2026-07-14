import type { ReactNode, HTMLInputTypeAttribute } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CampoComIconeProps {
  icone: string;
  label: string;
  id: string;
  tipo?: HTMLInputTypeAttribute;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  acao?: ReactNode;
}

export function CampoComIcone({
  icone,
  label,
  id,
  tipo = "text",
  valor,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  required,
  ariaInvalid,
  ariaDescribedBy,
  acao,
}: CampoComIconeProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-md border border-border bg-surface px-3",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        )}
      >
        <Icon icon={icone} className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          id={id}
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
          aria-invalid={ariaInvalid ? true : undefined}
          aria-describedby={ariaDescribedBy}
          className="h-11 min-w-0 flex-1 border-none bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
        />
        {acao}
      </div>
    </div>
  );
}
