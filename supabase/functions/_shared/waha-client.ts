const WAHA_BASE_URL = Deno.env.get("WAHA_BASE_URL")!;
const WAHA_API_KEY = Deno.env.get("WAHA_API_KEY")!;

export const WAHA_SESSION = Deno.env.get("WAHA_SESSION") ?? "default";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export async function wahaFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${WAHA_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
      ...(init.headers ?? {}),
    },
  });
}
