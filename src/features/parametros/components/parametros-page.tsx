import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/shared/components/page-header";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import { EmptyState } from "@/shared/components/empty-state";
import { parametrosStore } from "@/features/parametros/parametros-store";
import { formatarHora } from "@/features/parametros/derivacoes";
import { HistoricoParametrosDialog } from "@/features/parametros/components/historico-parametros-dialog";
import { SemEfeito } from "@/features/parametros/components/sem-efeito";
import type { Parametros } from "@/shared/types";

const APROVACAO_LABEL: Record<string, string> = {
  supervisor: "Supervisor",
  encarregado: "Encarregado de obra",
  automatica: "Automática",
};

const RECEBIMENTO_LABEL: Record<string, string> = {
  pix: "PIX",
  boleto: "Boleto",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  cheque: "Cheque",
  outro: "Outro",
};

const num = (valor: number, casas = 1) =>
  valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

function Ligado({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={
        ativo
          ? "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success"
          : "inline-flex items-center gap-1.5 rounded-full border bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ativo ? "bg-success" : "bg-foreground-faint"}`}
      />
      {ativo ? "Ativado" : "Desativado"}
    </span>
  );
}

const Fraco = ({ children }: { children: React.ReactNode }) => (
  <small className="text-muted-foreground">{children}</small>
);

const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono">{children}</span>
);

const vazio = "—";

export function ParametrosPage() {
  const parametros = parametrosStore.useParametros();
  const { isLoading, error } = parametrosStore.useEstado();
  const [historicoAberto, setHistoricoAberto] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Parâmetros"
        descricao="Configurações que valem para toda a plataforma — retaguarda e app de campo."
        acoes={
          <>
            <Button
              variant="ghost"
              className="gap-2"
              disabled={!parametros}
              onClick={() => setHistoricoAberto(true)}
            >
              <Icon icon="lucide:history" className="h-4 w-4" />
              Histórico de alterações
            </Button>
            <Button asChild className="gap-2">
              <Link to="/admin/parametros/editar">
                <Icon icon="lucide:pencil" className="h-4 w-4" />
                Editar parâmetros
              </Link>
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
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
      ) : !parametros ? (
        <EmptyState
          icon="lucide:sliders-horizontal"
          titulo="Nenhum parâmetro configurado"
          descricao="A linha de parâmetros da plataforma ainda não foi criada no banco."
        />
      ) : (
        <>
          <Cards parametros={parametros} />
          <HistoricoParametrosDialog aberto={historicoAberto} onFechar={setHistoricoAberto} />
        </>
      )}
    </div>
  );
}

function Cards({ parametros: p }: { parametros: Parametros }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <CardSecao
          titulo="Empresa"
          icone="lucide:building-2"
          acessorio={<CardPill>v{p.versao}</CardPill>}
          bodyClassName="px-4 py-1.5"
        >
          <DataRow icone="lucide:building-2" rotulo="Razão social">
            {p.razao_social || vazio}
          </DataRow>
          <DataRow icone="lucide:id-card" rotulo="CNPJ">
            <Mono>{p.cnpj || vazio}</Mono>
          </DataRow>
          <DataRow icone="lucide:map-pin" rotulo="Sede">
            {p.sede || vazio}
          </DataRow>
          <DataRow icone="lucide:phone" rotulo="Telefone">
            <Mono>{p.telefone || vazio}</Mono>
          </DataRow>
        </CardSecao>

        <CardSecao titulo="Operação" icone="lucide:clipboard-list" bodyClassName="px-4 py-1.5">
          <DataRow icone="lucide:clock" rotulo="Jornada padrão">
            <Mono>{num(p.jornada_horas)} h</Mono> · <Fraco>por dia útil</Fraco>{" "}
            <SemEfeito chave="jornada_horas" />
          </DataRow>
          <DataRow icone="lucide:gauge" rotulo="Tolerância de horímetro">
            <Mono>± {num(p.tolerancia_horimetro, 2)} h</Mono>{" "}
            <SemEfeito chave="tolerancia_horimetro" />
          </DataRow>
          <DataRow icone="lucide:wrench" rotulo="Alerta de manutenção">
            <Mono>{num(p.alerta_manutencao_horas, 0)} h</Mono> · <Fraco>antes do plano</Fraco>
          </DataRow>
          <DataRow icone="lucide:fuel" rotulo="Diesel — tanque interno">
            <Mono>R$ {num(p.diesel_preco_litro, 2)}/L</Mono>{" "}
            <SemEfeito chave="diesel_preco_litro" />
          </DataRow>
        </CardSecao>

        <CardSecao titulo="Custo da Hora" icone="lucide:calculator" bodyClassName="px-4 py-1.5">
          <DataRow icone="lucide:history" rotulo="Depreciação padrão">
            <Mono>{num(p.depreciacao_anual_pct, 0)}% a.a.</Mono>{" "}
            <SemEfeito chave="depreciacao_anual_pct" />
          </DataRow>
          <DataRow icone="lucide:hard-hat" rotulo="Custo do operador">
            <Mono>R$ {num(p.custo_operador_hora, 2)}/h</Mono>{" "}
            <SemEfeito chave="custo_operador_hora" />
          </DataRow>
          <DataRow icone="lucide:trending-up" rotulo="Margem mínima">
            <Mono>{num(p.margem_minima_pct, 0)}%</Mono> · <Fraco>alerta abaixo disso</Fraco>
          </DataRow>
          <DataRow icone="lucide:timer" rotulo="Horas/mês de referência">
            <Mono>{num(p.horas_mes_referencia, 0)} h</Mono> · <Fraco>rateio do custo fixo</Fraco>
          </DataRow>
        </CardSecao>
      </div>

      <div className="space-y-4">
        <CardSecao
          titulo="Faturamento & financeiro"
          icone="lucide:file-check"
          bodyClassName="px-4 py-1.5"
        >
          <DataRow icone="lucide:calendar" rotulo="Vencimento padrão">
            <Mono>{p.vencimento_dias} dias</Mono> · <Fraco>após emissão da NF</Fraco>{" "}
            <SemEfeito chave="vencimento_dias" />
          </DataRow>
          <DataRow icone="lucide:wallet" rotulo="Juros e multa">
            <Mono>
              {num(p.juros_mes_pct)}% a.m. + {num(p.multa_atraso_pct)}%
            </Mono>{" "}
            <SemEfeito chave="juros_mes_pct" />
          </DataRow>
          <DataRow icone="lucide:file-text" rotulo="Série de NF">
            <Mono>Série {p.nf_serie || vazio}</Mono> <SemEfeito chave="nf_serie" />
          </DataRow>
          <DataRow icone="lucide:credit-card" rotulo="Recebimento padrão">
            {RECEBIMENTO_LABEL[p.recebimento_padrao] ?? p.recebimento_padrao}
            {p.chave_pix ? (
              <>
                {" · "}
                <Fraco>{p.chave_pix}</Fraco>
              </>
            ) : null}
          </DataRow>
        </CardSecao>

        <CardSecao
          titulo="App de campo & acesso"
          icone="lucide:smartphone"
          bodyClassName="px-4 py-1.5"
        >
          <DataRow icone="lucide:smartphone" rotulo="Apontamento via app">
            <Ligado ativo={p.apontamento_via_app} /> <SemEfeito chave="apontamento_via_app" />
          </DataRow>
          <DataRow icone="lucide:check" rotulo="Aprovação de apontamentos">
            {APROVACAO_LABEL[p.aprovacao_apontamento] ?? p.aprovacao_apontamento} ·{" "}
            <Fraco>fecha o dia às {formatarHora(p.fechamento_dia)}</Fraco>{" "}
            <SemEfeito chave="aprovacao_apontamento" />
          </DataRow>
          <DataRow icone="lucide:lock" rotulo="Particionamento financeiro">
            <Ligado ativo={p.particionamento_financeiro} />{" "}
            <SemEfeito chave="particionamento_financeiro" />
          </DataRow>
        </CardSecao>

        <div className="flex items-start gap-3 rounded-xl border border-dashed bg-surface/60 p-4 text-sm text-muted-foreground">
          <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Alterar parâmetros recalcula o{" "}
            <strong className="text-foreground">Custo da Hora</strong> e a{" "}
            <strong className="text-foreground">Rentabilidade</strong> a partir do mês vigente —
            meses fechados não são reprocessados.
          </p>
        </div>
      </div>
    </div>
  );
}
