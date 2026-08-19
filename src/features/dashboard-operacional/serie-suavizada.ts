import { round2 } from "@/features/faturamento/calculo";
import type { PontoSerieDiaria } from "@/features/dashboard-operacional/derivacoes";

/*
 * Suaviza a mini-tendência dos cards, interpolando pontos entre os valores
 * reais — a curva fica fluida em vez de serrilhada, e continua passando
 * exatamente pelos valores medidos.
 *
 * Até a Onda 22 esta função também somava uma ondulação senoidal ("dar mais
 * movimento" ao traçado), o que fazia a linha subir e descer onde o dado não
 * subia nem descia. Um pico visual sem pico real é leitura errada — a curva
 * volta a ser só o dado, mais macia.
 */
export function serieSuavizada(
  pontos: PontoSerieDiaria[],
  pontosPorSegmento = 5,
): PontoSerieDiaria[] {
  if (pontos.length <= 1) return pontos;

  const valores = pontos.map((p) => p.valor);
  const totalSegmentos = pontos.length - 1;
  const totalPontos = totalSegmentos * pontosPorSegmento + 1;
  const resultado: PontoSerieDiaria[] = [];

  for (let i = 0; i < totalPontos; i += 1) {
    const posicao = (i / (totalPontos - 1)) * totalSegmentos;
    const indiceInferior = Math.min(Math.floor(posicao), totalSegmentos - 1);
    const fracao = posicao - indiceInferior;
    const base =
      valores[indiceInferior] + (valores[indiceInferior + 1] - valores[indiceInferior]) * fracao;
    resultado.push({
      data: pontos[indiceInferior].data,
      valor: round2(Math.max(0, base)),
    });
  }

  return resultado;
}
