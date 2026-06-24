import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HardHat, Building2, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { gravarSessao, rotaPorPerfil } from "@/shared/hooks/use-mock-session";
import type { Perfil } from "@/shared/types";
import { cn } from "@/lib/utils";

interface OpcaoPerfil {
  perfil: Perfil;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
}

const opcoes: OpcaoPerfil[] = [
  {
    perfil: "operador",
    titulo: "Operador",
    descricao: "Acesso ao app de campo",
    icone: HardHat,
  },
  {
    perfil: "recepcao",
    titulo: "Recepção",
    descricao: "Retaguarda do escritório",
    icone: Building2,
  },
  {
    perfil: "proprietario",
    titulo: "Proprietário",
    descricao: "Acesso completo, inclusive financeiro",
    icone: Briefcase,
  },
];

const nomePorPerfil: Record<Perfil, string> = {
  operador: "José Carlos",
  recepcao: "Ana Recepção",
  proprietario: "Sr. Antonello",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil>("recepcao");

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    gravarSessao({ perfil, nome: nomePorPerfil[perfil] });
    navigate({ to: rotaPorPerfil(perfil) });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-lg">
        <HazardStripe />

        <div className="space-y-6 p-6 md:p-8">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-card-foreground">
              Antonello Terraplanagem — Gestão de Obras
            </h1>
            <p className="text-sm text-muted-foreground">
              Plataforma de gestão — entre com seu perfil
            </p>
          </div>

          <form onSubmit={entrar} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                defaultValue="demo@antonello.com.br"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                defaultValue="demo"
                autoComplete="current-password"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Entrar como</legend>
              <div className="grid gap-2">
                {opcoes.map((op) => {
                  const Icone = op.icone;
                  const selecionado = perfil === op.perfil;
                  return (
                    <button
                      key={op.perfil}
                      type="button"
                      onClick={() => setPerfil(op.perfil)}
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 text-left transition-colors",
                        selecionado
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface/40 hover:border-primary/40",
                      )}
                      aria-pressed={selecionado}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-md",
                          selecionado
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground",
                        )}
                      >
                        <Icone className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{op.titulo}</div>
                        <div className="text-xs text-muted-foreground">{op.descricao}</div>
                      </div>
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border-2",
                          selecionado ? "border-primary bg-primary" : "border-border",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
              Entrar
            </Button>
          </form>

          <p className="text-center font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
            Acesso de demonstração · sem backend
          </p>
        </div>
      </div>
    </main>
  );
}
