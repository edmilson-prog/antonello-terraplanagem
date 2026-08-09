import { Icon } from "@iconify/react";
import { Skeleton } from "@/components/ui/skeleton";
import { BotaoCampo } from "@/features/operador/components/kit/kit-acoes";

/*
 * Estados de tela do App de Campo. O kit só desenha o caminho feliz; loading,
 * erro e vazio são obrigatórios pelo CLAUDE.md e usam a mesma linguagem visual.
 */

export function CarregandoCampo({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-[14px]" />
      ))}
    </div>
  );
}

export function ErroCampo({
  mensagem,
  onTentarNovamente,
}: {
  mensagem: string;
  onTentarNovamente?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed px-6 py-12 text-center"
    >
      <Icon icon="lucide:triangle-alert" className="h-7 w-7 text-destructive" />
      <p className="text-[12.5px] leading-[1.5] text-muted-foreground">{mensagem}</p>
      {onTentarNovamente ? (
        <BotaoCampo variante="ghost" onClick={onTentarNovamente} className="mt-1">
          <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
          Tentar novamente
        </BotaoCampo>
      ) : null}
    </div>
  );
}

export function VazioCampo({
  icone,
  titulo,
  descricao,
}: {
  icone: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-[14px] border border-dashed px-6 py-12 text-center">
      <Icon icon={icone} className="h-7 w-7 text-foreground-faint" />
      <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
        {titulo}
      </p>
      {descricao ? (
        <p className="text-[12.5px] leading-[1.5] text-foreground-faint">{descricao}</p>
      ) : null}
    </div>
  );
}
