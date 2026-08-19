import { LOCAL_PADRAO } from "@/features/dashboard-operacional/clima";
import type { Apontamento, Equipamento, OrdemServico } from "@/shared/types";

/*
 * Onde cada máquina está agora — para o mapa do painel operacional.
 *
 * Substitui `mock-posicoes-equipamentos.ts`, oito coordenadas fixas chaveadas
 * pelos ids mock "eq-001". Desde que os equipamentos foram para o Supabase a
 * junção era UUID contra "eq-001": o mapa não desenhava um pin sequer, e ficava
 * centrado num ponto do Paraná — a 400 km da base, em Santo Ângelo/RS.
 *
 * A posição real de um equipamento é a obra em que ele está trabalhando, e
 * isso o sistema sabe: apontamento em andamento -> OS -> canteiro. Sem
 * rastrear ninguém: a coordenada é do canteiro, informada uma vez no cadastro
 * da OS (RF-003 do PRD-019; nada é lido do celular do operador).
 *
 * Máquina parada, ou trabalhando numa OS sem coordenada, não aparece. O card
 * diz quantas ficaram de fora, em vez de fingir que a frota inteira está no
 * mapa.
 */

export interface PinEquipamento {
  equipamento: Equipamento;
  lat: number;
  lng: number;
  osNumero: string;
  obraNome: string;
}

export interface PosicoesDaFrota {
  pins: PinEquipamento[];
  /** Em operação, mas na obra sem coordenada informada. */
  semLocalizacao: number;
  /** Centro do mapa: média dos pins, ou a base da empresa quando não há pin. */
  centro: { lat: number; lng: number };
}

export function posicoesDaFrota(
  equipamentos: Equipamento[],
  apontamentos: Apontamento[],
  ordens: OrdemServico[],
): PosicoesDaFrota {
  const porId = new Map(equipamentos.map((e) => [e.id, e]));
  const osPorId = new Map(ordens.map((o) => [o.id, o]));

  const pins: PinEquipamento[] = [];
  const jaPlotados = new Set<string>();
  let semLocalizacao = 0;

  for (const ap of apontamentos) {
    if (ap.status !== "em_andamento") continue;

    const equipamento = porId.get(ap.equipamento_id);
    // Um equipamento com dois apontamentos abertos (colaborativa) vira um pin
    // só: dois marcadores na mesma máquina leriam como duas máquinas.
    if (!equipamento || jaPlotados.has(equipamento.id)) continue;

    const os = ap.os_id ? osPorId.get(ap.os_id) : undefined;
    if (!os || os.local_lat === null || os.local_lng === null) {
      semLocalizacao += 1;
      jaPlotados.add(equipamento.id);
      continue;
    }

    jaPlotados.add(equipamento.id);
    pins.push({
      equipamento,
      lat: os.local_lat,
      lng: os.local_lng,
      osNumero: os.numero,
      obraNome: os.obra_nome,
    });
  }

  const centro =
    pins.length > 0
      ? {
          lat: pins.reduce((s, p) => s + p.lat, 0) / pins.length,
          lng: pins.reduce((s, p) => s + p.lng, 0) / pins.length,
        }
      : { lat: LOCAL_PADRAO.lat, lng: LOCAL_PADRAO.lng };

  return { pins, semLocalizacao, centro };
}
