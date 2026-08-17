import { round2 } from "@/features/faturamento/calculo";
import type { Abastecimento, CompraDiesel } from "@/shared/types";

// Estoque do tanque interno por MÉDIA MÓVEL PONDERADA.
//
// Nada é persistido: saldo e custo médio saem de reprocessar compras e
// abastecimentos-do-tanque em ordem cronológica, como o custo/hora (PRD-013).
// A vantagem é que corrigir uma compra lançada errada corrige o histórico
// inteiro sozinho, sem migração de saldo.
//
// A regra da média ponderada:
//   compra        → médio = (saldo × médio + litros × preço) ÷ (saldo + litros)
//   abastecimento → custo = litros × médio vigente; saldo diminui, médio não muda
//
// Sair pelo médio (e não pelo preço da última compra) é o que faz o Custo da
// Hora refletir o que foi realmente pago: comprar barato e o mercado subir não
// encarece a máquina que queimou o diesel antigo.

export interface EstadoTanque {
  /** Litros em estoque. Pode ficar negativo — ver `inconsistente`. */
  saldoLitros: number;
  /** R$/L médio do que está no tanque; null quando o tanque está vazio. */
  custoMedioLitro: number | null;
  capacidadeLitros: number;
  /** Fração da capacidade ocupada; null se não há capacidade configurada. */
  ocupacao: number | null;
  ultimaCompra: CompraDiesel | null;
  /**
   * true quando saiu mais diesel do que entrou. Não é erro de cálculo: quase
   * sempre significa abastecimento marcado como "tanque" sem a compra
   * correspondente lançada. A tela avisa em vez de esconder.
   */
  inconsistente: boolean;
}

type Evento =
  | { tipo: "compra"; em: string; litros: number; precoLitro: number }
  | { tipo: "saida"; em: string; litros: number };

export function estadoDoTanque(
  compras: CompraDiesel[],
  abastecimentos: Abastecimento[],
  capacidadeLitros: number,
): EstadoTanque {
  const eventos: Evento[] = [
    ...compras.map((c) => ({
      tipo: "compra" as const,
      em: c.comprado_em,
      litros: c.litros,
      precoLitro: c.preco_litro,
    })),
    ...abastecimentos
      .filter((a) => a.origem === "tanque")
      .map((a) => ({ tipo: "saida" as const, em: a.abastecido_em, litros: a.litros })),
  ].sort((a, b) => a.em.localeCompare(b.em));

  let saldo = 0;
  let medio = 0;

  for (const evento of eventos) {
    if (evento.tipo === "compra") {
      const saldoNovo = saldo + evento.litros;
      // Com saldo negativo, misturar a dívida no cálculo distorceria o médio —
      // a compra reinicia o custo a partir do próprio preço.
      medio =
        saldo > 0
          ? (saldo * medio + evento.litros * evento.precoLitro) / saldoNovo
          : evento.precoLitro;
      saldo = saldoNovo;
    } else {
      saldo -= evento.litros;
    }
  }

  const ultimaCompra =
    [...compras].sort((a, b) => b.comprado_em.localeCompare(a.comprado_em))[0] ?? null;

  return {
    saldoLitros: round2(saldo),
    custoMedioLitro: saldo > 0 ? round2(medio) : null,
    capacidadeLitros,
    ocupacao: capacidadeLitros > 0 ? Math.max(0, saldo) / capacidadeLitros : null,
    ultimaCompra,
    inconsistente: saldo < 0,
  };
}

/**
 * Custo médio do tanque no instante de uma data — é o preço que um
 * abastecimento daquele momento deve usar. Reprocessa só o que veio antes.
 */
export function custoMedioEm(
  compras: CompraDiesel[],
  abastecimentos: Abastecimento[],
  em: string,
): number | null {
  return estadoDoTanque(
    compras.filter((c) => c.comprado_em <= em),
    abastecimentos.filter((a) => a.abastecido_em < em),
    0,
  ).custoMedioLitro;
}
