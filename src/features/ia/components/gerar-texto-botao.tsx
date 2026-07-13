import { BotaoIA } from "@/features/ia/components/botao-ia";
import { gerarTexto } from "@/features/ia/mock/comercial";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

interface GerarTextoBotaoProps {
  os: OrdemServico;
  apontamentos: Apontamento[];
  equipamentos: Equipamento[];
  onGerado: (texto: string) => void;
}

export function GerarTextoBotao({
  os,
  apontamentos,
  equipamentos,
  onGerado,
}: GerarTextoBotaoProps) {
  return (
    <BotaoIA
      label="Gerar texto com IA"
      labelProcessando="Redigindo…"
      size="sm"
      onAcionar={async () => onGerado(await gerarTexto(os, apontamentos, equipamentos))}
    />
  );
}
