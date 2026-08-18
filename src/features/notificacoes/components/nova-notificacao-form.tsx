import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { notificacoesRetaguardaStore } from "@/features/notificacoes/retaguarda-store";
import { preferenciasNotificacaoStore } from "@/features/notificacoes/preferencias-store";
import { PreviaNotificacao } from "@/features/notificacoes/components/previa-notificacao";
import type { CanalNotificacao, PrioridadeNotificacao } from "@/shared/types";
import { cn } from "@/lib/utils";

// "Nova notificação" do UI kit: aviso manual da retaguarda para o app de campo.
// Diferente de todo o resto das notificações, este não nasce de evento — daí o
// tipo `aviso_manual` e a categoria Sistema.

type Alvo = "todos" | "base" | "selecionados";
type EscolhaCanal = "app" | "push" | "ambos";

const ALVOS: { id: Alvo; label: string; icone: string }[] = [
  { id: "todos", label: "Todos os operadores", icone: "lucide:users" },
  { id: "base", label: "Por base", icone: "lucide:map-pin" },
  { id: "selecionados", label: "Selecionar operadores", icone: "lucide:hard-hat" },
];

const CANAIS_ESCOLHA: { id: EscolhaCanal; label: string; icone: string }[] = [
  { id: "app", label: "Somente in-app", icone: "lucide:bell" },
  { id: "push", label: "Somente push", icone: "lucide:smartphone" },
  { id: "ambos", label: "In-app + push", icone: "lucide:check" },
];

const PRIORIDADES: { id: PrioridadeNotificacao; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "alta", label: "Alta" },
  { id: "critico", label: "Crítico" },
];

const ACOES = ["Abrir OS", "Abrir checklist", "Confirmar leitura"];

const MAX_TITULO = 40;
const MAX_MENSAGEM = 120;

function canaisDe(escolha: EscolhaCanal): CanalNotificacao[] {
  if (escolha === "app") return ["app"];
  if (escolha === "push") return ["push"];
  return ["app", "push"];
}

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export function NovaNotificacaoForm({ onCancel, onSuccess }: Props) {
  const operadores = operadoresStore.useAll().filter((o) => o.ativo);
  const ordens = ordensStore.useTodas();
  const aparelhos = preferenciasNotificacaoStore.useAparelhos();

  const [alvo, setAlvo] = useState<Alvo>("todos");
  const [base, setBase] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [escolhaCanal, setEscolhaCanal] = useState<EscolhaCanal>("ambos");
  const [prioridade, setPrioridade] = useState<PrioridadeNotificacao>("normal");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [osId, setOsId] = useState("");
  const [acao, setAcao] = useState("");
  const [agendar, setAgendar] = useState(false);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);

  const bases = useMemo(
    () => [...new Set(operadores.map((o) => o.base).filter((b): b is string => Boolean(b)))].sort(),
    [operadores],
  );

  const destinos = useMemo(() => {
    if (alvo === "todos") return operadores;
    if (alvo === "base") return operadores.filter((o) => o.base === (base || bases[0]));
    return operadores.filter((o) => selecionados.includes(o.id));
  }, [alvo, base, bases, operadores, selecionados]);

  // Quem tem push instalado. Sem aparelho, o aviso só aparece quando a pessoa
  // abrir o app — e isso precisa estar dito antes de enviar, não depois.
  const comAparelho = useMemo(() => {
    const ids = new Set(aparelhos.map((a) => a.operador_id));
    return destinos.filter((o) => ids.has(o.id));
  }, [aparelhos, destinos]);

  const temPush = escolhaCanal !== "app";
  const semAparelho = temPush ? destinos.length - comAparelho.length : 0;

  const pronto =
    titulo.trim().length > 0 &&
    mensagem.trim().length > 0 &&
    destinos.length > 0 &&
    (!agendar || (data !== "" && hora !== ""));

  const enviar = async () => {
    if (!pronto) {
      toast.error("Informe título, mensagem e ao menos um destinatário.");
      return;
    }
    setEnviando(true);
    try {
      const total = await notificacoesRetaguardaStore.criarAvisoManual({
        operadorIds: destinos.map((o) => o.id),
        canais: canaisDe(escolhaCanal),
        prioridade,
        titulo,
        mensagem,
        os_id: osId || null,
        acao: acao || null,
        agendada_para: agendar ? new Date(`${data}T${hora}`).toISOString() : null,
      });
      toast.success(
        agendar
          ? `Aviso agendado para ${total} ${total === 1 ? "operador" : "operadores"}.`
          : `Aviso enviado para ${total} ${total === 1 ? "operador" : "operadores"}.`,
      );
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar o aviso.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Destinatários</CardTitle>
            <span className="rounded-full border bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-muted-foreground">
              {destinos.length} de {operadores.length}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Enviar para</Label>
              <div className="grid gap-1 rounded-lg border bg-surface p-1 sm:grid-cols-3">
                {ALVOS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAlvo(a.id)}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                      alvo === a.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon icon={a.icone} className="h-4 w-4" aria-hidden />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {alvo === "base" ? (
              <div className="space-y-1.5">
                <Label htmlFor="base">Base</Label>
                {bases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum operador tem base cadastrada.
                  </p>
                ) : (
                  <Select value={base || bases[0]} onValueChange={setBase}>
                    <SelectTrigger id="base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bases.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ) : null}

            {alvo === "selecionados" ? (
              <div className="space-y-1.5">
                <Label>Operadores</Label>
                <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-1">
                  {operadores.map((o) => {
                    const marcado = selecionados.includes(o.id);
                    const temAparelho = aparelhos.some((a) => a.operador_id === o.id);
                    return (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelecionados((s) =>
                              s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id],
                            )
                          }
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                            marcado ? "bg-primary/10" : "hover:bg-surface",
                          )}
                        >
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface font-mono text-[11px] font-semibold text-muted-foreground">
                            {o.nome.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-foreground">{o.nome}</span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {o.base ?? "sem base"}
                              {temAparelho ? "" : " · sem app"}
                            </span>
                          </span>
                          <Icon
                            icon={marcado ? "lucide:check" : "lucide:chevron-right"}
                            className={cn(
                              "h-4 w-4 shrink-0",
                              marcado ? "text-primary" : "text-foreground-faint",
                            )}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {semAparelho > 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-muted-foreground">
                <Icon icon="lucide:circle-alert" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  {semAparelho} {semAparelho === 1 ? "operador" : "operadores"} sem app instalado só
                  {semAparelho === 1 ? " verá" : " verão"} o aviso ao abrir o app de campo.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <div className="grid gap-1 rounded-lg border bg-surface p-1 sm:grid-cols-3">
                {CANAIS_ESCOLHA.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEscolhaCanal(c.id)}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                      escolhaCanal === c.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon icon={c.icone} className="h-4 w-4" aria-hidden />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <div className="grid grid-cols-3 gap-1 rounded-lg border bg-surface p-1">
                {PRIORIDADES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrioridade(p.id)}
                    className={cn(
                      "rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                      prioridade === p.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="titulo">Título *</Label>
                <span className="font-mono text-[11px] text-foreground-faint">
                  {titulo.length}/{MAX_TITULO}
                </span>
              </div>
              <Input
                id="titulo"
                maxLength={MAX_TITULO}
                placeholder="Ex.: Frente parada por chuva"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="mensagem">Mensagem *</Label>
                <span className="font-mono text-[11px] text-foreground-faint">
                  {mensagem.length}/{MAX_MENSAGEM}
                </span>
              </div>
              <Textarea
                id="mensagem"
                rows={3}
                maxLength={MAX_MENSAGEM}
                placeholder="Ex.: Não deslocar para o lote industrial hoje. Aguardar liberação do supervisor."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="vinculo">Vínculo com OS</Label>
                <Select
                  value={osId || "nenhum"}
                  onValueChange={(v) => setOsId(v === "nenhum" ? "" : v)}
                >
                  <SelectTrigger id="vinculo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem vínculo</SelectItem>
                    {ordens
                      .filter((o) => o.status !== "fechada")
                      .map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.numero} · {o.obra_nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="acao">Ação no app</Label>
                <Select
                  value={acao || "nenhuma"}
                  onValueChange={(v) => setAcao(v === "nenhuma" ? "" : v)}
                >
                  <SelectTrigger id="acao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Sem ação</SelectItem>
                    {ACOES.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Envio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-lg border bg-surface p-1">
              <button
                type="button"
                onClick={() => setAgendar(false)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  !agendar
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
                Enviar agora
              </button>
              <button
                type="button"
                onClick={() => setAgendar(true)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  agendar
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon icon="lucide:calendar" className="h-4 w-4" />
                Agendar
              </button>
            </div>

            {agendar ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    className="font-mono"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hora">Hora *</Label>
                  <Input
                    id="hora"
                    type="time"
                    className="font-mono"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => void enviar()}
                disabled={enviando || !pronto}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
                {enviando ? "Enviando…" : agendar ? "Agendar envio" : "Enviar aviso"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <PreviaNotificacao
        titulo={titulo}
        mensagem={mensagem}
        prioridade={prioridade}
        acao={acao}
        canais={canaisDe(escolhaCanal)}
        destinatarios={destinos.length}
        aparelhos={comAparelho.length}
        quando={agendar ? `${data || "dd/mm"} · ${hora || "--:--"}` : "Agora"}
        vinculo={ordens.find((o) => o.id === osId)?.numero ?? null}
      />
    </div>
  );
}
