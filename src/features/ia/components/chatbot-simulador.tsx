import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientesStore } from "@/features/clientes/clientes-store";
import { responderChatbotCliente } from "@/features/ia/mock/atendimento";
import { cn } from "@/lib/utils";

interface Mensagem {
  autor: "cliente" | "bot";
  texto: string;
}

export function ChatbotSimulador() {
  const clientes = clientesStore.useAll().filter((c) => c.ativo);
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? "");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!texto.trim() || !clienteId) return;
    const minhaMensagem: Mensagem = { autor: "cliente", texto };
    setMensagens((atual) => [...atual, minhaMensagem]);
    setTexto("");
    setEnviando(true);
    const resposta = await responderChatbotCliente(minhaMensagem.texto, clienteId);
    setMensagens((atual) => [...atual, { autor: "bot", texto: resposta }]);
    setEnviando(false);
  }

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
        Simulador de conversa
      </h2>
      <div className="mt-3">
        <Select
          value={clienteId}
          onValueChange={(v) => {
            setClienteId(v);
            setMensagens([]);
          }}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Simular como cliente..." />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 h-64 space-y-2 overflow-y-auto rounded-md border bg-surface/30 p-3">
        {mensagens.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Envie uma mensagem como se fosse o cliente — ex.: "qual o status da minha obra?"
          </p>
        ) : (
          mensagens.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                m.autor === "cliente" ? "ml-auto bg-primary text-primary-foreground" : "bg-surface text-foreground",
              )}
            >
              {m.texto}
            </div>
          ))
        )}
        {enviando ? <Skeleton className="h-8 w-2/3" /> : null}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Mensagem do cliente..."
          onKeyDown={(e) => {
            if (e.key === "Enter") void enviar();
          }}
          disabled={!clienteId}
        />
        <Button type="button" onClick={() => void enviar()} disabled={enviando || !clienteId}>
          Enviar
        </Button>
      </div>
    </section>
  );
}
