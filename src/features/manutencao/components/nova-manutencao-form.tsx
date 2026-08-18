import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { registrosManutencaoStore } from "@/features/manutencao/registros-manutencao-store";
import { ResumoNovaManutencao } from "@/features/manutencao/components/resumo-nova-manutencao";
import {
  PRIORIDADES_MANUTENCAO,
  PRIORIDADE_MANUTENCAO_LABEL,
  TIPO_MANUTENCAO_LABEL,
} from "@/features/manutencao/labels";
import { textoParaNumero } from "@/features/parametros/derivacoes";
import type { PrioridadeManutencao, TipoManutencao } from "@/shared/types";
import { cn } from "@/lib/utils";

// Abertura de ordem de manutenção sob demanda — a corretiva que a Onda 10 tinha
// descartado, mais a preventiva avulsa (serviço fora de plano). A ordem nasce
// "Em andamento": abrir aqui significa que a máquina já está parada.
//
// Ciclo de plano NÃO passa por esta tela: ele nasce sozinho quando o plano é
// cadastrado e é fechado a partir do alerta de horímetro.

const TIPOS: TipoManutencao[] = ["preventiva", "corretiva"];

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export function NovaManutencaoForm({ onCancel, onSuccess }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const navigate = useNavigate();

  const [equipamentoId, setEquipamentoId] = useState("");
  const [tipo, setTipo] = useState<TipoManutencao>("corretiva");
  const [prioridade, setPrioridade] = useState<PrioridadeManutencao>("alta");
  const [abertura, setAbertura] = useState(() => new Date().toISOString().slice(0, 10));
  const [horimetro, setHorimetro] = useState("");
  const [descricao, setDescricao] = useState("");
  const [custo, setCusto] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [salvando, setSalvando] = useState(false);

  const equipamento = equipamentos.find((e) => e.id === equipamentoId);
  const horimetroNum = textoParaNumero(horimetro);
  const custoNum = textoParaNumero(custo);
  const pronto = Boolean(equipamentoId) && descricao.trim().length > 0 && horimetroNum != null;

  // Pré-preenche o horímetro com a leitura atual da máquina escolhida — é o que
  // quem abre a ordem tem na frente, e ainda dá para corrigir.
  const escolherEquipamento = (id: string) => {
    setEquipamentoId(id);
    const eq = equipamentos.find((e) => e.id === id);
    if (eq && !horimetro.trim()) setHorimetro(String(eq.horimetro_atual));
  };

  const salvar = async () => {
    if (!pronto) {
      toast.error("Informe equipamento, descrição do serviço e horímetro.");
      return;
    }
    setSalvando(true);
    try {
      const registro = await registrosManutencaoStore.abrirManutencao({
        equipamento_id: equipamentoId,
        tipo,
        descricao: descricao.trim(),
        prioridade,
        horimetro_abertura: horimetroNum,
        aberta_em: new Date(`${abertura}T12:00:00`).toISOString(),
        custo: custoNum,
        fornecedor: fornecedor.trim() || null,
        observacao: null,
      });
      toast.success("Manutenção aberta. O equipamento entra como parado até a conclusão.");
      // Leva direto para a conclusão: serviço rápido é aberto e fechado na
      // mesma sentada, e quem quiser deixar em andamento só volta.
      void navigate({
        to: "/admin/manutencao/registrar/$registroId",
        params: { registroId: registro.id },
      });
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível abrir a manutenção.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados da manutenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="equipamento">Equipamento *</Label>
            <Select value={equipamentoId} onValueChange={escolherEquipamento}>
              <SelectTrigger id="equipamento">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {equipamentos.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <div className="flex rounded-lg border bg-surface p-1">
                {TIPOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      tipo === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {TIPO_MANUTENCAO_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={prioridade}
                onValueChange={(v) => setPrioridade(v as PrioridadeManutencao)}
              >
                <SelectTrigger id="prioridade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES_MANUTENCAO.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORIDADE_MANUTENCAO_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="abertura">Abertura</Label>
              <Input
                id="abertura"
                type="date"
                className="font-mono"
                value={abertura}
                onChange={(e) => setAbertura(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="horimetro">Horímetro *</Label>
              <Input
                id="horimetro"
                inputMode="decimal"
                className="font-mono"
                placeholder={equipamento ? String(equipamento.horimetro_atual) : "998"}
                value={horimetro}
                onChange={(e) => setHorimetro(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição do serviço *</Label>
            <Textarea
              id="descricao"
              rows={2}
              placeholder="Ex.: Vazamento no comando hidráulico"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="custo">Custo estimado (R$)</Label>
              <Input
                id="custo"
                inputMode="decimal"
                className="font-mono"
                placeholder="0,00"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fornecedor">Fornecedor / oficina</Label>
              <Input
                id="fornecedor"
                placeholder="Oficina interna"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void salvar()}
              disabled={salvando || !pronto}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {salvando ? "Salvando…" : "Abrir manutenção"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResumoNovaManutencao
        equipamento={equipamento}
        tipo={tipo}
        prioridade={prioridade}
        descricao={descricao}
        horimetro={horimetro}
        custo={custo}
        fornecedor={fornecedor}
      />
    </div>
  );
}
