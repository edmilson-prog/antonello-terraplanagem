import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { abastecimentosStore } from "@/features/diesel/abastecimentos-store";
import { CupomCaptureButton } from "@/features/ia/components/cupom-capture-button";
import { ResumoNovoAbastecimento } from "@/features/diesel/components/resumo-novo-abastecimento";

interface Props {
  onCancel: () => void;
}

export function AbastecimentoForm({ onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  const navigate = useNavigate();

  const [equipamentoId, setEquipamentoId] = useState("");
  const [litros, setLitros] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [precoLitro, setPrecoLitro] = useState("");
  const [custoTotal, setCustoTotal] = useState("");
  const [local, setLocal] = useState("");
  const [salvando, setSalvando] = useState(false);

  const equipamento = equipamentos.find((e) => e.id === equipamentoId);
  const litrosNum = Number(litros);
  const horimetroNum = Number(horimetro);
  const pronto =
    !!equipamentoId && litros.trim() !== "" && litrosNum > 0 && horimetro.trim() !== "";

  function handleSubmit() {
    if (!equipamentoId) {
      toast.error("Selecione o equipamento.");
      return;
    }
    if (!litros.trim() || Number.isNaN(litrosNum) || litrosNum <= 0) {
      toast.error("Informe os litros abastecidos.");
      return;
    }
    if (!horimetro.trim() || Number.isNaN(horimetroNum) || horimetroNum < 0) {
      toast.error("Informe o horímetro no momento do abastecimento.");
      return;
    }
    setSalvando(true);
    const r = abastecimentosStore.registrar({
      equipamento_id: equipamentoId,
      litros: litrosNum,
      horimetro: horimetroNum,
      preco_litro: precoLitro.trim() ? Number(precoLitro) : null,
      custo_total: custoTotal.trim() ? Number(custoTotal) : null,
      local: local.trim() || null,
    });
    setSalvando(false);
    if (!r.ok) {
      toast.error(
        r.erro === "litros_invalido"
          ? "Os litros devem ser maiores que zero."
          : "O horímetro não pode ser menor que o último abastecimento deste equipamento.",
      );
      return;
    }
    toast.success("Abastecimento registrado.");
    navigate({ to: "/admin/diesel" });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do abastecimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="equipamento">Equipamento *</Label>
            <Select value={equipamentoId} onValueChange={setEquipamentoId}>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="litros">Litros *</Label>
              <Input
                id="litros"
                type="number"
                step="0.1"
                min="0"
                className="font-mono"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="horimetro">Horímetro *</Label>
              <Input
                id="horimetro"
                type="number"
                step="0.1"
                min="0"
                className="font-mono"
                value={horimetro}
                onChange={(e) => setHorimetro(e.target.value)}
              />
            </div>
          </div>

          <CupomCaptureButton
            onLeitura={(litrosLidos, valorLido) => {
              setLitros(String(litrosLidos));
              if (valorLido != null) {
                setCustoTotal(String(valorLido));
                if (litrosLidos > 0) {
                  setPrecoLitro((valorLido / litrosLidos).toFixed(2));
                }
              }
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="preco">Preço/litro (R$) — opcional</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="font-mono"
                value={precoLitro}
                onChange={(e) => setPrecoLitro(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custo">Custo total (R$) — opcional</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="font-mono"
                value={custoTotal}
                onChange={(e) => setCustoTotal(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="local">Local — opcional</Label>
            <Input
              id="local"
              placeholder="Posto, comboio próprio…"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!pronto || salvando}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {salvando ? "Salvando…" : "Registrar abastecimento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResumoNovoAbastecimento
        equipamento={equipamento}
        litros={litros}
        horimetro={horimetro}
        precoLitro={precoLitro}
        custoTotal={custoTotal}
        local={local}
      />
    </div>
  );
}
