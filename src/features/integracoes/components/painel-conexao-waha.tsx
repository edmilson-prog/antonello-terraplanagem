import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useWahaSessao, type StatusSessaoWaha } from "@/features/integracoes/use-waha-sessao";

const STATUS_LABEL: Record<StatusSessaoWaha, string> = {
  STOPPED: "Desconectado",
  STARTING: "Iniciando…",
  SCAN_QR_CODE: "Aguardando leitura do QR code",
  WORKING: "Conectado",
  FAILED: "Falha na conexão",
};

// Verde: conectado. Âmbar: em progresso (iniciando / aguardando QR) — normal
// durante a primeira conexão. Vermelho: parado ou falha.
const STATUS_DOT_CLASS: Record<StatusSessaoWaha, string> = {
  STOPPED: "bg-destructive",
  STARTING: "bg-primary",
  SCAN_QR_CODE: "bg-primary",
  WORKING: "bg-secondary",
  FAILED: "bg-destructive",
};

export function PainelConexaoWaha() {
  const { status, numero, qr, carregando, erro, conectar, desconectar } = useWahaSessao();

  if (carregando) {
    return <p className="text-sm text-muted-foreground">Verificando conexão…</p>;
  }

  if (erro) {
    return <p className="text-sm text-destructive">{erro}</p>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[status]}`} />
        {STATUS_LABEL[status]}
        {numero ? <span className="text-muted-foreground">— {numero}</span> : null}
      </div>

      {status === "WORKING" ? (
        <Button variant="outline" size="sm" onClick={desconectar} className="gap-1.5">
          <Icon icon="lucide:log-out" className="h-4 w-4" />
          Desconectar
        </Button>
      ) : (
        <div className="space-y-3">
          <Button size="sm" onClick={conectar} className="gap-1.5">
            <Icon icon="lucide:qr-code" className="h-4 w-4" />
            Conectar
          </Button>
          {qr ? (
            <img
              src={qr}
              alt="QR code para conectar o WhatsApp"
              className="h-48 w-48 rounded-lg border"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
