import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";
import { storageAdaptavel } from "@/lib/supabase-storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidas (.env, ver .env.example)",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { storage: storageAdaptavel },
});

// createClient() restaura a sessão persistida de forma assíncrona — stores
// que disparam sua carga inicial no escopo do módulo (import) precisam
// aguardar essa promise antes da primeira query, senão ela sai como anon
// (sem Authorization) e a RLS derruba com "permission denied".
export const sessaoRestaurada = supabase.auth.getSession();
