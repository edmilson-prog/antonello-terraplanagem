import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { supabase } from "@/lib/supabase";

type Estado = "verificando" | "formulario" | "link-invalido";

export function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEstado(data.session ? "formulario" : "link-invalido");
    });
  }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    toast.success("Senha atualizada!");
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end px-4 py-4 md:px-8">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-6">
          {estado === "verificando" ? (
            <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Icon icon="lucide:loader-circle" className="h-6 w-6 animate-spin" />
              <p className="text-sm">Verificando o link...</p>
            </div>
          ) : null}

          {estado === "link-invalido" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <Icon icon="lucide:circle-alert" className="h-8 w-8 text-destructive" />
              <h1 className="font-display text-xl font-bold text-foreground">
                Este link expirou ou já foi usado.
              </h1>
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Voltar para o login
              </Link>
            </div>
          ) : null}

          {estado === "formulario" ? (
            <>
              <div className="space-y-1 text-center">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Definir nova senha
                </h1>
                <p className="text-sm text-muted-foreground">
                  Escolha uma nova senha para acessar a retaguarda.
                </p>
              </div>

              <form onSubmit={salvar} className="space-y-4">
                <CampoComIcone
                  icone="lucide:lock"
                  label="Nova senha"
                  id="nova-senha"
                  tipo="password"
                  valor={novaSenha}
                  onChange={setNovaSenha}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <CampoComIcone
                  icone="lucide:lock"
                  label="Confirmar nova senha"
                  id="confirmar-senha"
                  tipo="password"
                  valor={confirmarSenha}
                  onChange={setConfirmarSenha}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />

                {erro ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                  >
                    {erro}
                  </p>
                ) : null}

                <Button type="submit" disabled={salvando} className="w-full">
                  {salvando ? "Salvando..." : "Salvar nova senha"}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
