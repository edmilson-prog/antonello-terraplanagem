import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parametrosStore } from "@/features/parametros/parametros-store";
import { formatarValor, rotuloDoCampo } from "@/features/parametros/derivacoes";
import type { ChaveParametro } from "@/features/parametros/campos";
import type { ParametroAlteracao } from "@/shared/types";

// Histórico das alterações de parâmetros. As linhas vêm do trigger no banco,
// não do cliente — então nenhuma alteração escapa, inclusive as feitas fora da
// tela. Mesmo espírito do "Tabelas anteriores" de Preços (Onda 9).

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Agrupa por versão: um "salvar" com 3 campos vira um bloco, não 3 linhas soltas. */
function porVersao(entradas: ParametroAlteracao[]) {
  const grupos = new Map<number, ParametroAlteracao[]>();
  for (const entrada of entradas) {
    const atual = grupos.get(entrada.versao);
    if (atual) atual.push(entrada);
    else grupos.set(entrada.versao, [entrada]);
  }
  return [...grupos.entries()].sort((a, b) => b[0] - a[0]);
}

export function HistoricoParametrosDialog({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: (aberto: boolean) => void;
}) {
  const [entradas, setEntradas] = useState<ParametroAlteracao[] | null>(null);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    if (!aberto) return;
    let cancelado = false;
    setEntradas(null);
    setErro(null);
    parametrosStore
      .carregarHistorico()
      .then((dados) => {
        if (!cancelado) setEntradas(dados);
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof Error ? e : new Error(String(e)));
      });
    return () => {
      cancelado = true;
    };
  }, [aberto]);

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de alterações</DialogTitle>
          <DialogDescription>
            Cada salvamento gera uma versão. O registro é gravado pelo banco, não pela tela.
          </DialogDescription>
        </DialogHeader>

        {erro ? (
          <div role="alert" className="space-y-3 py-6 text-center">
            <Icon icon="lucide:triangle-alert" className="mx-auto h-7 w-7 text-destructive" />
            <p className="text-sm text-muted-foreground">{erro.message}</p>
            <Button variant="outline" size="sm" onClick={() => onFechar(false)}>
              Fechar
            </Button>
          </div>
        ) : entradas === null ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : entradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Icon icon="lucide:history" className="h-8 w-8 text-foreground-faint" />
            <p className="text-sm font-medium text-foreground">Nenhuma alteração ainda</p>
            <p className="text-sm text-muted-foreground">
              Os parâmetros seguem como foram criados.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {porVersao(entradas).map(([versao, linhas]) => (
              <li key={versao} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-baseline gap-2 border-b pb-2">
                  <span className="font-mono text-sm font-semibold text-foreground">v{versao}</span>
                  <span className="text-xs text-muted-foreground">
                    {dataHora(linhas[0].alterado_em)}
                  </span>
                  <span className="ml-auto text-xs text-foreground-faint">
                    {linhas.length === 1 ? "1 campo" : `${linhas.length} campos`}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {linhas.map((linha) => (
                    <li
                      key={linha.id}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
                    >
                      <span className="text-muted-foreground">{rotuloDoCampo(linha.campo)}</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        <s className="text-foreground-faint">
                          {formatarValor(linha.campo as ChaveParametro, linha.valor_anterior)}
                        </s>
                        <Icon
                          icon="lucide:chevron-right"
                          className="h-3.5 w-3.5 text-foreground-faint"
                        />
                        <strong className="font-medium text-foreground">
                          {formatarValor(linha.campo as ChaveParametro, linha.valor_novo)}
                        </strong>
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
