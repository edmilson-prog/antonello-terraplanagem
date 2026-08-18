import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/*
 * Entrega de notificação por e-mail (Onda 19).
 *
 * Mesmo desenho da enviar-push: acordada por pg_net a partir de
 * processar_entrega_notificacao, recebe só o id e busca o resto. As linhas de
 * `notificacoes_entregas` com canal 'email' já existem como `pendente` quando
 * esta função roda — o trabalho aqui é enviar e fechá-las.
 *
 * Provedor: Resend (https://resend.com). A chave vem de RESEND_API_KEY nos
 * Secrets do projeto, nunca do código. Sem a chave, a função responde 200 e
 * marca a entrega como suprimida — e-mail desligado não é erro de sistema, e
 * devolver erro faria o pg_net reprocessar sem necessidade.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = { "Content-Type": "application/json", ...corsHeaders };

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const REMETENTE =
  Deno.env.get("NOTIFICACOES_EMAIL_REMETENTE") ??
  "Antonello Terraplanagem <nao-responda@antonelloterraplanagem.com.br>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://antonello-terraplanagem.vercel.app";

interface Notificacao {
  id: string;
  tipo: string;
  categoria: string;
  prioridade: string;
  titulo: string;
  mensagem: string;
  os_id: string | null;
}

interface Entrega {
  id: string;
  destino: string | null;
}

function respostaJson(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: jsonHeaders });
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CATEGORIA_LABEL: Record<string, string> = {
  operacao: "Operação",
  frota: "Frota",
  financeiro: "Financeiro",
  comercial: "Comercial",
  sistema: "Sistema",
};

// HTML inline e sem imagem externa: cliente de e-mail bloqueia CSS de <head> e
// imagem remota por padrão, e o aviso precisa ser legível mesmo assim.
function montarHtml(n: Notificacao): string {
  const critico = n.prioridade === "critico";
  const destino = n.os_id ? `${APP_URL}/admin/ordens/${n.os_id}` : `${APP_URL}/admin/notificacoes`;

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:24px;background:#f4efe6;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #d6cdbc;border-radius:12px;overflow:hidden;">
    <tr><td style="height:6px;background:${critico ? "#b00020" : "#ffb300"};"></td></tr>
    <tr><td style="padding:24px;">
      <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8c8678;font-weight:700;">
        ${escapar(CATEGORIA_LABEL[n.categoria] ?? n.categoria)}${critico ? " · Crítico" : ""}
      </div>
      <h1 style="margin:8px 0 10px;font-size:19px;line-height:1.3;color:#1b1912;">${escapar(n.titulo)}</h1>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:#5a554a;">${escapar(n.mensagem)}</p>
      <a href="${destino}" style="display:inline-block;background:#ffb300;color:#16140f;text-decoration:none;font-weight:600;font-size:14px;padding:11px 18px;border-radius:8px;">Abrir na retaguarda</a>
    </td></tr>
    <tr><td style="padding:14px 24px;border-top:1px solid #d6cdbc;font-size:11.5px;color:#8c8678;">
      Aviso automático do sistema da Antonello Terraplanagem. Os canais de cada evento são configurados em Notificações › Preferências.
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST") {
    return respostaJson({ ok: false, motivo: "metodo_nao_suportado" }, 405);
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

  const { data: entregas, error: erroEntregas } = await supabase
    .from("notificacoes_entregas")
    .select("id, destino")
    .eq("notificacao_id", notificacaoId)
    .eq("canal", "email")
    .eq("status", "pendente")
    .returns<Entrega[]>();

  if (erroEntregas) {
    console.error("Falha ao ler entregas:", erroEntregas.message);
    return respostaJson({ ok: false, motivo: "erro_leitura" }, 500);
  }
  if (!entregas || entregas.length === 0) {
    return respostaJson({ ok: true, enviados: 0, motivo: "sem_entregas_pendentes" });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY não configurada — canal de e-mail desligado.");
    await supabase
      .from("notificacoes_entregas")
      .update({ status: "suprimido", motivo: "provedor de e-mail não configurado" })
      .in(
        "id",
        entregas.map((e) => e.id),
      );
    return respostaJson({ ok: false, motivo: "provedor_nao_configurado" });
  }

  const { data: notificacao, error: erroNotificacao } = await supabase
    .from("notificacoes")
    .select("id, tipo, categoria, prioridade, titulo, mensagem, os_id")
    .eq("id", notificacaoId)
    .maybeSingle<Notificacao>();

  if (erroNotificacao || !notificacao) {
    return respostaJson({ ok: false, motivo: "notificacao_inexistente" }, 404);
  }

  const html = montarHtml(notificacao);
  const assunto = (notificacao.prioridade === "critico" ? "[Crítico] " : "") + notificacao.titulo;
  let enviados = 0;

  await Promise.all(
    entregas.map(async (entrega) => {
      if (!entrega.destino) {
        await supabase
          .from("notificacoes_entregas")
          .update({ status: "suprimido", motivo: "sem endereço de destino" })
          .eq("id", entrega.id);
        return;
      }

      try {
        const resposta = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: REMETENTE,
            to: [entrega.destino],
            subject: assunto,
            html,
          }),
        });

        if (!resposta.ok) {
          const corpo = await resposta.text();
          throw new Error(`${resposta.status} ${corpo.slice(0, 120)}`);
        }

        enviados += 1;
        await supabase
          .from("notificacoes_entregas")
          .update({ status: "entregue", entregue_em: new Date().toISOString() })
          .eq("id", entrega.id);
      } catch (erro) {
        console.error(`Falha ao enviar e-mail para ${entrega.destino}:`, (erro as Error).message);
        await supabase
          .from("notificacoes_entregas")
          .update({ status: "falhou", motivo: (erro as Error).message.slice(0, 120) })
          .eq("id", entrega.id);
      }
    }),
  );

  return respostaJson({ ok: true, enviados, total: entregas.length });
});
