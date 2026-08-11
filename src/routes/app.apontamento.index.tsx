import { createFileRoute, redirect } from "@tanstack/react-router";

/*
 * A aba "Apontamento" deixou de existir com o bottom nav do UI kit
 * (Hoje · Minhas OS · Abastecer · Perfil). O apontamento em andamento aparece
 * em "Hoje" e a lista fechada virou o Histórico — esta rota fica só para não
 * quebrar link antigo salvo no celular de quem já usava o app.
 */
export const Route = createFileRoute("/app/apontamento/")({
  beforeLoad: () => {
    throw redirect({ to: "/app/historico" });
  },
});
