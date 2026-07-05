import { PageHeader } from "@/shared/components/page-header";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProvedorGatewayAtivo } from "@/features/integracoes/use-provedor-gateway";
import { useProvedorWhatsAppAtivo } from "@/features/integracoes/use-provedor-whatsapp";
import { PROVEDOR_GATEWAY_LABEL } from "@/features/cobranca-gateway/labels";
import { PROVEDOR_WHATSAPP_LABEL } from "@/features/aviso-whatsapp/labels";
import type { ProvedorGateway, ProvedorWhatsApp } from "@/shared/types";

const PROVEDORES_GATEWAY: ProvedorGateway[] = ["mercado_pago", "asaas"];
const PROVEDORES_WHATSAPP: ProvedorWhatsApp[] = [
  "evolution_api",
  "evolution_go",
  "meta_cloud_api",
  "openwa",
];

export function IntegracoesPage() {
  const { provedor, setProvedor } = useProvedorGatewayAtivo();
  const { provedor: provedorWhatsApp, setProvedor: setProvedorWhatsApp } =
    useProvedorWhatsAppAtivo();

  return (
    <div className="space-y-6">
      <PageHeader titulo="Integrações" descricao="Provedores externos usados pela plataforma" />

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          Gateway de Cobrança
        </h3>
        <p className="text-sm text-muted-foreground">
          Provedor padrão sugerido ao emitir uma nova cobrança (boleto/PIX). Pode ser trocado a cada
          emissão.
        </p>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="provedor-gateway-ativo">Provedor padrão</Label>
          <Select value={provedor} onValueChange={(v) => setProvedor(v as ProvedorGateway)}>
            <SelectTrigger id="provedor-gateway-ativo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVEDORES_GATEWAY.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVEDOR_GATEWAY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground-faint">
          WhatsApp
        </h3>
        <p className="text-sm text-muted-foreground">
          Provedor padrão usado para avisar o cliente quando uma OS é fechada.
        </p>
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="provedor-whatsapp-ativo">Provedor padrão</Label>
          <Select
            value={provedorWhatsApp}
            onValueChange={(v) => setProvedorWhatsApp(v as ProvedorWhatsApp)}
          >
            <SelectTrigger id="provedor-whatsapp-ativo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVEDORES_WHATSAPP.map((p) => (
                <SelectItem key={p} value={p}>
                  {PROVEDOR_WHATSAPP_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
