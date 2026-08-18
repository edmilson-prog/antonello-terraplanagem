import type {
  CanalNotificacao,
  CategoriaNotificacao,
  Notificacao,
  NotificacaoEntrega,
} from "@/shared/types";
import type { DisparoResumido } from "@/features/notificacoes/retaguarda-store";

// Agregados da central de notificações. Tudo derivado das linhas de
// `notificacoes_entregas` — nenhuma métrica é persistida, mesma regra do
// custo/hora e do saldo do tanque.

function mesmoDia(iso: string, referencia: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === referencia.getFullYear() &&
    d.getMonth() === referencia.getMonth() &&
    d.getDate() === referencia.getDate()
  );
}

export interface ResumoDisparos {
  hoje: number;
  porCanalHoje: Record<CanalNotificacao, number>;
}

export function resumoDisparos(
  doMes: DisparoResumido[],
  entregas7d: NotificacaoEntrega[],
  agora = new Date(),
): ResumoDisparos {
  const porCanalHoje: Record<CanalNotificacao, number> = {
    app: 0,
    push: 0,
    email: 0,
    whatsapp: 0,
  };
  for (const e of entregas7d) {
    // Suprimido não é disparo: o sistema decidiu não mandar.
    if (e.status === "suprimido") continue;
    if (mesmoDia(e.created_at, agora)) porCanalHoje[e.canal] += 1;
  }
  return {
    hoje: doMes.filter((d) => mesmoDia(d.created_at, agora)).length,
    porCanalHoje,
  };
}

export interface ResumoPush {
  enviados: number;
  entregues: number;
  /** 0..1; null quando não houve envio no período. */
  taxaEntrega: number | null;
  abertos: number;
  taxaAbertura: number | null;
  /** Minutos entre a entrega e a abertura; null sem amostra. */
  minutosAteAbrir: number | null;
  aparelhos: number;
  falhas: number;
  /** Série de 7 dias, do mais antigo ao mais recente — alimenta o sparkline. */
  serie: number[];
}

export function resumoPush(entregas7d: NotificacaoEntrega[], agora = new Date()): ResumoPush {
  // Suprimido fica de fora do denominador: não foi tentativa de entrega.
  const push = entregas7d.filter((e) => e.canal === "push" && e.status !== "suprimido");
  const entregues = push.filter((e) => e.status === "entregue");
  const abertos = entregues.filter((e) => e.aberta_em != null);

  const atrasos = abertos
    .filter((e) => e.entregue_em != null)
    .map((e) => new Date(e.aberta_em!).getTime() - new Date(e.entregue_em!).getTime())
    .filter((ms) => ms >= 0);

  const serie: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(agora);
    dia.setDate(dia.getDate() - i);
    serie.push(push.filter((e) => mesmoDia(e.created_at, dia)).length);
  }

  return {
    enviados: push.length,
    entregues: entregues.length,
    taxaEntrega: push.length > 0 ? entregues.length / push.length : null,
    abertos: abertos.length,
    taxaAbertura: entregues.length > 0 ? abertos.length / entregues.length : null,
    minutosAteAbrir:
      atrasos.length > 0
        ? Math.round(atrasos.reduce((s, ms) => s + ms, 0) / atrasos.length / 60000)
        : null,
    // Um aparelho é um endpoint distinto que recebeu algo no período.
    aparelhos: new Set(push.map((e) => e.destino).filter(Boolean)).size,
    falhas: push.filter((e) => e.status === "falhou").length,
    serie,
  };
}

export interface FalhaPorCanal {
  canal: CanalNotificacao;
  total: number;
}

export function falhasPorCanal(entregas7d: NotificacaoEntrega[]): FalhaPorCanal[] {
  const mapa = new Map<CanalNotificacao, number>();
  for (const e of entregas7d) {
    if (e.status !== "falhou") continue;
    mapa.set(e.canal, (mapa.get(e.canal) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([canal, total]) => ({ canal, total }))
    .sort((a, b) => b.total - a.total);
}

export interface TipoMaisDisparado {
  tipo: string;
  total: number;
}

export function maisDisparadas(doMes: DisparoResumido[], limite = 4): TipoMaisDisparado[] {
  const mapa = new Map<string, number>();
  for (const d of doMes) mapa.set(d.tipo, (mapa.get(d.tipo) ?? 0) + 1);
  return [...mapa.entries()]
    .map(([tipo, total]) => ({ tipo, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

// Canais de uma notificação, com o status de cada um. Uma notificação pode ter
// várias entregas no mesmo canal (um push por aparelho); o pior status ganha,
// porque é o que precisa de atenção.
const PESO_STATUS: Record<string, number> = {
  entregue: 0,
  pendente: 1,
  suprimido: 2,
  falhou: 3,
};

export interface CanalDaNotificacao {
  canal: CanalNotificacao;
  status: NotificacaoEntrega["status"];
  motivo: string | null;
}

export function canaisDaNotificacao(
  notificacaoId: string,
  entregas: NotificacaoEntrega[],
): CanalDaNotificacao[] {
  const mapa = new Map<CanalNotificacao, CanalDaNotificacao>();
  for (const e of entregas) {
    if (e.notificacao_id !== notificacaoId) continue;
    const atual = mapa.get(e.canal);
    if (!atual || PESO_STATUS[e.status] > PESO_STATUS[atual.status]) {
      mapa.set(e.canal, { canal: e.canal, status: e.status, motivo: e.motivo });
    }
  }
  return [...mapa.values()];
}

export type FiltroCentral = "todas" | "nao_lidas" | CategoriaNotificacao;

export function filtrarNotificacoes(itens: Notificacao[], filtro: FiltroCentral): Notificacao[] {
  if (filtro === "todas") return itens;
  if (filtro === "nao_lidas") return itens.filter((n) => n.lida_em === null);
  return itens.filter((n) => n.categoria === filtro);
}
