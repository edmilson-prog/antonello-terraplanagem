import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { exigirUsuarioRetaguarda } from "../_shared/retaguarda-auth.ts";
import { corsHeaders, wahaFetch, WAHA_SESSION } from "../_shared/waha-client.ts";

interface StatusWaha {
  status?: string;
  me?: { id?: string };
}

async function buscarStatusSessao(): Promise<StatusWaha> {
  const resp = await wahaFetch(`/api/sessions/${WAHA_SESSION}`);
  if (!resp.ok) return { status: "STOPPED" };
  try {
    return (await resp.json()) as StatusWaha;
  } catch {
    return { status: "STOPPED" };
  }
}

async function iniciarSessao(): Promise<boolean> {
  const criar = await wahaFetch("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ name: WAHA_SESSION, start: true }),
  });
  if (criar.ok) return true;
  const start = await wahaFetch(`/api/sessions/${WAHA_SESSION}/start`, { method: "POST" });
  return start.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await exigirUsuarioRetaguarda(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const jsonHeaders = { "Content-Type": "application/json", ...corsHeaders };

  if (req.method === "GET" && url.searchParams.get("qr") === "1") {
    const statusBody = await buscarStatusSessao();
    if (statusBody.status === "WORKING") {
      return new Response(JSON.stringify({ ok: false, motivo: "sessao_ja_conectada" }), {
        status: 409,
        headers: jsonHeaders,
      });
    }
    const qrResp = await wahaFetch(`/api/${WAHA_SESSION}/auth/qr?format=base64`);
    if (!qrResp.ok) {
      return new Response(JSON.stringify({ ok: false, motivo: "falha_ao_obter_qr" }), {
        status: 502,
        headers: jsonHeaders,
      });
    }
    let qrBody: { value?: string };
    try {
      qrBody = (await qrResp.json()) as { value?: string };
    } catch {
      return new Response(JSON.stringify({ ok: false, motivo: "falha_ao_obter_qr" }), {
        status: 502,
        headers: jsonHeaders,
      });
    }
    return new Response(JSON.stringify({ qr: `data:image/png;base64,${qrBody.value ?? ""}` }), {
      headers: jsonHeaders,
    });
  }

  if (req.method === "GET") {
    const body = await buscarStatusSessao();
    const status = body.status ?? "STOPPED";
    const numero = status === "WORKING" ? (body.me?.id ?? "").replace("@c.us", "") : null;
    return new Response(JSON.stringify({ status, numero }), { headers: jsonHeaders });
  }

  if (req.method === "POST") {
    let action: string | undefined;
    try {
      ({ action } = (await req.json()) as { action?: string });
    } catch {
      return new Response(JSON.stringify({ ok: false, motivo: "corpo_invalido" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    if (action === "start") {
      const sucesso = await iniciarSessao();
      if (!sucesso) {
        return new Response(JSON.stringify({ ok: false, motivo: "falha_ao_iniciar_sessao" }), {
          headers: jsonHeaders,
        });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }
    if (action === "logout") {
      const resp = await wahaFetch(`/api/sessions/${WAHA_SESSION}/logout`, { method: "POST" });
      if (!resp.ok) {
        return new Response(JSON.stringify({ ok: false, motivo: "falha_ao_desconectar" }), {
          headers: jsonHeaders,
        });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
    }
    return new Response(JSON.stringify({ ok: false, motivo: "acao_invalida" }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: false, motivo: "metodo_nao_suportado" }), {
    status: 405,
    headers: jsonHeaders,
  });
});
