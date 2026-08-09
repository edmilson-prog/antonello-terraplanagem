import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { clientesStore } from "@/features/clientes/clientes-store";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { orcamentosStore } from "@/features/orcamentos/orcamentos-store";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { proximoNumeroOS } from "@/features/ordem-servico/numero-os";
import {
  TIPO_SERVICO_LABEL,
  SEM_RESPONSAVEL,
  SEM_EQUIPAMENTO,
  SEM_ORCAMENTO,
} from "@/features/ordem-servico/labels";
import { TIPO_ICONE } from "@/features/equipamentos/labels";
import { formatBRL } from "@/features/retaguarda/format";
import { formatData } from "@/shared/lib/format";
import type { OrdemFormValues } from "@/features/ordem-servico/ordem-schema";

function Linha({ rotulo, valor, vazio }: { rotulo: string; valor: string; vazio?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className={vazio ? "text-foreground-faint" : "font-medium text-foreground"}>
        {valor}
      </span>
    </div>
  );
}

// Painel de resumo ao vivo da criação de OS — lê o formulário via useWatch
// (mesmo `control` do OrdemForm) e não persiste nada por conta própria.
export function ResumoNovaOrdem({ control }: { control: Control<OrdemFormValues> }) {
  const valores = useWatch({ control });
  const cliente = valores.cliente_id ? clientesStore.getById(valores.cliente_id) : undefined;
  const responsavel =
    valores.responsavel_id && valores.responsavel_id !== SEM_RESPONSAVEL
      ? operadoresStore.getById(valores.responsavel_id)
      : undefined;
  const equipamento =
    valores.equipamento_previsto_id && valores.equipamento_previsto_id !== SEM_EQUIPAMENTO
      ? equipamentosStore.getById(valores.equipamento_previsto_id)
      : undefined;
  const orcamento =
    valores.orcamento_id && valores.orcamento_id !== SEM_ORCAMENTO
      ? orcamentosStore.obter(valores.orcamento_id)
      : undefined;
  const numero = proximoNumeroOS(ordensStore.listar(), new Date().getFullYear());

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon
              icon={equipamento ? TIPO_ICONE[equipamento.tipo] : "lucide:clipboard-list"}
              className="h-6 w-6"
            />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold text-primary">{numero}</div>
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.obra_nome?.trim() || "Nova ordem de serviço"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha rotulo="Cliente" valor={cliente?.nome ?? "a definir"} vazio={!cliente} />
          <Linha
            rotulo="Tipo"
            valor={valores.tipo_servico ? TIPO_SERVICO_LABEL[valores.tipo_servico] : "a definir"}
            vazio={!valores.tipo_servico}
          />
          <Linha
            rotulo="Equipamento"
            valor={equipamento?.nome ?? "a definir"}
            vazio={!equipamento}
          />
          <Linha
            rotulo="Responsável"
            valor={responsavel?.nome ?? "a definir"}
            vazio={!responsavel}
          />
          <Linha
            rotulo="Início"
            valor={valores.inicio_previsto ? formatData(valores.inicio_previsto) : "a definir"}
            vazio={!valores.inicio_previsto}
          />
          <Linha rotulo="Orçamento" valor={orcamento?.numero ?? "nenhum"} vazio={!orcamento} />
          <Linha
            rotulo="Valor previsto"
            valor={orcamento ? formatBRL(orcamento.valor_total) : "a definir"}
            vazio={!orcamento}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:smartphone" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Ao abrir a OS, ela aparece no <strong className="text-foreground">app de campo</strong> do
          operador — os apontamentos por horímetro passam a chegar em tempo real.
        </p>
      </div>
    </div>
  );
}
