import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { precoFundacaoStore } from "@/features/precos/precos-fundacao-store";
import { precoMobilizacaoStore } from "@/features/precos/precos-mobilizacao-store";
import { precoHoraMaquinaStore } from "@/features/precos/precos-hora-maquina-store";
import { criarItemHora, criarItemMetro, criarItemMobilizacao } from "@/features/orcamentos/calculo";
import { formatBRL } from "@/features/retaguarda/format";
import type { OrcamentoItem, TipoItemOrcamento } from "@/shared/types";

const TIPOS: { valor: TipoItemOrcamento; label: string }[] = [
  { valor: "hora_maquina", label: "Hora-máquina" },
  { valor: "por_metro", label: "Por metro (estaca)" },
  { valor: "mobilizacao", label: "Mobilização" },
];

export function AdicionarItemOrcamento({
  onAdicionar,
}: {
  onAdicionar: (item: OrcamentoItem) => void;
}) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const fundacoes = precoFundacaoStore.useAll().filter((p) => p.ativo);
  const mobilizacoes = precoMobilizacaoStore.useAll().filter((p) => p.ativo);
  const precosHM = precoHoraMaquinaStore.useAll();

  const [tipo, setTipo] = useState<TipoItemOrcamento>("hora_maquina");
  const [fonte, setFonte] = useState("");
  const [qtd, setQtd] = useState("1");

  const reset = () => {
    setFonte("");
    setQtd("1");
  };

  const adicionar = () => {
    if (!fonte) return;
    const n = Number(qtd);
    const quantidade = Number.isFinite(n) && n > 0 ? n : 1;
    if (tipo === "hora_maquina") {
      const equip = equipamentos.find((e) => e.id === fonte);
      if (!equip) return;
      onAdicionar(criarItemHora(equip, precosHM, quantidade));
    } else if (tipo === "por_metro") {
      const preco = fundacoes.find((p) => p.id === fonte);
      if (!preco) return;
      onAdicionar(criarItemMetro(preco, quantidade));
    } else {
      const preco = mobilizacoes.find((p) => p.id === fonte);
      if (!preco) return;
      onAdicionar(criarItemMobilizacao(preco));
    }
    reset();
  };

  const fontes =
    tipo === "hora_maquina"
      ? equipamentos.map((e) => ({ id: e.id, label: e.nome }))
      : tipo === "por_metro"
        ? fundacoes.map((p) => ({
            id: p.id,
            label: `Ø${p.diametro_broca_mm}mm · ${formatBRL(p.valor_metro)}/m`,
          }))
        : mobilizacoes.map((p) => ({ id: p.id, label: `${p.descricao} · ${formatBRL(p.valor)}` }));

  const mostrarQtd = tipo !== "mobilizacao";
  const unidadeQtd = tipo === "hora_maquina" ? "horas" : "metros";

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed bg-surface/40 p-3">
      <div className="space-y-1">
        <label className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">
          Tipo
        </label>
        <Select
          value={tipo}
          onValueChange={(v) => {
            setTipo(v as TipoItemOrcamento);
            reset();
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t.valor} value={t.valor}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[200px] flex-1 space-y-1">
        <label className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">
          Item
        </label>
        <Select value={fonte} onValueChange={setFonte}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {fontes.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mostrarQtd ? (
        <div className="w-28 space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-wide text-foreground-faint">
            Qtd. ({unidadeQtd})
          </label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.1"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            className="font-mono"
          />
        </div>
      ) : null}

      <Button
        onClick={adicionar}
        disabled={!fonte}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Adicionar
      </Button>
    </div>
  );
}
