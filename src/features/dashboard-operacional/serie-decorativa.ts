import { round2 } from "@/features/faturamento/calculo";
import type { PontoSerieDiaria } from "@/features/dashboard-operacional/derivacoes";

// Série SOMENTE decorativa — interpola os pontos reais e soma uma ondulação
// determinística, para dar mais "movimento" às mini-tendências dos cards
// (pedido explícito do usuário: a forma da curva pode não refletir os valores
// reais do período). Os números grandes dos cards (KPI, R$, badge de
// variação) continuam 100% reais — só a linha/barra decorativa é embelezada.
// Determinístico (sem Math.random) para não "tremer" a cada re-render.
// NUNCA usar este resultado para decisão de negócio, cálculo ou tooltip com
// valor exato — apenas para o traçado visual do gráfico.
export function serieDecorativa(
  pontos: PontoSerieDiaria[],
  pontosPorSegmento = 5,
): PontoSerieDiaria[] {
  if (pontos.length <= 1) return pontos;

  const valores = pontos.map((p) => p.valor);
  const maximo = Math.max(...valores, 1);
  const totalSegmentos = pontos.length - 1;
  const totalPontos = totalSegmentos * pontosPorSegmento + 1;
  const resultado: PontoSerieDiaria[] = [];

  for (let i = 0; i < totalPontos; i += 1) {
    const posicao = (i / (totalPontos - 1)) * totalSegmentos;
    const indiceInferior = Math.min(Math.floor(posicao), totalSegmentos - 1);
    const fracao = posicao - indiceInferior;
    const base =
      valores[indiceInferior] + (valores[indiceInferior + 1] - valores[indiceInferior]) * fracao;
    const ondulacao = (Math.sin(i * 1.35) * 0.14 + Math.sin(i * 0.55 + 1) * 0.09) * maximo;
    resultado.push({
      data: pontos[indiceInferior].data,
      valor: round2(Math.max(0, base + ondulacao)),
    });
  }

  return resultado;
}
