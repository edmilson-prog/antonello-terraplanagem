import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormDialog } from "@/shared/components/form-dialog";
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
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import { CATEGORIA_LABEL } from "@/features/financeiro/labels";
import type { CategoriaDespesa } from "@/shared/types";

const CATEGORIAS: CategoriaDespesa[] = ["diesel", "manutencao", "folha", "fornecedor", "outro"];

const schema = z.object({
  descricao: z.string().min(3, "Mínimo 3 caracteres"),
  fornecedor: z.string().optional(),
  categoria: z.enum(["diesel", "manutencao", "folha", "fornecedor", "outro"] as const),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  vencimento: z.string().min(10, "Informe a data de vencimento"),
});

type FormData = z.infer<typeof schema>;

interface NovaContaPagarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaContaPagarDialog({ open, onOpenChange }: NovaContaPagarDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { categoria: "diesel" },
  });

  const categoria = watch("categoria");

  function onSubmit(data: FormData) {
    contasPagarStore.criar({
      descricao: data.descricao,
      fornecedor: data.fornecedor?.trim() || null,
      categoria: data.categoria,
      valor: data.valor,
      vencimento: data.vencimento,
    });
    toast.success("Conta a pagar registrada.");
    reset();
    onOpenChange(false);
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      titulo="Nova Conta a Pagar"
      descricao="Registre uma despesa: diesel, manutenção, folha, fornecedor, etc."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input id="descricao" placeholder="Ex: Abastecimento Julho" {...register("descricao")} />
          {errors.descricao && (
            <p className="text-xs text-destructive">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input id="fornecedor" placeholder="Opcional" {...register("fornecedor")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={categoria}
            onValueChange={(v) => setValue("categoria", v as CategoriaDespesa)}
          >
            <SelectTrigger id="categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria && (
            <p className="text-xs text-destructive">{errors.categoria.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            {...register("valor")}
          />
          {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vencimento">Vencimento *</Label>
          <Input id="vencimento" type="date" {...register("vencimento")} />
          {errors.vencimento && (
            <p className="text-xs text-destructive">{errors.vencimento.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Registrar"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
