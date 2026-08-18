import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  AvisoCampo,
  BOTAO_VOLTAR,
  BotaoCampo,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  LINHA_CAMPO,
  LinhaCorpo,
  LinhaMeta,
  LinhaTitulo,
  SecaoCampo,
  SyncMini,
  TagCabecalho,
  TelaCampo,
  TileCampo,
  TilesCampo,
} from "@/features/operador/components/kit";
import { usePendenciasSync } from "@/features/operador/hooks/use-pendencias-sync";
import {
  registrarSincronizacao,
  useUltimaSincronizacao,
} from "@/features/operador/ultima-sincronizacao";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { clientesStore } from "@/features/clientes/clientes-store";
import { registrosCampoStore } from "@/features/registros-campo/registros-campo-store";
import { formatDataHora, formatHoraCurta } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

/*
 * Sincronização / modo offline (`screen === 'sync'` no CampoApp.jsx).
 *
 * Até a Onda 22 esta tela listava pendências que nunca saíam dali: não havia
 * para onde enviar os registros de campo, e "Sincronizar agora" só recarregava
 * as bases de leitura. Agora o botão também esvazia a fila — `flush()` manda
 * os pendentes pela RPC idempotente e só marca como enviado o que a central
 * confirmou. O que falhar continua na lista, que é o comportamento honesto.
 */

export function SincronizacaoPage() {
  const pendentes = usePendenciasSync();
  const ultima = useUltimaSincronizacao();
  const [sincronizando, setSincronizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const emDia = pendentes.length === 0;

  async function sincronizar() {
    setSincronizando(true);
    setErro(null);
    try {
      // A fila primeiro: o que foi feito em campo sobe antes de rebaixar as
      // bases de leitura, para o operador não ver a lista recarregar sem que
      // o registro dele tenha ido junto.
      await registrosCampoStore.flush();
      await Promise.all([ordensStore.retry(), equipamentosStore.retry(), clientesStore.retry()]);
      registrarSincronizacao();
    } catch {
      setErro("Não foi possível falar com a central agora. Seus registros seguem salvos aqui.");
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Sincronização"
        tag={
          <TagCabecalho tom={emDia ? "success" : "amber"}>
            {emDia ? "em dia" : `${pendentes.length} pendentes`}
          </TagCabecalho>
        }
      />
      <AreaRolagem>
        <div
          className={cn(
            "flex items-center gap-3 rounded-[14px] border bg-surface p-[15px]",
            emDia ? "border-success/35" : "border-primary/30",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-2.5 w-2.5 shrink-0 rounded-full",
              emDia
                ? "bg-success-foreground ring-[3px] ring-success/15"
                : "bg-primary ring-[3px] ring-primary/15",
            )}
          />
          <div className="min-w-0 flex-1">
            <b className="block text-sm font-semibold text-foreground">
              {sincronizando
                ? "Sincronizando…"
                : emDia
                  ? "Tudo enviado à central"
                  : `${pendentes.length} ${pendentes.length === 1 ? "registro" : "registros"} no aparelho`}
            </b>
            <span className="mt-[3px] block text-[11.5px] text-foreground-faint">
              {ultima
                ? `última sincronização · ${formatDataHora(ultima)}`
                : "ainda não sincronizado neste aparelho"}
            </span>
          </div>
          {sincronizando ? (
            <Icon icon="lucide:refresh-cw" className="h-5 w-5 shrink-0 animate-spin text-primary" />
          ) : emDia ? (
            <Icon
              icon="lucide:circle-check-big"
              className="h-5 w-5 shrink-0 text-success-foreground"
            />
          ) : (
            <Icon icon="lucide:smartphone" className="h-5 w-5 shrink-0 text-primary-dim" />
          )}
        </div>

        <TilesCampo className="mt-3">
          <TileCampo rotulo="No aparelho" valor={pendentes.length} unidade="itens" />
          <TileCampo rotulo="Última sincronização" valor={ultima ? formatHoraCurta(ultima) : "—"} />
        </TilesCampo>

        {pendentes.length > 0 ? (
          <>
            <SecaoCampo>Fila de envio</SecaoCampo>
            <CartaoCampo>
              {pendentes.map((item) => (
                <div key={item.id} className={LINHA_CAMPO}>
                  <IconeTile>
                    <Icon icon={item.icone} className="h-4 w-4" />
                  </IconeTile>
                  <LinhaCorpo>
                    <LinhaTitulo>{item.titulo}</LinhaTitulo>
                    <LinhaMeta>{item.detalhe}</LinhaMeta>
                  </LinhaCorpo>
                  <SyncMini sincronizado={false} />
                </div>
              ))}
            </CartaoCampo>
          </>
        ) : null}

        {erro ? (
          <AvisoCampo tom="perigo" className="mt-3.5">
            {erro}
          </AvisoCampo>
        ) : null}

        <AvisoCampo className="mt-3.5">
          O app guarda tudo <b className="text-foreground">no aparelho</b> assim que você confirma.
          Nada se perde ao fechar o app ou ficar sem sinal no canteiro.
        </AvisoCampo>

        <div className="mt-3.5">
          <BotaoCampo onClick={sincronizar} disabled={sincronizando}>
            <Icon
              icon={sincronizando ? "lucide:refresh-cw" : "lucide:arrow-up-right"}
              className={cn("h-[18px] w-[18px]", sincronizando && "animate-spin")}
            />
            {sincronizando ? "Sincronizando…" : "Sincronizar agora"}
          </BotaoCampo>
        </div>
      </AreaRolagem>
    </TelaCampo>
  );
}
