import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import { ProvedoresIntegracoes } from "@/features/integracoes/components/provedores-integracoes";
import { parametrosStore } from "@/features/parametros/parametros-store";
import {
  CAMPOS_POR_CHAVE,
  SECOES,
  type CampoParametro,
  type ChaveParametro,
} from "@/features/parametros/campos";
import {
  chavesAlteradas,
  chavesInvalidas,
  formatarValor,
  paraFormulario,
  paraPatch,
  sujosPorSecao,
  type FormularioParametros,
} from "@/features/parametros/derivacoes";
import { SemEfeito } from "@/features/parametros/components/sem-efeito";
import { useUsuarioRetaguarda } from "@/features/auth/usuario-retaguarda";
import { cn } from "@/lib/utils";

// Edição dos parâmetros da plataforma — a tela `Configuracoes.jsx` do UI kit:
// navegação por seção com contador do que está sujo, diff ao vivo antes de
// salvar e card de registro. O diff compara o formulário atual contra o
// carregado, e só o que mudou vai no update.

export function ConfiguracoesPage() {
  const parametros = parametrosStore.useParametros();
  const { isLoading, error } = parametrosStore.useEstado();
  const usuario = useUsuarioRetaguarda();

  const [base, setBase] = useState<FormularioParametros | null>(null);
  const [valores, setValores] = useState<FormularioParametros | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState(SECOES[0].id);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  // Só ressincroniza o formulário quando o banco muda de versão (primeira carga
  // e depois de salvar) — assim uma revalidação da store não apaga a edição.
  const versaoSincronizada = useRef<number | null>(null);

  useEffect(() => {
    if (!parametros || versaoSincronizada.current === parametros.versao) return;
    const form = paraFormulario(parametros);
    versaoSincronizada.current = parametros.versao;
    setBase(form);
    setValores(form);
  }, [parametros]);

  if (isLoading || (!parametros && !error)) return <Carregando />;

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
      >
        <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button variant="outline" onClick={parametrosStore.retry} className="gap-2">
          <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!parametros || !base || !valores) return <Carregando />;

  const alteradas = chavesAlteradas(valores, base);
  const invalidas = chavesInvalidas(valores);
  const porSecao = sujosPorSecao(alteradas);
  const secao = SECOES.find((s) => s.id === secaoAtiva) ?? SECOES[0];

  const definir = (chave: ChaveParametro, valor: string | boolean) => {
    setValores((atual) => (atual ? { ...atual, [chave]: valor } : atual));
    setSalvo(false);
  };

  const descartar = () => {
    setValores(base);
    setSalvo(false);
  };

  const salvar = async () => {
    if (invalidas.length > 0) {
      toast.error("Há campos numéricos vazios ou inválidos.");
      return;
    }
    setSalvando(true);
    try {
      await parametrosStore.salvar(paraPatch(valores, base));
      setSalvo(true);
      toast.success(
        alteradas.length === 1 ? "Parâmetro salvo." : `${alteradas.length} parâmetros salvos.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/parametros"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        Parâmetros
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Configurações
        </h1>
        <CardPill>plataforma</CardPill>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <EstadoChip pendentes={alteradas.length} salvo={salvo} invalidas={invalidas.length > 0} />
          <Button
            variant="ghost"
            className="gap-2"
            disabled={alteradas.length === 0 || salvando}
            onClick={descartar}
          >
            <Icon icon="lucide:ban" className="h-4 w-4" />
            Descartar
          </Button>
          <Button
            className="gap-2"
            disabled={alteradas.length === 0 || salvando || invalidas.length > 0}
            onClick={salvar}
          >
            <Icon
              icon={salvando ? "lucide:loader-circle" : "lucide:check"}
              className={cn("h-4 w-4", salvando && "animate-spin")}
            />
            Salvar alterações
          </Button>
        </div>
      </div>

      {/* Navegação de seções */}
      <nav className="flex flex-wrap gap-1.5 rounded-xl border bg-card p-2 shadow-sm">
        {SECOES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSecaoAtiva(s.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              s.id === secaoAtiva
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            <Icon icon={s.icone} className="h-4 w-4" />
            {s.rotulo}
            {porSecao[s.id] > 0 ? (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {porSecao[s.id]}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <CardSecao
            titulo={secao.rotulo}
            icone={secao.icone}
            acessorio={<CardPill>{secao.campos.length + secao.toggles.length} parâmetros</CardPill>}
            bodyClassName="space-y-5 p-4"
          >
            <p className="text-sm text-muted-foreground">{secao.descricao}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {secao.campos.map((campo) => (
                <Campo
                  key={campo.chave}
                  campo={campo}
                  valor={String(valores[campo.chave])}
                  sujo={valores[campo.chave] !== base[campo.chave]}
                  invalido={invalidas.includes(campo.chave)}
                  onChange={(v) => definir(campo.chave, v)}
                />
              ))}
            </div>

            {secao.toggles.length > 0 ? (
              <div className="divide-y rounded-xl border">
                {secao.toggles.map((toggle) => (
                  <div key={toggle.chave} className="flex items-center gap-4 p-3.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {toggle.rotulo}
                        <SemEfeito chave={toggle.chave} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{toggle.descricao}</div>
                    </div>
                    <Switch
                      className="ml-auto shrink-0"
                      aria-label={toggle.rotulo}
                      disabled={toggle.indisponivel}
                      checked={valores[toggle.chave] === true}
                      onCheckedChange={(v) => definir(toggle.chave, v)}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {/* Os provedores externos e a conexão do WhatsApp moram nesta seção
                desde que /admin/integracoes foi absorvida aqui. */}
            {secao.id === "integracoes" ? <ProvedoresIntegracoes /> : null}
          </CardSecao>

          <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
            <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Parâmetros valem para <strong className="text-foreground">toda a plataforma</strong> —
              retaguarda e app de campo. Alterações em custos e preços recalculam o{" "}
              <strong className="text-foreground">Custo da Hora</strong> e a{" "}
              <strong className="text-foreground">Rentabilidade</strong> a partir do mês vigente;
              meses fechados não são reprocessados.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <CardSecao
            titulo="Alterações pendentes"
            icone="lucide:history"
            acessorio={alteradas.length > 0 ? <CardPill>{alteradas.length}</CardPill> : undefined}
            bodyClassName="p-4"
          >
            {alteradas.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Icon icon="lucide:circle-check-big" className="h-6 w-6 text-success" />
                <span className="text-sm text-muted-foreground">
                  {salvo
                    ? "Tudo salvo. Registro atualizado."
                    : "Nenhuma alteração desde o último salvamento."}
                </span>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {alteradas.map((chave) => (
                  <li key={chave} className="space-y-0.5 text-sm">
                    <div className="text-xs text-muted-foreground">
                      {CAMPOS_POR_CHAVE.get(chave)?.secao}
                    </div>
                    <div className="font-medium text-foreground">
                      {CAMPOS_POR_CHAVE.get(chave)?.rotulo ?? chave}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <s className="text-foreground-faint">{formatarValor(chave, base[chave])}</s>
                      <Icon
                        icon="lucide:chevron-right"
                        className="h-3.5 w-3.5 text-foreground-faint"
                      />
                      <strong className="font-medium text-primary">
                        {formatarValor(chave, valores[chave])}
                      </strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardSecao>

          <CardSecao titulo="Registro" icone="lucide:database" bodyClassName="px-4 py-1.5">
            <DataRow icone="lucide:clock" rotulo="Última alteração">
              {new Date(parametros.updated_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </DataRow>
            <DataRow icone="lucide:contact" rotulo="Autor">
              {parametros.atualizado_por ? (usuario?.nome ?? "Retaguarda") : "—"}
            </DataRow>
            <DataRow icone="lucide:archive" rotulo="Versão dos parâmetros">
              <span className="font-mono">v{parametros.versao}</span> ·{" "}
              <small className="text-muted-foreground">histórico mantido</small>
            </DataRow>
            <DataRow icone="lucide:lock" rotulo="Permissão de edição">
              Retaguarda · <small className="text-muted-foreground">recepção e proprietário</small>
            </DataRow>
          </CardSecao>
        </div>
      </div>
    </div>
  );
}

function EstadoChip({
  pendentes,
  salvo,
  invalidas,
}: {
  pendentes: number;
  salvo: boolean;
  invalidas: boolean;
}) {
  if (invalidas) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
        <Icon icon="lucide:triangle-alert" className="h-3.5 w-3.5" />
        Campo inválido
      </span>
    );
  }
  if (pendentes > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        {pendentes === 1 ? "1 alteração não salva" : `${pendentes} alterações não salvas`}
      </span>
    );
  }
  if (salvo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
        <Icon icon="lucide:check" className="h-3.5 w-3.5" />
        Parâmetros salvos
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      Sem alterações
    </span>
  );
}

function Campo({
  campo,
  valor,
  sujo,
  invalido,
  onChange,
}: {
  campo: CampoParametro;
  valor: string;
  sujo: boolean;
  invalido: boolean;
  onChange: (valor: string) => void;
}) {
  const id = `parametro-${campo.chave}`;

  return (
    <div className={cn("space-y-1.5", campo.larguraDupla && "sm:col-span-2")}>
      <label
        htmlFor={id}
        className="flex items-center gap-1 font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint"
      >
        {campo.rotulo}
        {sujo ? <span className="text-primary">•</span> : null}
        <SemEfeito chave={campo.chave} />
      </label>

      {campo.tipo === "select" ? (
        <Select value={valor} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {campo.opcoes?.map((o) => (
              <SelectItem key={o.valor} value={o.valor}>
                {o.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : campo.unidade ? (
        <div className="flex items-center gap-2">
          <Input
            id={id}
            inputMode="decimal"
            className={cn("font-mono", invalido && "border-destructive")}
            value={valor}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="shrink-0 text-xs text-muted-foreground">{campo.unidade}</span>
        </div>
      ) : (
        <Input
          id={id}
          type={campo.tipo === "hora" ? "time" : "text"}
          className={cn(
            (campo.tipo === "mono" || campo.tipo === "hora") && "font-mono",
            invalido && "border-destructive",
          )}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {campo.dica ? <p className="text-xs text-muted-foreground">{campo.dica}</p> : null}
    </div>
  );
}

function Carregando() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
