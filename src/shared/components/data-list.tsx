import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { useColumnWidths, LARGURA_MINIMA_COLUNA } from "@/shared/hooks/use-column-widths";
import { cn } from "@/lib/utils";

/** Header da coluna de ações — participa do redimensionamento como as demais. */
const HEADER_ACOES = "Ações";
const PASSO_TECLADO = 16;
const PASSO_TECLADO_RAPIDO = 48;

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
  /**
   * Ativa colunas com largura ajustável pelo usuário (arrastar a borda do cabeçalho).
   * O valor é a chave de persistência no localStorage — use algo estável por lista,
   * ex.: "admin-ordens".
   */
  resizableKey?: string;
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
  resizableKey,
}: DataListProps<T>) {
  const redimensionavel = Boolean(resizableKey);
  const { ajustes, temAjustes, definir, persistir, limpar } = useColumnWidths(resizableKey);

  // Larguras naturais medidas na primeira renderização da tabela: servem de base
  // enquanto o usuário não arrasta nada, e de valor de reset no duplo clique.
  // A medição carrega a chave das colunas — se elas mudarem, ela é descartada.
  const [medicao, setMedicao] = useState<{
    chave: string;
    larguras: Record<string, number>;
  } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const larguraWrapperRef = useRef(0);
  const thRefs = useRef(new Map<string, HTMLTableCellElement>());

  const headers = useMemo(
    () => [...columns.map((c) => c.header), ...(rowActions ? [HEADER_ACOES] : [])],
    [columns, rowActions],
  );
  const headersKey = headers.join("|");

  const registrarTh = useCallback(
    (header: string) => (el: HTMLTableCellElement | null) => {
      if (el) thRefs.current.set(header, el);
      else thRefs.current.delete(header);
    },
    [],
  );

  const naturais = medicao && medicao.chave === headersKey ? medicao.larguras : null;

  // Mede o cabeçalho renderizado em layout automático e congela essas larguras.
  useLayoutEffect(() => {
    if (!redimensionavel || naturais !== null) return;
    const medidas: Record<string, number> = {};
    for (const header of headers) {
      const el = thRefs.current.get(header);
      if (!el) return;
      const largura = Math.floor(el.getBoundingClientRect().width);
      // Sem layout real (jsdom, tabela oculta): segue com larguras automáticas.
      if (largura <= 0) return;
      medidas[header] = largura;
    }
    larguraWrapperRef.current = Math.round(wrapperRef.current?.getBoundingClientRect().width ?? 0);
    setMedicao({ chave: headersKey, larguras: medidas });
  }, [redimensionavel, naturais, headers, headersKey, isLoading, error, data.length]);

  // Enquanto o usuário não ajustou nada, a tabela continua acompanhando a janela.
  useEffect(() => {
    if (!redimensionavel || temAjustes) return;
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const largura = Math.round(el.getBoundingClientRect().width);
      if (largura === larguraWrapperRef.current) return;
      larguraWrapperRef.current = largura;
      setMedicao(null);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [redimensionavel, temAjustes]);

  const larguras = useMemo(() => {
    if (!redimensionavel || !naturais) return null;
    const efetivas: Record<string, number> = {};
    for (const header of headers) {
      efetivas[header] = ajustes[header] ?? naturais[header] ?? LARGURA_MINIMA_COLUNA;
    }
    return efetivas;
  }, [redimensionavel, naturais, ajustes, headers]);

  const larguraTotal = larguras ? headers.reduce((soma, h) => soma + larguras[h], 0) : 0;

  const iniciarArrasto = (e: ReactPointerEvent<HTMLSpanElement>, header: string) => {
    if (e.button !== 0 || !larguras) return;
    e.preventDefault();
    const inicioX = e.clientX;
    const inicioLargura = larguras[header];

    const mover = (ev: PointerEvent) => definir(header, inicioLargura + ev.clientX - inicioX);
    const soltar = () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
      document.body.classList.remove("select-none", "cursor-col-resize");
      persistir();
    };

    document.body.classList.add("select-none", "cursor-col-resize");
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
  };

  const ajustarPorTeclado = (e: ReactKeyboardEvent<HTMLSpanElement>, header: string) => {
    if (!larguras) return;
    const passo = e.shiftKey ? PASSO_TECLADO_RAPIDO : PASSO_TECLADO;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      definir(header, larguras[header] + (e.key === "ArrowRight" ? passo : -passo));
      persistir();
    } else if (e.key === "Home" || e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      limpar(header);
    }
  };

  const alcaDe = (header: string) => {
    if (!larguras) return null;
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        aria-label={`Ajustar largura da coluna ${header}`}
        title="Arraste para ajustar · duplo clique restaura"
        tabIndex={0}
        onPointerDown={(e) => iniciarArrasto(e, header)}
        onDoubleClick={() => limpar(header)}
        onKeyDown={(e) => ajustarPorTeclado(e, header)}
        className="group absolute right-0 top-0 z-10 flex h-full w-3 translate-x-1/2 cursor-col-resize touch-none items-center justify-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="h-1/2 w-px bg-border transition-all group-hover:h-full group-hover:w-0.5 group-hover:bg-primary" />
      </span>
    );
  };

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
          <div
            ref={wrapperRef}
            className="hidden overflow-x-auto rounded-xl border bg-card shadow-sm md:block"
          >
            <table
              className={cn("w-full text-sm", larguras && "table-fixed")}
              style={larguras ? { minWidth: larguraTotal } : undefined}
            >
              {larguras ? (
                <colgroup>
                  {headers.map((h) => (
                    <col key={h} style={{ width: larguras[h] }} />
                  ))}
                  {/* Sobra: absorve o espaço quando as colunas somam menos que a tabela. */}
                  <col />
                </colgroup>
              ) : null}
              <thead>
                <tr className="border-b text-left text-xs font-mono uppercase tracking-wide text-foreground-faint">
                  {columns.map((c) => (
                    <th
                      key={c.header}
                      ref={redimensionavel ? registrarTh(c.header) : undefined}
                      scope="col"
                      className={cn(
                        "px-4 py-3 font-medium",
                        redimensionavel && "relative",
                        c.headerClassName,
                      )}
                    >
                      {redimensionavel ? (
                        <span className="block truncate" title={c.header}>
                          {c.header}
                        </span>
                      ) : (
                        c.header
                      )}
                      {redimensionavel ? alcaDe(c.header) : null}
                    </th>
                  ))}
                  {rowActions ? (
                    <th
                      ref={redimensionavel ? registrarTh(HEADER_ACOES) : undefined}
                      scope="col"
                      className={cn(
                        "px-4 py-3 text-right font-medium",
                        redimensionavel && "relative",
                      )}
                    >
                      {HEADER_ACOES}
                      {redimensionavel ? alcaDe(HEADER_ACOES) : null}
                    </th>
                  ) : null}
                  {larguras ? <th aria-hidden className="p-0" /> : null}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={getRowKey(item)}
                    className="border-b last:border-b-0 hover:bg-surface/50"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.header}
                        className={cn(
                          "px-4 py-3 align-middle",
                          redimensionavel && "break-words",
                          c.className,
                        )}
                      >
                        {c.cell(item)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-4 py-3 text-right">{rowActions(item)}</td>
                    ) : null}
                    {larguras ? <td aria-hidden className="p-0" /> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {temAjustes ? (
            <div className="hidden justify-end md:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => limpar()}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Icon icon="lucide:columns-3" className="h-3.5 w-3.5" />
                Restaurar largura das colunas
              </Button>
            </div>
          ) : null}

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
