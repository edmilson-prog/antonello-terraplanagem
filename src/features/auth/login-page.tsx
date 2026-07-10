import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

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
      {/* Painel de marca — asfalto fixo (não segue o toggle); tablet e desktop.
          A logo "preto" já traz fundo escuro embutido idêntico ao bg-asphalt,
          então as bordas do PNG quadrado se fundem ao painel. */}
      <aside className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-asphalt md:flex">
        <HazardStripe className="absolute inset-x-0 top-0" />

        <div className="flex flex-col items-center gap-8 px-12 text-center">
          <img
            src="/logo-antonello-preto.png"
            alt="Antonello Terraplanagem"
            className="w-[20rem] max-w-full select-none object-contain"
          />
          <div className="space-y-4">
            <p className="mx-auto max-w-sm text-balance text-base leading-relaxed text-sidebar-foreground/85">
              Horas de máquina, ordens de serviço e faturamento em um só lugar — com a rentabilidade
              de cada equipamento e cada obra sempre à vista.
            </p>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              Gestão de Terraplanagem
            </p>
          </div>
        </div>

        <HazardStripe className="absolute inset-x-0 bottom-0" />
      </aside>

      {/* Painel do formulário — tom concreto claro FIXO (via .theme-light):
          NÃO segue o toggle de tema, para manter o contraste do split-screen. */}
      <div className="theme-light flex w-full flex-1 flex-col bg-background text-foreground md:w-1/2">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          {/* Logo "branco" traz fundo creme embutido idêntico ao bg-background,
              então se funde ao painel no header compacto do mobile. */}
          <img
            src="/logo-antonello-branco.png"
            alt="Antonello Terraplanagem"
            className="h-12 w-auto select-none object-contain md:hidden"
          />
          {/* Toggle mantido: não muda a cor desta tela (painéis são fixos), mas
              persiste a preferência de tema do usuário para quando entrar em /admin,
              atendendo à regra de tema claro/escuro obrigatório em toda a aplicação. */}
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
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? "login-erro" : undefined}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? "login-erro" : undefined}
                  className="h-11"
                />
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
    </main>
  );
}
