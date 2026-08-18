import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { assinarCredencial, credencialAtual } from "@/lib/credencial";
import { getOperadorLogadoId, lerSessaoOperador } from "@/features/auth/operador-session";
import type { Json } from "@/shared/types/database";
import type { NovoRegistroCampo, RegistroCampo } from "./tipos";

/*
 * Fila offline dos registros de campo — agora com para onde esvaziar (Onda 22).
 *
 * Até aqui esta store era só localStorage: o operador preenchia o checklist, o
 * diário de obra ou a medição assinada, o app dizia "salvo no aparelho", e era
 * literalmente só isso. Nada chegava ao escritório, e limpar os dados do
 * navegador apagava inclusive a assinatura do cliente.
 *
 * O DESENHO CONTINUA OFFLINE-FIRST, e isso é requisito, não dívida (ADR-001).
 * `registrar` permanece SÍNCRONO de propósito: no canteiro sem sinal, a tela
 * precisa confirmar na hora. Gravar local é a operação que não pode falhar; o
 * envio é consequência, e acontece depois.
 *
 *   registrar() → grava local (pendente) → notifica a tela → dispara o flush
 *   flush()     → RPC idempotente por op_id → marca confirmado
 *   carregar()  → traz o que a central tem e mescla com a fila
 *
 * O flush pode ser burro e reenviar à vontade: `registrar_registro_campo`
 * deduplica por `op_id` e devolve a linha existente. O erro que importa evitar
 * é o contrário — dar um registro por enviado quando não foi.
 */

const CHAVE = "antonello.registros_campo";
const LIMITE = 500; // trava de segurança: localStorage não é banco.

const ouvintes = new Set<() => void>();
let cache: RegistroCampo[] | null = null;

interface Estado {
  isLoading: boolean;
  error: Error | null;
  /** Quantos registros ainda não foram confirmados pela central. */
  pendentes: number;
  sincronizando: boolean;
}

let estado: Estado = { isLoading: true, error: null, pendentes: 0, sincronizando: false };

function ler(): RegistroCampo[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  const bruto = window.localStorage.getItem(CHAVE);
  if (!bruto) {
    cache = [];
    return cache;
  }
  try {
    const lido: unknown = JSON.parse(bruto);
    cache = Array.isArray(lido) ? (lido as RegistroCampo[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(itens: RegistroCampo[]) {
  cache = itens.slice(0, LIMITE);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHAVE, JSON.stringify(cache));
  }
  estado = { ...estado, pendentes: cache.filter((r) => r.pendente_sync).length };
  notificar();
}

const notificar = () => ouvintes.forEach((fn) => fn());

function inscrever(fn: () => void) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

const VAZIO: RegistroCampo[] = [];

/*
 * Linha como a RPC de listagem devolve: `assinatura` não vem, de propósito
 * (LGPD, minimização — ver o comentário na migration).
 */
interface LinhaRegistroCampo {
  id: string;
  op_id: string;
  tipo: RegistroCampo["tipo"];
  operador_id: string;
  os_id: string | null;
  equipamento_id: string | null;
  dados: Record<string, unknown>;
  registrado_em: string;
}

/*
 * O par (`tipo`, `dados`) é uma união discriminada no TypeScript e duas
 * colunas soltas no banco — o CHECK `registros_campo_dados_check` é quem
 * garante, do lado de lá, que `dados` traz as chaves que o `tipo` exige. O
 * cast é a fronteira entre as duas formas de dizer a mesma regra.
 */
function daLinha(linha: LinhaRegistroCampo): RegistroCampo {
  return {
    id: linha.id,
    op_id: linha.op_id,
    tipo: linha.tipo,
    dados: linha.dados,
    operador_id: linha.operador_id,
    os_id: linha.os_id,
    equipamento_id: linha.equipamento_id,
    registrado_em: linha.registrado_em,
    pendente_sync: false,
  } as unknown as RegistroCampo;
}

/* Mesma fronteira, no sentido inverso: sai da união e vira jsonb. */
function comoObjeto(dados: RegistroCampo["dados"]): Record<string, unknown> {
  return { ...dados } as unknown as Record<string, unknown>;
}

/*
 * Grava no aparelho e devolve na hora. Nunca espera a rede: é isso que permite
 * ao operador fechar o checklist no fundo da obra sem sinal.
 */
function registrar(novo: NovoRegistroCampo): RegistroCampo {
  const agora = new Date().toISOString();
  const registro = {
    ...novo,
    id: crypto.randomUUID(),
    op_id: crypto.randomUUID(),
    operador_id: getOperadorLogadoId(),
    os_id: novo.os_id ?? null,
    equipamento_id: novo.equipamento_id ?? null,
    registrado_em: agora,
    pendente_sync: true,
  } as RegistroCampo;

  gravar([registro, ...ler()]);
  void flush();
  return registro;
}

let flushEmAndamento: Promise<void> | null = null;

/*
 * Envia os pendentes, um a um.
 *
 * Um a um, e não em lote, porque um registro rejeitado (um CHECK que não bate)
 * não pode derrubar os outros oito da fila junto. Cada falha mantém o seu
 * `pendente_sync: true` e a próxima tentativa reenvia — o `op_id` garante que
 * repetir não duplica.
 */
async function flush(): Promise<void> {
  if (flushEmAndamento) return flushEmAndamento;

  const sessao = lerSessaoOperador();
  if (!sessao) return;
  const pendentes = ler().filter((r) => r.pendente_sync);
  if (pendentes.length === 0) return;

  estado = { ...estado, sincronizando: true };
  notificar();

  flushEmAndamento = (async () => {
    const confirmados = new Set<string>();

    for (const registro of pendentes) {
      // A assinatura viaja fora do jsonb: é coluna própria no banco.
      const dados = comoObjeto(registro.dados);
      const assinatura = typeof dados.assinatura === "string" ? dados.assinatura : undefined;
      delete dados.assinatura;

      const { error } = await supabase.rpc("registrar_registro_campo", {
        p_token: sessao.token,
        p_id: registro.id,
        p_op_id: registro.op_id,
        p_tipo: registro.tipo,
        p_dados: dados as Json,
        p_registrado_em: registro.registrado_em,
        p_os_id: registro.os_id ?? undefined,
        p_equipamento_id: registro.equipamento_id ?? undefined,
        p_assinatura: assinatura,
      });

      // Sem retry aqui: falhou, continua pendente e a próxima rodada tenta de
      // novo. O aparelho não perde nada.
      if (!error) confirmados.add(registro.op_id);
    }

    if (confirmados.size > 0) {
      gravar(
        ler().map((r) => {
          if (!confirmados.has(r.op_id)) return r;
          // Confirmado o recebimento, a assinatura do cliente sai do aparelho:
          // ela é dado pessoal e já está guardada na central.
          const dados = comoObjeto(r.dados);
          if ("assinatura" in dados) dados.assinatura = null;
          return { ...r, dados, pendente_sync: false } as unknown as RegistroCampo;
        }),
      );
    }

    estado = { ...estado, sincronizando: false };
    notificar();
  })();

  try {
    await flushEmAndamento;
  } finally {
    flushEmAndamento = null;
  }
}

/*
 * Traz o que a central tem e mescla com a fila local.
 *
 * O servidor manda no que já subiu; a fila manda no que ainda não. Um registro
 * local pendente NUNCA é sobrescrito por essa mescla — só desaparece da coluna
 * de pendentes quando o flush confirma que ele chegou.
 */
async function carregar() {
  if (credencialAtual() !== "operador") {
    estado = { ...estado, isLoading: false, error: null };
    notificar();
    return;
  }

  const sessao = lerSessaoOperador();
  if (!sessao) return;

  estado = { ...estado, isLoading: true, error: null };
  notificar();

  const { data, error } = await supabase
    .rpc("listar_registros_campo_operador", { p_token: sessao.token })
    .returns<LinhaRegistroCampo[]>();

  if (error) {
    // Sem sinal é o estado normal em campo, não um erro de tela: a lista local
    // continua servindo e o flush tenta de novo depois.
    estado = { ...estado, isLoading: false, error: new Error(error.message) };
    notificar();
    return;
  }

  const local = ler();
  const pendentes = local.filter((r) => r.pendente_sync);
  const doServidor = (data ?? []).map(daLinha);
  const jaNoServidor = new Set(doServidor.map((r) => r.op_id));

  const mesclado = [
    ...pendentes.filter((r) => !jaNoServidor.has(r.op_id)),
    ...doServidor,
  ].sort((a, b) => b.registrado_em.localeCompare(a.registrado_em));

  gravar(mesclado);
  estado = { ...estado, isLoading: false, error: null };
  notificar();

  void flush();
}

assinarCredencial(() => {
  void carregar();
});

/*
 * Reconectar é o gatilho clássico do ADR-001: o operador sai da obra, pega
 * sinal na estrada, e a fila sobe sozinha sem ele abrir nada.
 */
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void flush();
  });
}

function listar(): RegistroCampo[] {
  return ler();
}

const getEstado = () => estado;

function useTodos(): RegistroCampo[] {
  return useSyncExternalStore(
    inscrever,
    () => ler(),
    () => VAZIO,
  );
}

function useEstado(): Estado {
  return useSyncExternalStore(inscrever, getEstado, getEstado);
}

/* Só para os testes: zera a fila local sem tocar no que já subiu. */
function limparFilaLocal() {
  gravar([]);
}

export const registrosCampoStore = {
  registrar,
  listar,
  useTodos,
  useEstado,
  flush,
  retry: carregar,
  limparFilaLocal,
};
