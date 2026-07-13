import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataListProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  empty: { icon?: string; titulo: string; descricao: string; cta?: ReactNode };
  toolbar?: ReactNode;
  rowActions?: (item: T) => ReactNode;
}

export function DataList<T>({
  data,
  columns,
  getRowKey,
  renderCard,
  isLoading,
  error,
  onRetry,
  empty,
  toolbar,
  rowActions,
}: DataListProps<T>) {
  return (
    <div className="space-y-4">
      {toolbar}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-surface/60 px-6 py-16 text-center"
        >
          <Icon icon="lucide:triangle-alert" className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <Icon icon="lucide:rotate-cw" className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={empty.icon}
          titulo={empty.titulo}
          descricao={empty.descricao}
          acao={empty.cta}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                  {columns.map((c) => (
                    <th
                      key={c.header}
                      scope="col"
                      className={cn("px-4 py-3 font-medium", c.headerClassName)}
                    >
                      {c.header}
                    </th>
                  ))}
                  {rowActions ? (
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Ações
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={getRowKey(item)}
                    className="border-b last:border-b-0 hover:bg-surface/50"
                  >
                    {columns.map((c) => (
                      <td key={c.header} className={cn("px-4 py-3 align-middle", c.className)}>
                        {c.cell(item)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-4 py-3 text-right">{rowActions(item)}</td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {data.map((item) => (
              <li key={getRowKey(item)}>{renderCard(item)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
