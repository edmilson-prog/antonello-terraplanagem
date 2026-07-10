import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { exigirUsuarioRetaguarda } from "../_shared/retaguarda-auth.ts";
import { wahaFetch, WAHA_SESSION } from "../_shared/waha-client.ts";

Deno.serve(async (req: Request) => {
  const jsonHeaders = { "Content-Type": "application/json" };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, motivo: "metodo_nao_suportado" }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  const auth = await exigirUsuarioRetaguarda(req);
  if (!auth.ok) return auth.response;

  const { chatId, text } = (await req.json()) as { chatId?: string; text?: string };
  if (!chatId || !text) {
    return new Response(JSON.stringify({ ok: false, motivo: "parametros_invalidos" }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const resp = await wahaFetch("/api/sendText", {
    method: "POST",
    body: JSON.stringify({ session: WAHA_SESSION, chatId, text }),
  });

  if (resp.ok) {
    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
  }

  if (resp.status === 400 || resp.status === 422) {
    const corpo = await resp.text();
    if (/not connected|session/i.test(corpo)) {
      return new Response(JSON.stringify({ ok: false, motivo: "sessao_desconectada" }), {
        headers: jsonHeaders,
      });
    }
  }

  return new Response(JSON.stringify({ ok: false, motivo: "falha_envio" }), { headers: jsonHeaders });
});
