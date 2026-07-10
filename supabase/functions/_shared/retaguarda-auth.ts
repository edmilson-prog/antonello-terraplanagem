import { createClient } from "jsr:@supabase/supabase-js@2";

export async function exigirUsuarioRetaguarda(
  req: Request,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ ok: false, motivo: "sem_autenticacao" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const clientDoUsuario = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await clientDoUsuario.auth.getUser();
  if (userError || !userData.user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ ok: false, motivo: "token_invalido" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const clientServico = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: retaguarda } = await clientServico
    .from("usuarios_retaguarda")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!retaguarda) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ ok: false, motivo: "acesso_negado" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { ok: true };
}
