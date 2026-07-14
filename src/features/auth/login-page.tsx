import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { EsqueciSenhaDialog } from "@/features/auth/esqueci-senha-dialog";
import { VERSAO_SISTEMA, CODINOME_SISTEMA } from "@/features/auth/versao-sistema";
import { STORAGE_KEY_LEMBRAR } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const [dialogEsqueciSenhaAberto, setDialogEsqueciSenhaAberto] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

    localStorage.setItem(STORAGE_KEY_LEMBRAR, manterConectado ? "true" : "false");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error || !data.session) {
      setEntrando(false);
      setErro("E-mail ou senha incorretos.");
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios_retaguarda")
      .select("id")
      .eq("id", data.session.user.id)
      .maybeSingle();

    if (!perfil) {
      await supabase.auth.signOut();
      setEntrando(false);
      setErro("Conta não configurada — fale com o proprietário.");
      return;
    }

    toast.success("Bem-vindo!");
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen w-full bg-asphalt">
      {/* Painel de marca — logo full-bleed com gradiente escuro e rodapé de status. */}
      <aside className="relative hidden w-1/2 flex-col overflow-hidden bg-asphalt md:flex">
        <img
          src="/logo-antonello-preto.png"
          alt="Antonello Terraplanagem"
          className="absolute inset-0 h-full w-full select-none object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/10 via-asphalt/5 to-asphalt/75"
        />

        <div className="relative mt-auto space-y-4 p-10">
          <HazardStripe className="h-2" />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold text-sidebar-foreground">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              Sistemas operacionais
            </span>
            <span className="ml-auto font-mono text-[11px] text-sidebar-foreground/60">
              v{VERSAO_SISTEMA} · {CODINOME_SISTEMA}
            </span>
          </div>
        </div>
      </aside>

      {/* Painel do formulário — tom concreto claro FIXO (via .theme-light):
          NÃO segue o toggle de tema, para manter o contraste do split-screen. */}
      <div className="theme-light flex w-full flex-1 flex-col bg-background text-foreground md:w-1/2">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <img
            src="/logo-antonello-branco.png"
            alt="Antonello Terraplanagem"
            className="h-12 w-auto select-none object-contain md:hidden"
          />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3">
              <HazardStripe className="h-1.5 w-12 rounded-full" />
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  Entrar na retaguarda
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acesso da recepção e do proprietário.
                </p>
              </div>
            </div>

            <form onSubmit={entrar} className="space-y-5">
              <CampoComIcone
                icone="lucide:mail"
                label="E-mail"
                id="email"
                tipo="email"
                valor={email}
                onChange={(valor) => {
                  setEmail(valor);
                  setErro(null);
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
                required
                ariaInvalid={!!erro}
                ariaDescribedBy={erro ? "login-erro" : undefined}
              />

              <CampoComIcone
                icone="lucide:lock"
                label="Senha"
                id="senha"
                tipo={mostrarSenha ? "text" : "password"}
                valor={senha}
                onChange={(valor) => {
                  setSenha(valor);
                  setErro(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                ariaInvalid={!!erro}
                ariaDescribedBy={erro ? "login-erro" : undefined}
                acao={
                  <button
                    type="button"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground hover:text-primary"
                  >
                    <Icon
                      icon={mostrarSenha ? "lucide:eye-off" : "lucide:eye"}
                      className="h-4 w-4"
                    />
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="manter-conectado"
                    checked={manterConectado}
                    onCheckedChange={(v) => setManterConectado(v === true)}
                  />
                  <Label
                    htmlFor="manter-conectado"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    Manter conectado
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogEsqueciSenhaAberto(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              {erro ? (
                <p
                  id="login-erro"
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                >
                  {erro}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={entrando}
                className="h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                {entrando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="border-t border-border pt-5 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
              Operador de campo? O apontamento é feito pelo app, no celular da obra.
            </p>
          </div>
        </div>
      </div>

      <EsqueciSenhaDialog
        aberto={dialogEsqueciSenhaAberto}
        onOpenChange={setDialogEsqueciSenhaAberto}
        emailInicial={email}
      />
    </main>
  );
}
