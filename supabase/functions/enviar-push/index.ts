import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

/*
 * Entrega do Web Push (PRD-020).
 *
 * Acordada pelo trigger trg_notificacoes_enviar_push, que faz um POST
 * assíncrono via pg_net a cada linha nova em public.notificacoes. Recebe só o
 * id e busca o resto — assim o payload que trafega no Postgres é mínimo.
 *
 * A notificação in-app já está gravada quando esta função roda. Aqui é só a
 * camada de entrega: se falhar, o operador ainda vê o aviso ao abrir o app.
 *
 * Desde a Onda 19, cada aparelho tem sua linha em `notificacoes_entregas`
 * (criada como `pendente` por processar_entrega_notificacao). É esta função
 * quem fecha a linha como `entregue` ou `falhou` — sem isso os KPIs de entrega
 * da central da retaguarda não teriam de onde sair.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = { "Content-Type": "application/json", ...corsHeaders };

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT =
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:contato@antonelloterraplanagem.com.br";

interface Notificacao {
  id: string;
  operador_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  os_id: string | null;
}

interface Subscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Um push morto responde 404 (endpoint nunca existiu) ou 410 (o navegador
// revogou). Qualquer outro código é falha transitória — a inscrição fica.
const CODIGOS_INSCRICAO_MORTA = new Set([404, 410]);

function respostaJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: jsonHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return respostaJson({ ok: false, motivo: "metodo_nao_suportado" }, 405);
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    // Sem chaves não há o que assinar. Devolve 200 de propósito: o trigger não
    // deve enxergar isso como erro recuperável e ficar reprocessando.
    console.error("VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY não configuradas — push desligado.");
    return respostaJson({ ok: false, motivo: "vapid_nao_configurado" });
  }

  let notificacaoId: string | undefined;
  try {
    ({ notificacao_id: notificacaoId } = (await req.json()) as { notificacao_id?: string });
  } catch {
    return respostaJson({ ok: false, motivo: "corpo_invalido" }, 400);
  }

  if (!notificacaoId) {
    return respostaJson({ ok: false, motivo: "parametros_invalidos" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: notificacao, error: erroNotificacao } = await supabase
    .from("notificacoes")
    .select("id, operador_id, tipo, titulo, mensagem, os_id")
    .eq("id", notificacaoId)
    .maybeSingle<Notificacao>();

  if (erroNotificacao) {
    console.error("Falha ao ler notificação:", erroNotificacao.message);
    return respostaJson({ ok: false, motivo: "erro_leitura" }, 500);
  }
  if (!notificacao) {
    return respostaJson({ ok: false, motivo: "notificacao_inexistente" }, 404);
  }

  const { data: inscricoes, error: erroInscricoes } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("operador_id", notificacao.operador_id)
    .returns<Subscription[]>();

  if (erroInscricoes) {
    console.error("Falha ao ler inscrições:", erroInscricoes.message);
    return respostaJson({ ok: false, motivo: "erro_leitura" }, 500);
  }

  if (!inscricoes || inscricoes.length === 0) {
    return respostaJson({ ok: true, enviados: 0, motivo: "sem_inscricoes" });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  // O service worker usa `url` para saber onde levar o operador ao tocar.
  const payload = JSON.stringify({
    id: notificacao.id,
    tipo: notificacao.tipo,
    titulo: notificacao.titulo,
    mensagem: notificacao.mensagem,
    url: notificacao.os_id ? `/app/ordens/${notificacao.os_id}` : "/app/notificacoes",
  });

  const endpointsMortos: string[] = [];
  let enviados = 0;

  // Fecha a linha de entrega daquele aparelho. Nunca lança: um erro de
  // bookkeeping não pode derrubar o envio que já aconteceu.
  const registrarEntrega = async (
    endpoint: string,
    status: "entregue" | "falhou",
    motivo?: string,
  ) => {
    const { error } = await supabase
      .from("notificacoes_entregas")
      .update({
        status,
        motivo: motivo ?? null,
        entregue_em: status === "entregue" ? new Date().toISOString() : null,
      })
      .eq("notificacao_id", notificacao.id)
      .eq("canal", "push")
      .eq("destino", endpoint);
    if (error) console.error("Falha ao registrar entrega:", error.message);
  };

  await Promise.all(
    inscricoes.map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
          },
          payload,
          { TTL: 60 * 60 * 12 },
        );
        enviados += 1;
        await registrarEntrega(inscricao.endpoint, "entregue");
      } catch (erro) {
        const status = (erro as { statusCode?: number }).statusCode;
        if (status && CODIGOS_INSCRICAO_MORTA.has(status)) {
          endpointsMortos.push(inscricao.endpoint);
          await registrarEntrega(inscricao.endpoint, "falhou", "token expirado");
        } else {
          console.error(
            `Falha ao enviar push para ${inscricao.endpoint.slice(0, 60)}…:`,
            (erro as Error).message,
          );
          await registrarEntrega(
            inscricao.endpoint,
            "falhou",
            (erro as Error).message.slice(0, 120),
          );
        }
      }
    }),
  );

  if (endpointsMortos.length > 0) {
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", endpointsMortos);
    if (error) console.error("Falha ao limpar inscrições mortas:", error.message);
  }

  return respostaJson({
    ok: true,
    enviados,
    removidos: endpointsMortos.length,
    total: inscricoes.length,
  });
});
