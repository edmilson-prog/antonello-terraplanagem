import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { supabase } from "@/lib/supabase";
import { gravarSessaoOperador } from "@/features/auth/operador-session";
import { cn } from "@/lib/utils";

interface OperadorListado {
  id: string;
  nome: string;
}

const VALIDADE_SESSAO_MS = 180 * 24 * 60 * 60 * 1000;

export function OperadorLoginPage() {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState<OperadorListado[] | null>(null);
  const [erroLista, setErroLista] = useState(false);
  const [selecionado, setSelecionado] = useState<OperadorListado | null>(null);
  const [pin, setPin] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erroPin, setErroPin] = useState<string | null>(null);

  useEffect(() => {
    // Sem filtro .eq("ativo", true) aqui: a RLS (operadores_anon_login_list) já
    // restringe a role anon a linhas ativas, e o grant de coluna do anon nesta
    // tabela cobre apenas id/nome — filtrar por `ativo` no client exigiria SELECT
    // também na coluna ativo, que a role anon não tem (by design/LGPD).
    supabase
      .from("operadores")
      .select("id, nome")
      .order("nome")
      .then(({ data, error }) => {
        if (error) {
          setErroLista(true);
          return;
        }
        setOperadores(data ?? []);
      });
  }, []);

  async function confirmarPin(pinDigitado: string) {
    if (!selecionado) return;
    setEntrando(true);
    setErroPin(null);

    const { data, error } = await supabase.rpc("login_operador", {
      p_operador_id: selecionado.id,
      p_pin: pinDigitado,
    });

    setEntrando(false);

    const resultado = data as { erro?: string; token?: string; operador?: { id: string; nome: string } } | null;

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

    toast.success(`Bem-vindo, ${resultado.operador.nome.split(" ")[0]}!`);
    navigate({ to: "/app" });
  }

  function digitar(numero: string) {
    if (pin.length >= 4 || entrando) return;
    const novoPin = pin + numero;
    setPin(novoPin);
    if (novoPin.length === 4) {
      void confirmarPin(novoPin);
    }
  }

  function apagar() {
    setPin((p) => p.slice(0, -1));
    setErroPin(null);
  }

  if (selecionado) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-sm space-y-6 text-center">
          <button
            type="button"
            onClick={() => {
              setSelecionado(null);
              setPin("");
              setErroPin(null);
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Icon icon="lucide:chevron-left" className="h-4 w-4" />
            Trocar operador
          </button>

          <div className="space-y-1">
            <h1 className="font-display text-xl font-bold text-foreground">{selecionado.nome}</h1>
            <p className="text-sm text-muted-foreground">Digite seu PIN de 4 dígitos</p>
          </div>

          <div className="flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-4 w-4 rounded-full border-2",
                  i < pin.length ? "border-primary bg-primary" : "border-border",
                )}
              />
            ))}
          </div>

          {erroPin ? <p className="text-sm text-destructive">{erroPin}</p> : null}

          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <button
                key={n}
                type="button"
                disabled={entrando}
                onClick={() => digitar(n)}
                className="rounded-xl border bg-card py-4 font-mono text-xl font-semibold text-card-foreground hover:border-primary/40 disabled:opacity-50"
              >
                {n}
              </button>
            ))}
            <div />
            <button
              type="button"
              disabled={entrando}
              onClick={() => digitar("0")}
              className="rounded-xl border bg-card py-4 font-mono text-xl font-semibold text-card-foreground hover:border-primary/40 disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              disabled={entrando || pin.length === 0}
              onClick={apagar}
              className="flex items-center justify-center rounded-xl border bg-card py-4 text-card-foreground hover:border-primary/40 disabled:opacity-50"
            >
              <Icon icon="lucide:delete" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-10">
      <HazardStripe />
      <div className="mx-auto w-full max-w-sm space-y-6 pt-6">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-xl font-bold text-foreground">Antonello · Campo</h1>
          <p className="text-sm text-muted-foreground">Quem é você?</p>
        </div>

        {erroLista ? (
          <p className="text-center text-sm text-destructive">
            Não foi possível carregar os operadores. Verifique a conexão e tente novamente.
          </p>
        ) : null}

        {operadores === null && !erroLista ? (
          <p className="text-center text-sm text-muted-foreground">Carregando...</p>
        ) : null}

        {operadores?.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Nenhum operador ativo cadastrado.</p>
        ) : null}

        <div className="grid gap-2">
          {operadores?.map((op) => (
            <Button
              key={op.id}
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setSelecionado(op)}
              className="justify-start gap-3 py-6 text-base"
            >
              <Icon icon="lucide:hard-hat" className="h-5 w-5" />
              {op.nome}
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
