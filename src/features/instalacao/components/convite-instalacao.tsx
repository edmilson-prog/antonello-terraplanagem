import { useState } from "react";
import { Icon } from "@iconify/react";

import { BotaoCampo, IconeTile } from "@/features/operador/components/kit";
import { PassosInstalacaoIOS } from "@/features/instalacao/components/passos-instalacao-ios";
import { useConviteInstalacao } from "@/features/instalacao/use-convite-instalacao";
import { cn } from "@/lib/utils";

/*
 * Convite para instalar o app de campo na tela inicial.
 *
 * Dois pontos de exibição, mesmo componente:
 * - banner na aba "Hoje" (dispensável, com o silêncio de convite.ts);
 * - cartão no Perfil (`persistente`), que ignora a dispensa — quem disse
 *   "agora não" três vezes ainda precisa de um lugar para instalar depois.
 *
 * O texto não promete offline: o service worker do projeto não tem shell
 * offline (ver public/sw.js). O que a instalação entrega de fato é abrir pelo
 * ícone, sem a barra do navegador, e — no iPhone — liberar os avisos push.
 */

const DESCRICAO: Record<"nativo" | "ios", string> = {
  nativo:
    "Fica com ícone na tela inicial, abre em tela cheia sem a barra do navegador e recebe os avisos da retaguarda.",
  ios: "No iPhone, o app só recebe os avisos da retaguarda depois de instalado na tela inicial. São três toques.",
};

export interface ConviteInstalacaoProps {
  /** Perfil: ponto de entrada fixo, sem "agora não". */
  persistente?: boolean;
  /** Substitui o texto de apoio (ex.: quando o motivo é o push). */
  descricao?: string;
  className?: string;
}

export function ConviteInstalacao({
  persistente = false,
  descricao,
  className,
}: ConviteInstalacaoProps) {
  const { modo, ocupado, instalar, dispensar } = useConviteInstalacao({ persistente });
  // No Perfil o operador chegou aqui para instalar: os passos já vêm abertos.
  const [passosAbertos, setPassosAbertos] = useState(persistente);

  if (modo === "oculto") return null;

  return (
    <section
      aria-label="Instalar o app de campo"
      className={cn("rounded-[14px] border border-primary/35 bg-surface px-3.5 py-3.5", className)}
    >
      <div className="flex items-start gap-[11px]">
        <IconeTile tom="brand" tamanho={34}>
          <Icon
            icon={modo === "ios" ? "lucide:share" : "lucide:download"}
            className="h-[17px] w-[17px]"
          />
        </IconeTile>

        <div className="min-w-0 flex-1">
          <b className="block text-[13.5px] font-bold text-foreground">Instale o app no celular</b>
          <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
            {descricao ?? DESCRICAO[modo]}
          </p>
        </div>

        {persistente ? null : (
          <button
            type="button"
            onClick={dispensar}
            aria-label="Agora não"
            className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-[9px] text-foreground-faint transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        )}
      </div>

      {modo === "nativo" ? (
        <BotaoCampo onClick={() => void instalar()} disabled={ocupado} className="mt-3">
          <Icon
            icon={ocupado ? "lucide:loader-circle" : "lucide:download"}
            className={ocupado ? "h-[17px] w-[17px] animate-spin" : "h-[17px] w-[17px]"}
          />
          {ocupado ? "Abrindo..." : "Instalar app"}
        </BotaoCampo>
      ) : (
        <>
          <BotaoCampo
            variante={passosAbertos ? "ghost" : "solido"}
            onClick={() => setPassosAbertos((aberto) => !aberto)}
            aria-expanded={passosAbertos}
            aria-controls="convite-instalacao-passos"
            className="mt-3"
          >
            <Icon
              icon={passosAbertos ? "lucide:chevron-up" : "lucide:list-ordered"}
              className="h-[17px] w-[17px]"
            />
            {passosAbertos ? "Ocultar passos" : "Como instalar"}
          </BotaoCampo>
          {passosAbertos ? <PassosInstalacaoIOS id="convite-instalacao-passos" /> : null}
        </>
      )}
    </section>
  );
}
