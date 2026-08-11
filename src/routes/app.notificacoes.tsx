import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { NotificacoesPage } from "@/features/notificacoes";
import {
  AreaRolagem,
  BOTAO_VOLTAR,
  CabecalhoCampo,
  TelaCampo,
} from "@/features/operador/components/kit";

/*
 * A central de notificações é a do PRD-020 (tabela `notificacoes` + RPCs por
 * token + Web Push). O que o porte para o UI kit acrescenta é só a moldura: o
 * shell novo não desenha cabeçalho global, então o título e o voltar passam a
 * ser da própria tela, como em toda sub-tela do kit.
 */
export const Route = createFileRoute("/app/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações · Antonello" },
      {
        name: "description",
        content: "Avisos da retaguarda para o operador no app de campo da Antonello Terraplanagem.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NotificacoesRoute,
});

function NotificacoesRoute() {
  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Notificações"
      />
      <AreaRolagem>
        <NotificacoesPage />
      </AreaRolagem>
    </TelaCampo>
  );
}
