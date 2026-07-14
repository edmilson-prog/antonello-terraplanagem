import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { supabase } from "@/lib/supabase";

interface EsqueciSenhaDialogProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  emailInicial?: string;
}

export function EsqueciSenhaDialog({
  aberto,
  onOpenChange,
  emailInicial,
}: EsqueciSenhaDialogProps) {
  const [email, setEmail] = useState(emailInicial ?? "");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function fechar(novoAberto: boolean) {
    if (!novoAberto) {
      setEmail(emailInicial ?? "");
      setEnviando(false);
      setEnviado(false);
      setErro(null);
    }
    onOpenChange(novoAberto);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar o link agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Redefinir senha</DialogTitle>
          <DialogDescription>
            Informe seu e-mail — enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>

        {enviado ? (
          <div className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-3 text-sm text-foreground">
            <Icon icon="lucide:mail-check" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>Se esse e-mail estiver cadastrado, enviamos um link de redefinição.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <CampoComIcone
              icone="lucide:mail"
              label="E-mail"
              id="esqueci-senha-email"
              tipo="email"
              valor={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
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

            <Button type="submit" disabled={enviando} className="w-full">
              {enviando ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
