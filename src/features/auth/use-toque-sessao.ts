import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { lerSessaoOperador } from "@/features/auth/operador-session";
import { rotuloDispositivo, versaoDoApp } from "@/features/auth/dispositivo";

const CHAVE_ULTIMO_TOQUE = "antonello.ultimo_toque_sessao";
const INTERVALO_MIN_MS = 60 * 60 * 1000; // 1 h

/*
 * Avisa ao banco que esta sessão está viva, para que "último acesso" na
 * retaguarda seja o último acesso de verdade — e não a data do login, que
 * ficaria congelada por seis meses de uso diário.
 *
 * Barato de propósito: um UPDATE por abertura de app, no máximo um por hora.
 * O card mostra o dia e a hora; precisão maior que isso só geraria escrita.
 *
 * Falha em silêncio. Em campo o app abre sem sinal o tempo todo; não registrar
 * o toque é irrelevante perto de bloquear a tela do operador com um erro. O
 * dado que importa (o apontamento) tem fila offline própria — este não tem, e
 * não deve ter.
 */
export function useToqueSessao(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;

    const sessao = lerSessaoOperador();
    if (!sessao) return;

    const anterior = Number(window.localStorage.getItem(CHAVE_ULTIMO_TOQUE) ?? 0);
    if (Number.isFinite(anterior) && Date.now() - anterior < INTERVALO_MIN_MS) return;

    void supabase
      .rpc("tocar_sessao_operador", {
        p_token: sessao.token,
        p_dispositivo: rotuloDispositivo() ?? undefined,
        p_app_versao: versaoDoApp(),
      })
      .then(({ error }) => {
        if (!error) window.localStorage.setItem(CHAVE_ULTIMO_TOQUE, String(Date.now()));
      });
  }, [ativo]);
}
