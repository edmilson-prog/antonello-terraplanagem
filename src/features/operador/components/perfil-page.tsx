import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvatarCampo,
  BotaoCampo,
  CartaoCampo,
  TelaCampo,
  classeBotaoCampo,
} from "@/features/operador/components/kit";
import { useAlertasSeguranca } from "@/features/operador/hooks/use-alertas-seguranca";
import { ConfiguracaoPush, limparNotificacoesLocais, useNaoLidas } from "@/features/notificacoes";
import { desativarPush } from "@/features/notificacoes/push";
import { usePendenciasSync } from "@/features/operador/hooks/use-pendencias-sync";
import { useUltimaSincronizacao } from "@/features/operador/ultima-sincronizacao";
import { useTheme } from "@/shared/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { encerrarSessaoOperador, lerSessaoOperador } from "@/features/auth/operador-session";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { CODINOME_SISTEMA, VERSAO_SISTEMA } from "@/features/auth/versao-sistema";
import { formatDataHora, iniciaisDoNome } from "@/shared/lib/format";
import type { ReactNode } from "react";

/*
 * Aba "Perfil" (`tab === 'perfil'` no CampoApp.jsx).
 *
 * O kit mostra CNH, telefone e vínculo do operador; a role anon só enxerga
 * id e nome da tabela `operadores` (política operadores_anon_login_list, por
 * LGPD), então essas linhas ficam de fora até existir uma RPC de "meu perfil"
 * autenticada pelo token da sessão.
 *
 * O toggle de tema vive aqui: o kit não tem um, mas light/dark com persistência
 * é obrigatório pelo CLAUDE.md e este é o único cabeçalho estável do app.
 */

export function PerfilPage() {
  const navigate = useNavigate();
  const sessao = typeof window !== "undefined" ? lerSessaoOperador() : null;
  const naoLidas = useNaoLidas();
  const { pendentes: alertasPendentes } = useAlertasSeguranca();
  const pendentes = usePendenciasSync();
  const ultimaSincronizacao = useUltimaSincronizacao();
  const { theme, toggle } = useTheme();

  const nome = sessao?.operadorNome ?? "Operador";

  async function sair() {
    // Antes de encerrar: tira o push e apaga o cache local. Este aparelho é
    // compartilhado — o próximo operador não pode receber aviso nem ver
    // notificação de quem usou antes (PRD-020).
    await desativarPush();
    limparNotificacoesLocais();

    if (sessao) {
      await supabase.rpc("logout_operador", { p_token: sessao.token });
    }
    encerrarSessaoOperador();
    // Pelo mesmo motivo, esvazia o cache de OS e apontamentos: sem token, as
    // consultas voltam a sair como `anon` e não trazem nada — é o que se quer.
    await Promise.all([ordensStore.retry(), apontamentosStore.retry()]);
    await navigate({ to: "/app/entrar" });
  }

  return (
    <TelaCampo>
      <AreaRolagem className="pt-3.5">
        <CartaoCampo>
          <div className="flex items-center gap-3.5 px-[15px] py-4">
            <AvatarCampo iniciais={iniciaisDoNome(nome)} tamanho={54} raio={15} marca />
            <div className="min-w-0">
              <div className="truncate font-display text-[17px] font-extrabold uppercase leading-[1.1] text-foreground">
                {nome}
              </div>
              <div className="mt-1 text-xs text-foreground-faint">Operador · app de campo</div>
            </div>
          </div>
          <DadoPerfil icone="lucide:smartphone" rotulo="Aparelho">
            <span className="font-mono">
              {ultimaSincronizacao ? formatDataHora(ultimaSincronizacao) : "sem sincronização"}
            </span>
          </DadoPerfil>
          <DadoPerfil icone="lucide:id-card" rotulo="Versão">
            <span className="font-mono">
              v{VERSAO_SISTEMA} · {CODINOME_SISTEMA}
            </span>
          </DadoPerfil>
        </CartaoCampo>

        <div className="mt-3.5 flex flex-col gap-3.5">
          <Link to="/app/notificacoes" className={classeBotaoCampo("ghost")}>
            <Icon icon="lucide:bell" className="h-[17px] w-[17px]" />
            Notificações
            {naoLidas > 0 ? ` · ${naoLidas} ${naoLidas === 1 ? "nova" : "novas"}` : ""}
          </Link>
          <Link to="/app/seguranca" className={classeBotaoCampo("ghost")}>
            <Icon icon="lucide:hard-hat" className="h-[17px] w-[17px]" />
            Alertas de segurança
            {alertasPendentes > 0 ? ` · ${alertasPendentes} pendentes` : ""}
          </Link>
          <Link to="/app/sincronizacao" className={classeBotaoCampo("ghost")}>
            <Icon icon="lucide:refresh-cw" className="h-[17px] w-[17px]" />
            Sincronização
            {pendentes.length > 0 ? " · pendente" : ""}
          </Link>
          <Link to="/app/historico" className={classeBotaoCampo("ghost")}>
            <Icon icon="lucide:history" className="h-[17px] w-[17px]" />
            Histórico de apontamentos
          </Link>
          <Link to="/app/escala" className={classeBotaoCampo("ghost")}>
            <Icon icon="lucide:calendar" className="h-[17px] w-[17px]" />
            Minha escala
          </Link>
          <Link to="/app/espelho-horas" className={classeBotaoCampo("ghost")}>
            <Icon icon="lucide:calendar-clock" className="h-[17px] w-[17px]" />
            Espelho de horas
          </Link>
          <ConfiguracaoPush />
          <BotaoCampo variante="ghost" onClick={toggle}>
            <Icon
              icon={theme === "dark" ? "lucide:sun" : "lucide:moon"}
              className="h-[17px] w-[17px]"
            />
            {theme === "dark" ? "Tema claro" : "Tema escuro"}
          </BotaoCampo>
          <BotaoCampo variante="ghost" onClick={sair}>
            <Icon icon="lucide:log-out" className="h-[17px] w-[17px]" />
            Sair
          </BotaoCampo>
        </div>
      </AreaRolagem>
    </TelaCampo>
  );
}

function DadoPerfil({
  icone,
  rotulo,
  children,
}: {
  icone: string;
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-[11px] border-t border-border-soft px-3.5 py-3 text-[13px]">
      <Icon icon={icone} className="h-4 w-4 shrink-0 text-foreground-faint" />
      <span className="w-[86px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-faint">
        {rotulo}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium text-foreground">{children}</span>
    </div>
  );
}
