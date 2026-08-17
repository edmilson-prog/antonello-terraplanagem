import { Icon } from "@iconify/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { semEfeito, type ChaveParametro } from "@/features/parametros/campos";

const EXPLICACAO =
  "Fica salvo, mas o sistema ainda não consulta este parâmetro em lugar nenhum — nada muda de comportamento ao alterá-lo.";

/**
 * Selo dos parâmetros que o UI kit desenha mas o produto ainda não usa. Mesma
 * postura do selo "Posições ilustrativas" do Painel Operacional: quando o mock
 * promete um controle que não existe, a tela diz isso em vez de copiar o
 * rótulo. Não renderiza nada para os parâmetros que já têm efeito.
 */
export function SemEfeito({ chave }: { chave: ChaveParametro }) {
  if (!semEfeito(chave)) return null;

  // Provider próprio: o app não tem um global, e o selo precisa funcionar em
  // qualquer tela onde for usado.
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            title={EXPLICACAO}
            className="ml-1 inline-flex cursor-help items-center gap-1 rounded-full border border-dashed bg-surface px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-foreground-faint"
          >
            <Icon icon="lucide:circle-dashed" className="h-3 w-3" />
            só cadastro
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">{EXPLICACAO}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
