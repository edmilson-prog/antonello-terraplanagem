import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import {
  AreaRolagem,
  BOTAO_VOLTAR,
  CabecalhoCampo,
  CartaoCampo,
  IconeTile,
  LINHA_CAMPO,
  LINHA_CAMPO_CLICAVEL,
  LinhaCorpo,
  LinhaTitulo,
  SecaoCampo,
  TagCabecalho,
  TelaCampo,
  VazioCampo,
} from "@/features/operador/components/kit";
import { useNotificacoesCampo } from "@/features/operador/hooks/use-notificacoes-campo";
import { marcarNotificacoesLidas } from "@/features/operador/notificacoes-lidas";
import { formatHoraCurta, rotuloDiaRelativo } from "@/shared/lib/format";
import type { NotificacaoCampo } from "@/features/operador/notificacoes";
import { cn } from "@/lib/utils";

/*
 * Notificações (`screen === 'notif'` no CampoApp.jsx). A fonte é a derivação
 * de `features/operador/notificacoes.ts` — trocar para uma caixa de entrada do
 * servidor é substituir o hook `useNotificacoesCampo`, nada mais nesta tela.
 */

function chaveDia(iso: string): string {
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function NotificacoesPage() {
  const { itens, naoLidas, lidasAte } = useNotificacoesCampo();

  const grupos = useMemo(() => {
    const mapa = new Map<string, NotificacaoCampo[]>();
    for (const n of itens) {
      const dia = chaveDia(n.em);
      const grupo = mapa.get(dia);
      if (grupo) grupo.push(n);
      else mapa.set(dia, [n]);
    }
    return [...mapa.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [itens]);

  return (
    <TelaCampo>
      <CabecalhoCampo
        voltar={
          <Link to="/app" aria-label="Voltar" className={BOTAO_VOLTAR}>
            <Icon icon="lucide:arrow-left" className="h-[18px] w-[18px]" />
          </Link>
        }
        titulo="Notificações"
        tag={
          naoLidas > 0 ? (
            <button
              type="button"
              onClick={() => marcarNotificacoesLidas()}
              className="min-h-11 px-1 text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Marcar lidas
            </button>
          ) : (
            <TagCabecalho tom="neutral">em dia</TagCabecalho>
          )
        }
      />
      <AreaRolagem>
        {grupos.length === 0 ? (
          <VazioCampo
            icone="lucide:bell"
            titulo="Nada por aqui"
            descricao="Avisos de OS, manutenção e abastecimento aparecem nesta tela."
          />
        ) : (
          grupos.map(([dia, linhas]) => (
            <div key={dia}>
              <SecaoCampo>{rotuloDiaRelativo(dia)}</SecaoCampo>
              <CartaoCampo>
                {linhas.map((n) => {
                  const naoLida = !lidasAte || n.em > lidasAte;
                  const conteudo = (
                    <>
                      <IconeTile tom={n.perigo ? "danger" : "amber"}>
                        <Icon icon={n.icone} className="h-[17px] w-[17px]" />
                      </IconeTile>
                      <LinhaCorpo>
                        <LinhaTitulo>{n.titulo}</LinhaTitulo>
                        <div className="mt-[3px] text-[11.5px] leading-[1.45] text-foreground-faint">
                          {n.mensagem}
                        </div>
                      </LinhaCorpo>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-mono text-[10.5px] font-medium text-foreground-faint">
                          {formatHoraCurta(n.em)}
                        </span>
                        {naoLida ? (
                          <span
                            aria-label="não lida"
                            className="h-2 w-2 rounded-full bg-primary ring-[3px] ring-primary/15"
                          />
                        ) : null}
                      </div>
                    </>
                  );
                  const classe = cn(
                    n.osId ? LINHA_CAMPO_CLICAVEL : LINHA_CAMPO,
                    "items-start",
                    naoLida && "bg-primary/[0.05]",
                  );
                  return n.osId ? (
                    <Link
                      key={n.id}
                      to="/app/ordens/$ordemId"
                      params={{ ordemId: n.osId }}
                      className={classe}
                    >
                      {conteudo}
                    </Link>
                  ) : (
                    <div key={n.id} className={classe}>
                      {conteudo}
                    </div>
                  );
                })}
              </CartaoCampo>
            </div>
          ))
        )}
      </AreaRolagem>
    </TelaCampo>
  );
}
