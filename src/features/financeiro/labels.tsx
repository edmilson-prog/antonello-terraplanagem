/* eslint-disable react-refresh/only-export-components */
import type {
  StatusConta,
  CategoriaDespesa,
  FormaRecebimento,
  FormaPagamento,
} from "@/shared/types";
import { cn } from "@/lib/utils";

export const STATUS_CONTA_LABEL: Record<StatusConta, string> = {
  aberta: "Em Aberto",
  liquidada: "Liquidada",
};

const STATUS_CONTA_CLASS: Record<StatusConta, string> = {
  aberta: "bg-steel/20 text-foreground border-steel/40",
  liquidada: "bg-secondary/25 text-foreground border-secondary/50",
};

export function StatusContaBadge({
  status,
  className,
}: {
  status: StatusConta;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CONTA_CLASS[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_CONTA_LABEL[status]}
    </span>
  );
}

export const CATEGORIA_LABEL: Record<CategoriaDespesa, string> = {
  diesel: "Diesel",
  manutencao: "Manutenção",
  folha: "Folha",
  fornecedor: "Fornecedor",
  outro: "Outro",
};

export const FORMA_RECEBIMENTO_LABEL: Record<FormaRecebimento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  transferencia: "Transferência",
  boleto: "Boleto",
  cheque: "Cheque",
  outro: "Outro",
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  transferencia: "Transferência",
  boleto: "Boleto",
  cheque: "Cheque",
  outro: "Outro",
};

export const FORMA_RECEBIMENTO_ICONE: Record<FormaRecebimento, string> = {
  dinheiro: "lucide:banknote",
  pix: "lucide:credit-card",
  transferencia: "lucide:landmark",
  boleto: "lucide:link",
  cheque: "lucide:file-text",
  outro: "lucide:circle",
};

export const CATEGORIA_ICONE: Record<CategoriaDespesa, string> = {
  diesel: "lucide:fuel",
  manutencao: "lucide:wrench",
  folha: "lucide:hard-hat",
  fornecedor: "lucide:truck",
  outro: "lucide:circle",
};
