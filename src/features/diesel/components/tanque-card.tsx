import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { CardSecao, CardPill } from "@/shared/components/card-secao";
import { formatBRL } from "@/features/retaguarda/format";
import type { EstadoTanque } from "@/features/diesel/tanque";

// Card "Tanque interno" do UI kit. Diferente do mock, o nível não é um número
// digitado: sai de compras menos abastecimentos com origem "tanque".

const litros = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} L`;

const data = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export function TanqueCard({ tanque }: { tanque: EstadoTanque }) {
  const pct = tanque.ocupacao != null ? Math.round(tanque.ocupacao * 100) : null;
  const baixo = pct != null && pct < 20;

  return (
    <CardSecao
      titulo="Tanque interno"
      icone="lucide:database"
      acessorio={
        tanque.custoMedioLitro != null ? (
          <CardPill>{formatBRL(tanque.custoMedioLitro)}/L médio</CardPill>
        ) : undefined
      }
      bodyClassName="p-4"
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-2xl font-bold text-foreground">
          {litros(Math.max(0, tanque.saldoLitros))}
        </span>
        {tanque.capacidadeLitros > 0 ? (
          <span className="text-sm text-muted-foreground">
            de {litros(tanque.capacidadeLitros)}
            {pct != null ? ` · ${pct}%` : null}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">capacidade não configurada</span>
        )}
      </div>

      {pct != null ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
          <div
            className={
              baixo
                ? "h-full rounded-full bg-destructive"
                : "h-full rounded-full bg-gradient-to-r from-primary to-primary-deep"
            }
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      ) : null}

      <div className="mt-3 text-xs text-muted-foreground">
        {tanque.ultimaCompra ? (
          <>
            Última compra{" "}
            <strong className="font-mono text-foreground">
              {data(tanque.ultimaCompra.comprado_em)}
            </strong>{" "}
            · {litros(tanque.ultimaCompra.litros)}
            {tanque.ultimaCompra.fornecedor ? ` · ${tanque.ultimaCompra.fornecedor}` : null}
          </>
        ) : (
          "Nenhuma compra registrada ainda."
        )}
      </div>

      {tanque.inconsistente ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
          <Icon icon="lucide:triangle-alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Saiu mais diesel do que entrou ({litros(tanque.saldoLitros)}). Quase sempre é
          abastecimento marcado como tanque sem a compra correspondente lançada.
        </p>
      ) : null}

      <LinkCompra />
    </CardSecao>
  );
}

function LinkCompra() {
  return (
    <Link
      to="/admin/diesel/compra"
      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
    >
      <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
      Registrar compra
    </Link>
  );
}
