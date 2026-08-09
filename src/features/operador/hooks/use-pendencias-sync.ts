import { useMemo } from "react";
import { ordensStore } from "@/features/ordem-servico/ordens-store";
import { apontamentosStore } from "@/features/apontamento/apontamentos-store";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { getOperadorLogadoId } from "@/features/auth/operador-session";
import { formatHorimetro } from "@/shared/lib/format";

/*
 * Fila de envio do App de Campo.
 *
 * O motor de sincronização (fila offline em IndexedDB + flush idempotente,
 * ADR-001) ainda não existe: `pendente_sync` hoje é o marcador de "registro
 * feito no aparelho e ainda não confirmado pela central". Esta lista mostra
 * exatamente esses registros — não simula progresso nem inventa tamanho de
 * payload, que só o motor real saberá.
 */

export interface ItemPendente {
  id: string;
  icone: string;
  titulo: string;
  detalhe: string;
}

export function usePendenciasSync(): ItemPendente[] {
  const ordens = ordensStore.useTodas();
  const apontamentos = apontamentosStore.useTodos();
  const equipamentos = equipamentosStore.useAll();

  return useMemo(() => {
    const operadorId = getOperadorLogadoId();
    const itens: ItemPendente[] = [];

    for (const a of apontamentos) {
      if (a.operador_id !== operadorId || !a.pendente_sync) continue;
      const equipamento = equipamentos.find((e) => e.id === a.equipamento_id);
      const os = a.os_id ? ordens.find((o) => o.id === a.os_id) : null;
      itens.push({
        id: `apt-${a.id}`,
        icone: "lucide:gauge",
        titulo: `Apontamento${os ? ` · ${os.numero}` : ""}`,
        detalhe:
          a.horas_trabalhadas != null
            ? `${equipamento?.nome ?? "Equipamento"} — ${a.horas_trabalhadas} h`
            : `${equipamento?.nome ?? "Equipamento"} — início ${formatHorimetro(a.horimetro_inicial)}`,
      });
    }

    for (const os of ordens) {
      if (!os.pendente_sync) continue;
      if (
        os.responsavel_id !== operadorId &&
        !apontamentos.some((a) => a.os_id === os.id && a.operador_id === operadorId)
      ) {
        continue;
      }
      itens.push({
        id: `os-${os.id}`,
        icone: "lucide:clipboard-list",
        titulo: `Ordem de serviço · ${os.numero}`,
        detalhe: os.obra_nome,
      });
    }

    return itens;
  }, [ordens, apontamentos, equipamentos]);
}
