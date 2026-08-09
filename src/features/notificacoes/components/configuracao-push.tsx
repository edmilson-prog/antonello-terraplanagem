import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  ativarPush,
  desativarPush,
  estadoAtualDoPush,
  precisaInstalarNaTelaInicial,
  type EstadoPush,
} from "@/features/notificacoes/push";

/*
 * Controle de notificações no aparelho (PRD-020), exibido no Perfil.
 *
 * Cada estado tem um texto que diz o que fazer, não só o que houve — o
 * operador não vai deduzir sozinho que "bloqueado" se resolve nas
 * configurações do navegador.
 */

const TEXTOS: Record<EstadoPush, { titulo: string; descricao: string }> = {
  ligado: {
    titulo: "Avisos ligados neste aparelho",
    descricao: "Você recebe um aviso mesmo com o app fechado.",
  },
  desligado: {
    titulo: "Avisos desligados",
    descricao: "Ligue para ser avisado de nova OS e manutenção sem precisar abrir o app.",
  },
  bloqueado: {
    titulo: "Avisos bloqueados pelo navegador",
    descricao:
      "Você negou a permissão antes. Libere nas configurações do navegador, em Notificações, e volte aqui.",
  },
  indisponivel: {
    titulo: "Avisos indisponíveis neste aparelho",
    descricao: "Este navegador não trabalha com notificações.",
  },
  nao_configurado: {
    titulo: "Avisos ainda não configurados",
    descricao: "Falta a chave de notificação nesta versão do app. Avise a retaguarda.",
  },
};

export function ConfiguracaoPush() {
  const [estado, setEstado] = useState<EstadoPush | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    void estadoAtualDoPush().then(setEstado);
  }, []);

  if (estado === null) return null;

  // No iOS o Web Push só existe depois de instalar na tela inicial — instruir
  // vale mais que esconder o recurso.
  if (estado === "indisponivel" && precisaInstalarNaTelaInicial()) {
    return (
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon icon="lucide:share" className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground">
              Instale o app para receber avisos
            </p>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
              No iPhone, toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.
              Abra o app por lá e os avisos ficam disponíveis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { titulo, descricao } = TEXTOS[estado];
  const podeAlternar = estado === "ligado" || estado === "desligado";

  async function alternar() {
    setOcupado(true);
    try {
      setEstado(estado === "ligado" ? await desativarPush() : await ativarPush());
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={
            estado === "ligado"
              ? "flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary"
              : "flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground"
          }
        >
          <Icon
            icon={estado === "ligado" ? "lucide:bell-ring" : "lucide:bell-off"}
            className="h-[18px] w-[18px]"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-card-foreground">{titulo}</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{descricao}</p>

          {podeAlternar ? (
            <Button
              variant={estado === "ligado" ? "outline" : "default"}
              size="sm"
              onClick={() => void alternar()}
              disabled={ocupado}
              className="mt-3 gap-1.5"
            >
              <Icon
                icon={ocupado ? "lucide:loader-circle" : "lucide:bell"}
                className={ocupado ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
              {estado === "ligado" ? "Desligar avisos" : "Ligar avisos"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
