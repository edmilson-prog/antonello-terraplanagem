import { useCallback, useEffect, useState } from "react";

import { ehIOS, rodandoInstalado } from "@/features/instalacao/deteccao";
import {
  decidirConvite,
  lerPreferencia,
  limparPreferencia,
  registrarDispensa,
  type ModoConvite,
} from "@/features/instalacao/convite";

/*
 * Liga a regra do convite (convite.ts) aos eventos do navegador.
 *
 * O `beforeinstallprompt` chega uma única vez, logo depois do carregamento —
 * antes de qualquer tela do operador montar. Por isso a escuta é de módulo, e
 * não do hook: o evento é guardado assim que o chunk do app de campo é
 * avaliado, e as telas apenas assinam o que já foi capturado. Guardar o evento
 * também é o que permite convidar dentro do layout do campo, com o texto do
 * projeto, em vez da mini-barra genérica do Chrome.
 */

interface EventoInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let promptGuardado: EventoInstalacao | null = null;
let instalouNestaSessao = false;
const assinantes = new Set<() => void>();

function avisarAssinantes(): void {
  for (const assinante of assinantes) assinante();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    // Sem o preventDefault o navegador mostra a própria barra e consome o
    // evento — e o convite deixa de ser nosso.
    evento.preventDefault();
    promptGuardado = evento as EventoInstalacao;
    avisarAssinantes();
  });

  window.addEventListener("appinstalled", () => {
    promptGuardado = null;
    instalouNestaSessao = true;
    limparPreferencia();
    avisarAssinantes();
  });
}

export interface ConviteInstalacao {
  modo: ModoConvite;
  /** O prompt nativo está aberto — evita duplo toque no botão. */
  ocupado: boolean;
  instalar: () => Promise<void>;
  dispensar: () => void;
}

export function useConviteInstalacao({ persistente = false } = {}): ConviteInstalacao {
  // Começa oculto de propósito: no primeiro render (SSR e hidratação) nada do
  // que decide o convite existe, e um banner que pisca é pior que um atrasado.
  const [modo, setModo] = useState<ModoConvite>("oculto");
  const [ocupado, setOcupado] = useState(false);

  const recalcular = useCallback(() => {
    setModo(
      decidirConvite({
        instalado: instalouNestaSessao || rodandoInstalado(),
        ios: ehIOS(),
        promptNativo: promptGuardado !== null,
        preferencia: lerPreferencia(),
        agora: new Date(),
        ignorarSilencio: persistente,
      }),
    );
  }, [persistente]);

  useEffect(() => {
    recalcular();
    assinantes.add(recalcular);
    return () => {
      assinantes.delete(recalcular);
    };
  }, [recalcular]);

  const instalar = useCallback(async () => {
    const evento = promptGuardado;
    if (!evento) return;

    setOcupado(true);
    try {
      await evento.prompt();
      const { outcome } = await evento.userChoice;
      // O evento é de uso único: só o navegador decide quando manda outro.
      promptGuardado = null;
      if (outcome === "accepted") {
        limparPreferencia();
      } else {
        // Recusou o diálogo do sistema: vale como "agora não" — sem outro
        // evento em mãos, insistir na tela seguinte não instalaria nada.
        registrarDispensa();
      }
    } catch (erro) {
      console.warn("Falha ao abrir o convite de instalação:", erro);
      promptGuardado = null;
    } finally {
      setOcupado(false);
      avisarAssinantes();
    }
  }, []);

  const dispensar = useCallback(() => {
    registrarDispensa();
    avisarAssinantes();
  }, []);

  return { modo, ocupado, instalar, dispensar };
}
