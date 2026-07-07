import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { variacaoPercentual } from "@/features/gerencial/derivacoes";

interface Props {
  rotulo: string;
  valorAtual: number;
  valorAnterior: number;
  formatar: (v: number) => string;
  icone?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function NumeroChaveCard({
  rotulo,
  valorAtual,
  valorAnterior,
  formatar,
  icone,
  isLoading,
  error,
  onRetry,
}: Props) {
  const variacao = variacaoPercentual(valorAtual, valorAnterior);
  const descricao =
    variacao === null
      ? "Sem período anterior para comparar"
      : `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)}% vs período anterior`;

  return (
    <KpiCard
      rotulo={rotulo}
      valor={formatar(valorAtual)}
      descricao={descricao}
      icone={icone}
      variante={variacao != null && variacao < 0 ? "alerta" : "neutro"}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    />
  );
}
