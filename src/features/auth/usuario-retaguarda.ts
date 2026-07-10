import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Perfil } from "@/shared/types";

export interface UsuarioRetaguarda {
  id: string;
  nome: string;
  perfil: Perfil;
}

export function useUsuarioRetaguarda(): UsuarioRetaguarda | null {
  const [usuario, setUsuario] = useState<UsuarioRetaguarda | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar(userId: string | undefined) {
      if (!userId) {
        if (ativo) setUsuario(null);
        return;
      }
      const { data } = await supabase
        .from("usuarios_retaguarda")
        .select("id, nome, perfil")
        .eq("id", userId)
        .maybeSingle();
      if (ativo) setUsuario((data as UsuarioRetaguarda | null) ?? null);
    }

    supabase.auth.getSession().then(({ data }) => carregar(data.session?.user.id));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      carregar(session?.user.id);
    });

    return () => {
      ativo = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return usuario;
}
