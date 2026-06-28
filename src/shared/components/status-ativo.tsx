import { cn } from "@/lib/utils";

// Badge de ciclo de vida (ativo/inativo) reutilizado pelos cadastros de
// operadores e clientes. Equipamentos usam um badge próprio (status operacional).
export function StatusAtivo({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ativo
          ? "bg-primary/20 text-foreground border-primary/50"
          : "border-border bg-surface text-foreground-faint",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}
