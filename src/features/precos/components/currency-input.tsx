// src/features/precos/components/currency-input.tsx
import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatValorInput, parseValorInput } from "@/features/precos/money";

interface CurrencyInputProps {
  id?: string;
  value: number; // reais
  onChange: (reais: number) => void;
  error?: boolean;
  placeholder?: string;
  className?: string;
}

// Campo monetário controlado: mantém o valor em reais (number) no form, exibe a
// máscara "R$ 1.234,56" montando os centavos da direita. Entrada vazia => 0.
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ id, value, onChange, error, placeholder, className }, ref) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
          R$
        </span>
        <Input
          ref={ref}
          id={id}
          inputMode="decimal"
          className={cn("pl-9 font-mono tabular-nums", className)}
          value={value > 0 ? formatValorInput(value) : ""}
          placeholder={placeholder ?? "0,00"}
          aria-invalid={error}
          onChange={(e) => onChange(parseValorInput(e.target.value))}
        />
      </div>
    );
  },
);
