import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-lg">
        <HazardStripe />

        <div className="space-y-6 p-6 md:p-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-card-foreground">
              Antonello Terraplanagem — Retaguarda
            </h1>
            <p className="text-sm text-muted-foreground">Acesso da recepção e do proprietário</p>
          </div>

          <form onSubmit={entrar} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
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
              />
            </div>

            {erro ? <p className="text-sm text-destructive">{erro}</p> : null}

            <Button
              type="submit"
              size="lg"
              disabled={entrando}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {entrando ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
            Operador de campo? Use o app pelo celular da obra.
          </p>
        </div>
      </div>
    </main>
  );
}
