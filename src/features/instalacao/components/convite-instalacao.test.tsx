import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CHAVE_CONVITE, lerPreferencia } from "@/features/instalacao/convite";

/*
 * O convite depende de eventos que só o navegador dispara (`beforeinstallprompt`)
 * e de estado de módulo — a escuta é registrada uma vez, no import. Por isso
 * cada teste recarrega o módulo com resetModules: sem isso, o prompt guardado
 * por um caso vazaria para o seguinte.
 */

interface EventoFalso extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function eventoDeInstalacao(escolha: "accepted" | "dismissed" = "accepted") {
  const evento = new Event("beforeinstallprompt", { cancelable: true }) as EventoFalso;
  evento.prompt = vi.fn().mockResolvedValue(undefined);
  evento.userChoice = Promise.resolve({ outcome: escolha, platform: "web" });
  return evento;
}

async function carregarConvite() {
  vi.resetModules();
  const modulo = await import("@/features/instalacao/components/convite-instalacao");
  return modulo.ConviteInstalacao;
}

function fingirIPhone() {
  Object.defineProperty(window.navigator, "userAgent", {
    value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
    configurable: true,
  });
}

describe("ConviteInstalacao", () => {
  const userAgentOriginal = window.navigator.userAgent;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: userAgentOriginal,
      configurable: true,
    });
  });

  it("fica fora da tela enquanto o navegador não oferece instalação", async () => {
    const ConviteInstalacao = await carregarConvite();
    const { container } = render(<ConviteInstalacao />);
    expect(container).toBeEmptyDOMElement();
  });

  it("aparece quando o navegador entrega o prompt e instala ao toque", async () => {
    const ConviteInstalacao = await carregarConvite();
    render(<ConviteInstalacao />);

    const evento = eventoDeInstalacao("accepted");
    fireEvent(window, evento);

    // O evento precisa ser barrado: senão o navegador mostra a barra dele.
    expect(evento.defaultPrevented).toBe(true);

    const botao = await screen.findByRole("button", { name: /Instalar app/ });
    fireEvent.click(botao);

    await waitFor(() => expect(evento.prompt).toHaveBeenCalled());
    // Aceito: o convite sai da tela e nada fica gravado como recusa.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Instalar app/ })).not.toBeInTheDocument(),
    );
    expect(window.localStorage.getItem(CHAVE_CONVITE)).toBeNull();
  });

  it("recusar o diálogo do sistema vale como 'agora não'", async () => {
    const ConviteInstalacao = await carregarConvite();
    render(<ConviteInstalacao />);
    fireEvent(window, eventoDeInstalacao("dismissed"));

    fireEvent.click(await screen.findByRole("button", { name: /Instalar app/ }));

    await waitFor(() => expect(lerPreferencia().dispensas).toBe(1));
    expect(screen.queryByRole("button", { name: /Instalar app/ })).not.toBeInTheDocument();
  });

  it("'agora não' guarda a dispensa e tira o banner", async () => {
    const ConviteInstalacao = await carregarConvite();
    render(<ConviteInstalacao />);
    fireEvent(window, eventoDeInstalacao());

    fireEvent.click(await screen.findByRole("button", { name: "Agora não" }));

    expect(lerPreferencia().dispensas).toBe(1);
    expect(screen.queryByRole("button", { name: /Instalar app/ })).not.toBeInTheDocument();
  });

  it("no Perfil (persistente) não há como dispensar, e o silêncio não vale", async () => {
    window.localStorage.setItem(
      CHAVE_CONVITE,
      JSON.stringify({ dispensas: 3, dispensadoEm: new Date().toISOString() }),
    );
    const ConviteInstalacao = await carregarConvite();
    render(<ConviteInstalacao persistente />);
    fireEvent(window, eventoDeInstalacao());

    expect(await screen.findByRole("button", { name: /Instalar app/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Agora não" })).not.toBeInTheDocument();
  });

  it("no iPhone mostra o passo a passo, sem prometer botão que o Safari não tem", async () => {
    fingirIPhone();
    const ConviteInstalacao = await carregarConvite();
    render(<ConviteInstalacao />);

    expect(screen.queryByRole("button", { name: /Instalar app/ })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: /Como instalar/ }));

    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument();
    expect(screen.getByText(/seu PIN/)).toBeInTheDocument();
  });

  it("quem já abriu pela tela inicial não é convidado de novo", async () => {
    fingirIPhone();
    Object.defineProperty(window.navigator, "standalone", { value: true, configurable: true });
    try {
      const ConviteInstalacao = await carregarConvite();
      const { container } = render(<ConviteInstalacao persistente />);
      expect(container).toBeEmptyDOMElement();
    } finally {
      Object.defineProperty(window.navigator, "standalone", {
        value: undefined,
        configurable: true,
      });
    }
  });
});
