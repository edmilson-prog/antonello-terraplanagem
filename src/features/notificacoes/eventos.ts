import { supabase } from "@/lib/supabase";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import { formatHorimetro } from "@/shared/lib/format";

/*
 * Produção de notificações a partir de ações do app (PRD-020).
 *
 * "Nova OS atribuída" não está aqui: ordens_servico já é tabela real, então
 * quem produz aquele evento é um trigger no Postgres. Os daqui são os que
 * nascem de fluxos ainda respaldados por src/mocks/ — quando a onda mock→real
 * de cada um chegar, a chamada correspondente vira trigger e some deste
 * arquivo, sem mexer no resto da feature.
 *
 * Regra que atravessa o módulo: notificar é efeito colateral. Se falhar, a
 * ação de origem (registrar abastecimento, agendar manutenção) continua
 * valendo — nunca propagamos o erro.
 */

const litrosFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

async function tentar(rotulo: string, executar: () => Promise<{ error: unknown }>) {
  try {
    const { error } = await executar();
    if (error) console.warn(`Notificação (${rotulo}) não registrada:`, error);
  } catch (erro) {
    console.warn(`Notificação (${rotulo}) não registrada:`, erro);
  }
}

/* ---------------- eventos do lado do operador ---------------- */

/**
 * Comprovante do que o operador acabou de fazer em campo. Vai pela RPC
 * `registrar_notificacao_propria`, que deriva o destinatário do token — o app
 * de campo não pode escolher para quem notifica.
 */
export async function notificarAbastecimentoRegistrado(input: {
  abastecimentoId: string;
  litros: number;
  equipamentoNome: string;
  local: string | null;
}): Promise<void> {
  const sessao = lerSessaoOperador();
  if (!sessao) return;

  const mensagem = [
    `${litrosFormatter.format(input.litros)} L`,
    input.equipamentoNome,
    input.local?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");

  await tentar("abastecimento_registrado", () =>
    supabase.rpc("registrar_notificacao_propria", {
      p_token: sessao.token,
      p_tipo: "abastecimento_registrado",
      p_titulo: "Abastecimento registrado",
      p_mensagem: mensagem,
      p_os_id: undefined,
      p_origem_id: input.abastecimentoId,
    }),
  );
}

/* ---------------- eventos do lado da retaguarda ---------------- */

/**
 * A retaguarda fechou a OS — é o momento em que as horas lançadas em campo
 * ficam confirmadas, e é a única aprovação que existe hoje no sistema (não há
 * tela de aprovar apontamento avulso).
 *
 * Um aviso por operador com o total dele na OS, não um por apontamento: quem
 * lançou cinco vezes na mesma obra não merece cinco notificações. Por isso a
 * origem de dedup é a OS, e não o apontamento.
 */
export async function notificarHorasConfirmadas(input: {
  osId: string;
  osNumero: string;
  /** Apontamentos da OS; agrupados por operador aqui dentro. */
  apontamentos: { operador_id: string; horas_trabalhadas: number | null }[];
}): Promise<void> {
  const horasPorOperador = new Map<string, number>();
  for (const a of input.apontamentos) {
    if (!a.horas_trabalhadas) continue;
    horasPorOperador.set(
      a.operador_id,
      (horasPorOperador.get(a.operador_id) ?? 0) + a.horas_trabalhadas,
    );
  }

  await Promise.all(
    Array.from(horasPorOperador, ([operadorId, horas]) =>
      tentar("apontamento_aprovado", () =>
        supabase.rpc("criar_notificacao", {
          p_operador_id: operadorId,
          p_tipo: "apontamento_aprovado",
          p_titulo: "Apontamento aprovado",
          p_mensagem: `${input.osNumero} · ${formatHorimetro(horas)} confirmadas pela retaguarda`,
          p_os_id: input.osId,
          p_origem_id: input.osId,
        }),
      ),
    ),
  );
}

/**
 * A retaguarda pediu que o operador revise algo que ele lançou.
 *
 * ⚠️ Sem chamador hoje: não existe na retaguarda nenhuma ação de "pedir
 * correção" — construí-la era escopo explicitamente deixado de fora do
 * PRD-020. A função fica pronta para quando essa tela existir; o tipo já é
 * aceito pelo banco e já tem tratamento visual na lista.
 *
 * Sem `p_origem_id`: pedir correção duas vezes no mesmo apontamento é
 * legítimo, e o segundo pedido precisa aparecer.
 */
export async function notificarCorrecaoSolicitada(input: {
  operadorId: string;
  osId: string | null;
  osNumero: string | null;
  detalhe: string;
}): Promise<void> {
  const mensagem = [input.osNumero, input.detalhe].filter(Boolean).join(" · ");

  await tentar("correcao_solicitada", () =>
    supabase.rpc("criar_notificacao", {
      p_operador_id: input.operadorId,
      p_tipo: "correcao_solicitada",
      p_titulo: "Correção solicitada",
      p_mensagem: mensagem,
      p_os_id: input.osId ?? undefined,
      p_origem_id: undefined,
    }),
  );
}

/**
 * Manutenção prevista para um equipamento. Avisa todos os operadores
 * habilitados naquele equipamento (operadores_equipamentos) — quem for levá-lo
 * à base precisa saber, e o vínculo é justamente a lista de quem o opera.
 */
export async function notificarManutencaoAgendada(input: {
  registroId: string;
  equipamentoId: string;
  equipamentoNome: string;
  descricaoPlano: string;
  horimetroPrevisto: number;
}): Promise<void> {
  const { data: vinculos, error } = await supabase
    .from("operadores_equipamentos")
    .select("operador_id")
    .eq("equipamento_id", input.equipamentoId);

  if (error || !vinculos || vinculos.length === 0) return;

  const mensagem = `${input.equipamentoNome} · ${input.descricaoPlano} em ${formatHorimetro(
    input.horimetroPrevisto,
  )}`;

  await Promise.all(
    vinculos.map((v) =>
      tentar("manutencao_agendada", () =>
        supabase.rpc("criar_notificacao", {
          p_operador_id: v.operador_id,
          p_tipo: "manutencao_agendada",
          p_titulo: "Manutenção agendada",
          p_mensagem: mensagem,
          p_os_id: undefined,
          // Dedup é por (operador, tipo, origem) — ver a migration
          // 20260809120004 —, então o mesmo registro pode avisar vários
          // operadores sem que um bloqueie o outro.
          p_origem_id: input.registroId,
        }),
      ),
    ),
  );
}
