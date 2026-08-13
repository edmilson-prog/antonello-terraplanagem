import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { LogoTile } from "@/shared/components/logo-tile";
import { supabase } from "@/lib/supabase";
import {
  gravarSessaoOperador,
  lembrarUltimoOperador,
  lerUltimoOperador,
} from "@/features/auth/operador-session";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { iniciaisDoNome } from "@/shared/lib/format";
import { cn } from "@/lib/utils";

/*
 * Login do App de Campo — variante "menu" do UI kit (`ui_kits/app-campo/index.html`):
 * abre direto no teclado de PIN do último operador deste aparelho, com um chip
 * que abre a folha de troca de operador. Só nome e iniciais aparecem aqui — a
 * RLS `operadores_anon_login_list` expõe apenas id/nome à role anon (LGPD).
 */

interface OperadorListado {
  id: string;
  nome: string;
}

const VALIDADE_SESSAO_MS = 180 * 24 * 60 * 60 * 1000;
const TAMANHO_PIN = 4;

export function OperadorLoginPage() {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState<OperadorListado[] | null>(null);
  const [erroLista, setErroLista] = useState(false);
  const [selecionado, setSelecionado] = useState<OperadorListado | null>(null);
  const [folhaAberta, setFolhaAberta] = useState(false);
  const [pin, setPin] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erroPin, setErroPin] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setErroLista(false);
    setOperadores(null);

    // Sem filtro .eq("ativo", true) aqui: a RLS (operadores_anon_login_list) já
    // restringe a role anon a linhas ativas, e o grant de coluna do anon nesta
    // tabela cobre apenas id/nome — filtrar por `ativo` no client exigiria SELECT
    // também na coluna ativo, que a role anon não tem (by design/LGPD).
    void supabase
      .from("operadores")
      .select("id, nome")
      .order("nome")
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) {
          setErroLista(true);
          return;
        }
        const lista = data ?? [];
        setOperadores(lista);

        const ultimo = lerUltimoOperador();
        const conhecido = ultimo ? lista.find((o) => o.id === ultimo.id) : undefined;
        if (conhecido) {
          setSelecionado(conhecido);
        } else if (lista.length > 0) {
          // Primeiro uso do aparelho (ou operador desativado): pede a escolha.
          setFolhaAberta(true);
        }
      });

    return () => {
      ativo = false;
    };
  }, [tentativa]);

  async function confirmarPin(pinDigitado: string) {
    if (!selecionado) return;
    setEntrando(true);
    setErroPin(null);

    const { data, error } = await supabase.rpc("login_operador", {
      p_operador_id: selecionado.id,
      p_pin: pinDigitado,
    });

    setEntrando(false);

    const resultado = data as {
      erro?: string;
      token?: string;
      operador?: { id: string; nome: string };
    } | null;

    if (error || !resultado || resultado.erro || !resultado.token || !resultado.operador) {
      setErroPin(resultado?.erro ?? "Não foi possível entrar. Tente novamente.");
      setPin("");
      return;
    }

    gravarSessaoOperador({
      token: resultado.token,
      operadorId: resultado.operador.id,
      operadorNome: resultado.operador.nome,
      expiraEm: new Date(Date.now() + VALIDADE_SESSAO_MS).toISOString(),
    });
    lembrarUltimoOperador({ id: resultado.operador.id, nome: resultado.operador.nome });

    // Os stores carregaram na abertura do app, quando ainda não havia token —
    // como `anon` não enxerga OS nem apontamento, o cache está vazio. Recarrega
    // agora, já pelas RPCs do operador, senão ele entra num app em branco.
    await Promise.all([ordensStore.retry(), apontamentosStore.retry()]);

    toast.success(`Bem-vindo, ${resultado.operador.nome.split(" ")[0]}!`);
    void navigate({ to: "/app" });
  }

  const carregando = operadores === null && !erroLista;
  const listaVazia = operadores?.length === 0;
  const podeDigitar = !!selecionado && !entrando;

  function digitar(numero: string) {
    if (!podeDigitar || pin.length >= TAMANHO_PIN) return;
    const novoPin = pin + numero;
    setPin(novoPin);
    setErroPin(null);
    if (novoPin.length === TAMANHO_PIN) {
      void confirmarPin(novoPin);
    }
  }

  function apagar() {
    if (!podeDigitar) return;
    setPin((p) => p.slice(0, -1));
    setErroPin(null);
  }

  function escolher(operador: OperadorListado) {
    setSelecionado(operador);
    setPin("");
    setErroPin(null);
    setFolhaAberta(false);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-[26px] pb-6 pt-[34px]">
        <div className="flex flex-col items-center gap-[13px] text-center">
          <LogoTile size={58} />
          <p className="font-display text-[17px] font-extrabold uppercase leading-[1.1] tracking-[0.02em] text-foreground">
            App de Campo
            <span className="mt-[3px] block text-[9.5px] font-semibold tracking-[0.24em] text-primary">
              ANTONELLO TERRAPLANAGEM
            </span>
          </p>

          <button
            type="button"
            disabled={carregando || erroLista || listaVazia}
            onClick={() => setFolhaAberta(true)}
            className="mt-[10px] inline-flex min-h-11 items-center gap-2 rounded-[22px] border border-border bg-surface py-1.5 pl-[7px] pr-[13px] text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-60"
          >
            {selecionado ? (
              <span
                aria-hidden
                className="grid h-[26px] w-[26px] place-items-center rounded-full bg-primary font-display text-[11px] font-extrabold text-primary-foreground"
              >
                {iniciaisDoNome(selecionado.nome)}
              </span>
            ) : (
              <Icon icon="lucide:hard-hat" className="ml-1 h-[18px] w-[18px] text-primary" />
            )}
            {carregando
              ? "Carregando operadores…"
              : selecionado
                ? `${selecionado.nome} · Operador`
                : "Escolher operador"}
            <Icon icon="lucide:chevron-down" className="h-[13px] w-[13px] text-primary" />
          </button>
        </div>

        <div className="mb-2 mt-[26px] flex justify-center gap-[14px]" aria-hidden>
          {Array.from({ length: TAMANHO_PIN }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[13px] w-[13px] rounded-full border-[1.5px] transition-colors",
                i < pin.length
                  ? "border-primary bg-primary ring-[3px] ring-primary/15"
                  : "border-border-strong",
              )}
            />
          ))}
        </div>

        <p className="text-center text-xs text-foreground-faint" aria-live="polite">
          {erroLista
            ? "Não foi possível carregar os operadores."
            : listaVazia
              ? "Nenhum operador com acesso ao app."
              : entrando
                ? "Verificando…"
                : selecionado
                  ? "Digite seu PIN de 4 dígitos"
                  : "Escolha quem está operando para continuar"}
        </p>

        {erroPin ? (
          <p role="alert" className="mt-2 text-center text-xs font-semibold text-destructive">
            {erroPin}
          </p>
        ) : null}

        {erroLista ? (
          <div className="mt-4 flex justify-center">
            <Button type="button" variant="outline" onClick={() => setTentativa((t) => t + 1)}>
              <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        ) : null}

        <div className="mt-auto grid grid-cols-3 gap-[10px] pt-8">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <button
              key={n}
              type="button"
              disabled={!podeDigitar}
              onClick={() => digitar(n)}
              className="grid min-h-[58px] place-items-center rounded-xl border border-border bg-surface font-mono text-xl font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-muted disabled:opacity-50"
            >
              {n}
            </button>
          ))}
          <span />
          <button
            type="button"
            disabled={!podeDigitar}
            onClick={() => digitar("0")}
            className="grid min-h-[58px] place-items-center rounded-xl border border-border bg-surface font-mono text-xl font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-muted disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            aria-label="Apagar"
            disabled={!podeDigitar || pin.length === 0}
            onClick={apagar}
            className="grid min-h-[58px] place-items-center rounded-xl border border-transparent text-foreground-faint transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Icon icon="lucide:arrow-left" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Sheet open={folhaAberta} onOpenChange={setFolhaAberta}>
        <SheetContent
          side="bottom"
          className="gap-0 rounded-t-[18px] border-t border-border-strong bg-surface p-0 [&>button]:hidden"
        >
          <div className="mx-auto flex w-full max-w-sm flex-col gap-1 px-3 pb-4 pt-3.5">
            <SheetTitle className="px-2 pb-2.5 pt-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-foreground-faint">
              Escolher operador
            </SheetTitle>
            <SheetDescription className="sr-only">
              Selecione quem está operando para digitar o PIN.
            </SheetDescription>

            <div className="max-h-[60vh] overflow-y-auto">
              {operadores?.map((operador) => (
                <button
                  key={operador.id}
                  type="button"
                  onClick={() => escolher(operador)}
                  className="flex min-h-[54px] w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span
                    aria-hidden
                    className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-primary font-display text-[15px] font-extrabold text-primary-foreground"
                  >
                    {iniciaisDoNome(operador.nome)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {operador.nome}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-foreground-faint">
                      Operador
                    </span>
                  </span>
                  {selecionado?.id === operador.id ? (
                    <Icon icon="lucide:check" className="h-[17px] w-[17px] shrink-0 text-primary" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
