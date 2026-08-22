import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { clientesStore } from "@/features/clientes/clientes-store";
import { clienteSchema, type ClienteFormValues } from "@/features/clientes/cliente-schema";
import { ResumoNovoCliente } from "@/features/clientes/components/resumo-novo-cliente";
import type { Cliente } from "@/shared/types";

interface Props {
  inicial: Cliente | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClienteForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      documento: inicial?.documento ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
      nome_fantasia: inicial?.nome_fantasia ?? "",
      segmento: inicial?.segmento ?? "",
      email: inicial?.email ?? "",
      endereco: inicial?.endereco ?? "",
      cidade: inicial?.cidade ?? "",
      contato_nome: inicial?.contato_nome ?? "",
      contato_papel: inicial?.contato_papel ?? "",
    },
  });

  const onSubmit = async (values: ClienteFormValues) => {
    const texto = (v: string | undefined) => (v?.trim() ? v.trim() : null);

    const payload = {
      nome: values.nome,
      documento: values.documento?.trim() ? values.documento.replace(/\D/g, "") : null,
      telefone: texto(values.telefone),
      ativo: values.ativo,
      nome_fantasia: texto(values.nome_fantasia),
      segmento: texto(values.segmento),
      email: texto(values.email),
      endereco: texto(values.endereco),
      cidade: texto(values.cidade),
      contato_nome: texto(values.contato_nome),
      contato_papel: texto(values.contato_papel),
    };
    try {
      if (inicial) {
        await clientesStore.update(inicial.id, payload);
        toast.success("Cliente atualizado.");
      } else {
        await clientesStore.create(payload);
        toast.success("Cliente cadastrado.");
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error(
        (inicial ? "Falha ao atualizar o cliente" : "Falha ao cadastrar o cliente") + detalhe,
      );
    }
  };

  const formulario = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome / razão social *</Label>
        <Input
          id="nome"
          className="uppercase"
          {...register("nome", {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
          aria-invalid={!!errors.nome}
        />
        {errors.nome ? <p className="text-xs text-destructive">{errors.nome.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="documento">CPF / CNPJ</Label>
        <Input
          id="documento"
          inputMode="numeric"
          placeholder="opcional"
          className="font-mono"
          {...register("documento")}
          aria-invalid={!!errors.documento}
        />
        {errors.documento ? (
          <p className="text-xs text-destructive">{errors.documento.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          inputMode="tel"
          placeholder="opcional"
          className="font-mono"
          {...register("telefone")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nome_fantasia">Nome fantasia</Label>
          <Input id="nome_fantasia" placeholder="opcional" {...register("nome_fantasia")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="segmento">Segmento</Label>
          <Input
            id="segmento"
            placeholder="opcional — ex.: Construção civil"
            {...register("segmento")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="opcional"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            placeholder="opcional — ex.: Rua das Palmeiras, 120"
            {...register("endereco")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            placeholder="opcional — ex.: Santo Ângelo — RS"
            {...register("cidade")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contato_nome">Contato</Label>
          <Input id="contato_nome" placeholder="opcional" {...register("contato_nome")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contato_papel">Papel do contato</Label>
          <Input
            id="contato_papel"
            placeholder="opcional — ex.: Engenheiro responsável"
            {...register("contato_papel")}
          />
        </div>
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Cliente ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não aparecem para novas ordens.
              </p>
            </div>
            <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          {inicial ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );

  if (inicial) return formulario;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent>{formulario}</CardContent>
      </Card>
      <ResumoNovoCliente control={control} />
    </div>
  );
}
