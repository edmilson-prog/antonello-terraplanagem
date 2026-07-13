import { Icon } from "@iconify/react";
import { PageHeader } from "@/shared/components/page-header";
import { ChatbotSimulador } from "@/features/ia/components/chatbot-simulador";

const INTENTS_CONFIGURADAS = [
  { id: "status_obra", label: "Status da obra" },
  { id: "segunda_via", label: "2ª via de cobrança" },
  { id: "confirmacao_servico", label: "Confirmação de serviço" },
];

export function ChatbotConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Chatbot WhatsApp (Simulador)"
        descricao="Configuração de intents e simulador de conversa — envio real ao cliente fica para a Fase 4 (PRD-009)."
      />
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Intents configuradas
        </h2>
        <ul className="mt-3 space-y-2">
          {INTENTS_CONFIGURADAS.map((intent) => (
            <li key={intent.id} className="flex items-center gap-2 text-sm text-foreground">
              <Icon icon="lucide:check-circle-2" className="h-4 w-4 text-primary" />
              {intent.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Tom de voz: cordial e direto, sem gírias.
        </p>
      </section>
      <ChatbotSimulador />
    </div>
  );
}
