import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDialog } from "@/shared/components/form-dialog";
import { responderPergunta, PERGUNTAS_EXEMPLO } from "@/features/ia/mock/perguntas-respostas";
import type { EstadoIA, RespostaAssistente } from "@/features/ia/types";

export function PerguntarIABar() {
  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [estado, setEstado] = useState<EstadoIA>("ocioso");
  const [resposta, setResposta] = useState<RespostaAssistente | null>(null);
  const navigate = useNavigate();

  async function perguntar(texto: string) {
    if (!texto.trim()) return;
    setPergunta(texto);
    setEstado("processando");
    try {
      const r = await responderPergunta(texto);
      setResposta(r);
      setEstado("resultado");
    } catch {
      setEstado("erro");
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setAberto(true)}>
        <Icon icon="lucide:sparkles" className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Perguntar à IA</span>
      </Button>
      <FormDialog
        open={aberto}
        onOpenChange={(open) => {
          setAberto(open);
          if (!open) {
            setEstado("ocioso");
            setResposta(null);
            setPergunta("");
          }
        }}
        titulo="Perguntar à IA"
        descricao="Pergunte sobre OS, horas, rentabilidade, financeiro ou manutenção."
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex.: quantas OS estão abertas?"
              onKeyDown={(e) => {
                if (e.key === "Enter") void perguntar(pergunta);
              }}
            />
            <Button type="button" onClick={() => void perguntar(pergunta)} disabled={estado === "processando"}>
              Perguntar
            </Button>
          </div>

          {estado === "processando" ? <Skeleton className="h-16 w-full" /> : null}

          {estado === "resultado" && resposta ? (
            <div className="rounded-lg border bg-surface/50 p-3 text-sm">
              <p className="text-foreground">{resposta.resposta}</p>
              {resposta.fonte_rota ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0 text-xs"
                  onClick={() => {
                    const rota = resposta.fonte_rota;
                    if (!rota) return;
                    setAberto(false);
                    void navigate({ to: rota });
                  }}
                >
                  Ver em {resposta.fonte_rotulo}
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Exemplos</p>
            <div className="flex flex-wrap gap-1.5">
              {PERGUNTAS_EXEMPLO.map((exemplo) => (
                <button
                  key={exemplo.pergunta}
                  type="button"
                  onClick={() => void perguntar(exemplo.pergunta)}
                  className="rounded-full border bg-surface px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  {exemplo.pergunta}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FormDialog>
    </>
  );
}
