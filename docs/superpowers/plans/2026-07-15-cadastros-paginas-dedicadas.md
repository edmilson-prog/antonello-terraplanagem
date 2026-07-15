# Cadastros — diálogos → páginas dedicadas (Onda 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Converter 5 diálogos genéricos de criação da retaguarda (Cliente, Equipamento, Componente de Custo, Conta a Pagar, Operador) em páginas dedicadas com layout de 2 colunas (formulário + resumo ao vivo), seguindo fielmente `docs/html/Antonello Terraplanagem — Design System/ui_kits/retaguarda/`, reaproveitando o padrão já validado na Nova OS.

**Architecture:** Um shell compartilhado novo (`PaginaCadastroDedicada`, só header — link de voltar + título + tag) é usado por 5 páginas novas. O layout de 2 colunas (grid + card de campos + resumo ao vivo) fica **dentro** de cada `XForm` existente (mesmo padrão de `OrdemForm`): quando `inicial` é `null` (Cliente/Equipamento/Custo/Operador) ou sempre (Pagamento, que não tem edição), o formulário se envolve num `Card` e ganha um componente `ResumoNovoX` ao lado, lendo o próprio formulário via `useWatch`. A edição continua exatamente como está (mesmo diálogo, mesmo componente, sem o resumo). Custo e Pagamento são stores mock em memória — campos novos entram só no tipo/mock, sem migration. Operador é Supabase real — ganha migration (5 colunas + tabela de junção `operadores_equipamentos`) e a RPC `criar_operador` é estendida.

**Tech Stack:** React + TypeScript + Tailwind + shadcn/ui, react-hook-form + zod, Supabase (Postgres/RLS) só para Operador, TanStack Router (rotas por arquivo), Vitest + Testing Library.

## Global Constraints

- Spec completa em `docs/superpowers/specs/2026-07-15-cadastros-paginas-dedicadas-design.md`.
- Edição de Cliente/Equipamento/Operador/Componente de Custo **não muda** — mesmo diálogo, mesmo componente `XForm`, sem o resumo (branch `if (inicial) return formulario`).
- Fidelidade ao mock é a prioridade — nomes de campos, categorias e cópia dos cards seguem os arquivos `.jsx` do UI kit **literalmente**, exceto onde a spec já decidiu divergir:
  - Sem "base anual" em Componente de Custo (só `fixo_mensal`/`variavel_hora`, reaproveitando o campo `tipo` já existente — o "Base do valor" do mock é o mesmo campo, não um novo).
  - Sem status "rascunho" em Conta a Pagar (só o botão "Lançar pagamento").
  - `CategoriaDespesa` de Conta a Pagar usa o enum **real** (`diesel|manutencao|folha|fornecedor|outro`), não o do mock (`diesel|manut|folha|frota|outros`).
  - Conta a Pagar mantém os campos **Descrição** (obrigatório) E **Fornecedor** (opcional) — o mock só tem "Fornecedor/beneficiário", mas `descricao` já é obrigatório no schema real hoje; omiti-lo seria regressão, não fidelidade.
  - Toggle "Liberar acesso ao app" (Operador) fica fora — mexeria no RPC de autenticação real.
  - Onde o mock usa um toggle segmentado (2-3 botões) para um enum já modelado como `<Select>` no formulário real (ex. "Base do valor" do Custo), mantém-se `<Select>` — consistência com o resto do formulário, não regressão de fidelidade de dado.
- Categorias de Componente de Custo usam os slugs **exatos** do mock: `depreciacao`, `seguro`, `pneus`, `operador`, `indireto`, `outros`.
- Nenhum `any`; optional chaining (nunca `!`); ícones via `@iconify/react` (`lucide:`); nada de hex direto em componente (só tokens Tailwind).
- Conventional Commits em inglês.

---

### Task 1: Shell compartilhado `PaginaCadastroDedicada`

**Files:**
- Create: `src/shared/components/pagina-cadastro-dedicada.tsx`
- Create: `src/shared/components/linha-resumo.tsx`
- Test: `src/shared/components/pagina-cadastro-dedicada.test.tsx`

**Interfaces:**
- Produces: `PaginaCadastroDedicada({ backLabel, backTo, title, tag, children })` — `backTo` tipado como união literal das 5 rotas de listagem consumidas nesta onda (evita `any`/`string` genérico contra o `<Link>` do TanStack Router). `Linha({ rotulo, valor, vazio? })` — reaproveitado por todos os `ResumoNovoX` das Tasks 2-6.

- [ ] **Step 1: Criar `linha-resumo.tsx`**

Crie `src/shared/components/linha-resumo.tsx`:

```tsx
interface LinhaResumoProps {
  rotulo: string;
  valor: string;
  vazio?: boolean;
}

// Uma linha "rótulo: valor" dos cards de resumo ao vivo (Cliente, Equipamento,
// Custo, Pagamento, Operador, OS). `vazio` esmaece o valor quando o campo
// ainda não foi preenchido (mesmo padrão visual do mock: "a definir").
export function Linha({ rotulo, valor, vazio }: LinhaResumoProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className={vazio ? "text-foreground-faint" : "font-medium text-foreground"}>
        {valor}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Criar `pagina-cadastro-dedicada.tsx`**

Crie `src/shared/components/pagina-cadastro-dedicada.tsx`:

```tsx
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

type RotaListagemCadastro =
  | "/admin/clientes"
  | "/admin/equipamentos"
  | "/admin/custo-hora"
  | "/admin/financeiro"
  | "/admin/operadores";

interface PaginaCadastroDedicadaProps {
  backLabel: string;
  backTo: RotaListagemCadastro;
  title: string;
  tag: string;
  children: ReactNode;
}

// Header compartilhado das páginas dedicadas de cadastro (Cliente,
// Equipamento, Custo, Pagamento, Operador — mesmo padrão da Nova OS): link de
// voltar, título + tag. O layout de 2 colunas (campos + resumo ao vivo) fica
// dentro de cada formulário (XForm), não aqui — cada um tem conteúdo
// suficientemente diferente para não valer a pena abstrair além do header.
export function PaginaCadastroDedicada({
  backLabel,
  backTo,
  title,
  tag,
  children,
}: PaginaCadastroDedicadaProps) {
  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        <span className="rounded-full border bg-surface px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
          {tag}
        </span>
      </div>

      {children}
    </div>
  );
}
```

- [ ] **Step 3: Escrever o teste**

Crie `src/shared/components/pagina-cadastro-dedicada.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "./pagina-cadastro-dedicada";

function renderComRouter() {
  const rootRoute = createRootRoute({
    component: () => (
      <PaginaCadastroDedicada
        backLabel="Clientes"
        backTo="/admin/clientes"
        title="Novo cliente"
        tag="cadastro"
      >
        <div>conteúdo do formulário</div>
      </PaginaCadastroDedicada>
    ),
  });
  const router = createRouter({ routeTree: rootRoute });
  return render(<RouterProvider router={router} />);
}

describe("PaginaCadastroDedicada", () => {
  it("renderiza o link de voltar, título, tag e o conteúdo", async () => {
    renderComRouter();

    expect(await screen.findByRole("link", { name: /Clientes/ })).toHaveAttribute(
      "href",
      "/admin/clientes",
    );
    expect(screen.getByRole("heading", { name: "Novo cliente" })).toBeInTheDocument();
    expect(screen.getByText("cadastro")).toBeInTheDocument();
    expect(screen.getByText("conteúdo do formulário")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Rodar o teste**

Run: `npx vitest run src/shared/components/pagina-cadastro-dedicada.test.tsx`
Expected: PASS.

- [ ] **Step 5: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/pagina-cadastro-dedicada.tsx \
  src/shared/components/linha-resumo.tsx \
  src/shared/components/pagina-cadastro-dedicada.test.tsx
git commit -m "feat: add shared PaginaCadastroDedicada shell"
```

---

### Task 2: Cliente — página dedicada `/admin/clientes/novo`

**Files:**
- Modify: `src/features/clientes/components/cliente-form.tsx`
- Create: `src/features/clientes/components/resumo-novo-cliente.tsx`
- Create: `src/features/clientes/components/novo-cliente-page.tsx`
- Create: `src/routes/admin.clientes.novo.tsx`
- Modify: `src/features/clientes/components/clientes-page.tsx`
- Test: `src/features/clientes/components/cliente-form.test.tsx`

**Interfaces:**
- Consumes: `PaginaCadastroDedicada`, `Linha` (Task 1).
- Produces: `ResumoNovoCliente({ control }: { control: Control<ClienteFormValues> })`; `NovoClientePage` (componente de página, consumido só pela rota).

- [ ] **Step 1: Criar `resumo-novo-cliente.tsx`**

Crie `src/features/clientes/components/resumo-novo-cliente.tsx`:

```tsx
import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import type { ClienteFormValues } from "@/features/clientes/cliente-schema";

export function ResumoNovoCliente({ control }: { control: Control<ClienteFormValues> }) {
  const valores = useWatch({ control });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:user" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.nome?.trim() || "Novo cliente"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Documento"
            valor={valores.documento?.trim() || "a definir"}
            vazio={!valores.documento?.trim()}
          />
          <Linha
            rotulo="Telefone"
            valor={valores.telefone?.trim() || "a definir"}
            vazio={!valores.telefone?.trim()}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O cliente entra <strong className="text-foreground">ativo</strong> e já pode receber{" "}
          <strong className="text-foreground">orçamentos</strong> e{" "}
          <strong className="text-foreground">ordens de serviço</strong>.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Escrever o teste que falha**

Crie `src/features/clientes/components/cliente-form.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ClienteForm } from "./cliente-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ClienteForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<ClienteForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo cliente")).toBeInTheDocument();
    expect(screen.getAllByText("a definir")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Nome / razão social *"), {
      target: { value: "Construtora Vale Verde" },
    });
    fireEvent.change(screen.getByLabelText("Telefone"), {
      target: { value: "44999990000" },
    });

    expect(screen.getByText("CONSTRUTORA VALE VERDE")).toBeInTheDocument();
    expect(screen.getByText("44999990000")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <ClienteForm
        inicial={{
          id: "cl-teste",
          nome: "Cliente Existente",
          documento: null,
          telefone: null,
          tipo_pessoa: null,
          ativo: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Novo cliente")).not.toBeInTheDocument();
  });

  it("cadastra o cliente e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<ClienteForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome / razão social *"), {
      target: { value: "Cliente Teste" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Cliente cadastrado.");
  });
});
```

Note: o campo "Nome" é forçado a uppercase no `onChange` do próprio input (`e.target.value = e.target.value.toUpperCase()`), por isso o teste espera `"CONSTRUTORA VALE VERDE"` no resumo — não é bug do resumo, é o comportamento já existente do campo.

- [ ] **Step 3: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/clientes/components/cliente-form.test.tsx`
Expected: FAIL — o texto "Novo cliente"/"a definir" não existe ainda no componente atual.

- [ ] **Step 4: Atualizar `cliente-form.tsx`**

Substitua o conteúdo inteiro de `src/features/clientes/components/cliente-form.tsx` por:

```tsx
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
    },
  });

  const onSubmit = async (values: ClienteFormValues) => {
    const payload = {
      nome: values.nome,
      documento: values.documento?.trim() ? values.documento.replace(/\D/g, "") : null,
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
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
```

- [ ] **Step 5: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/clientes/components/cliente-form.test.tsx`
Expected: PASS.

- [ ] **Step 6: Criar a página e a rota**

Crie `src/features/clientes/components/novo-cliente-page.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { ClienteForm } from "@/features/clientes/components/cliente-form";

export function NovoClientePage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/clientes" });

  return (
    <PaginaCadastroDedicada
      backLabel="Clientes"
      backTo="/admin/clientes"
      title="Novo cliente"
      tag="cadastro"
    >
      <ClienteForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
```

Crie `src/routes/admin.clientes.novo.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { NovoClientePage } from "@/features/clientes/components/novo-cliente-page";

export const Route = createFileRoute("/admin/clientes/novo")({
  head: () => ({
    meta: [
      { title: "Novo cliente · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoClientePage,
});
```

O servidor de desenvolvimento (já rodando) regenera `src/routeTree.gen.ts` automaticamente — não edite esse arquivo manualmente.

- [ ] **Step 7: Trocar o botão "Novo cliente" por navegação em `clientes-page.tsx`**

Em `src/features/clientes/components/clientes-page.tsx`, adicione `Link` ao import do TanStack Router (linha 2, já existe `import { Link } from "@tanstack/react-router";` — nada a mudar aí).

Troque a função `abrirNovo` (linha 101-104):

```tsx
  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
```

Remova essa função inteira — não é mais usada (os dois botões que a chamavam viram `<Link>`).

Troque o botão do `PageHeader` (linhas 296-303):

```tsx
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo cliente
          </Button>
```

por:

```tsx
          <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
            <Link to="/admin/clientes/novo">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Novo cliente
            </Link>
          </Button>
```

Troque o botão do empty state (linhas 324-331):

```tsx
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro cliente
              </Button>
            ) : undefined,
```

por:

```tsx
            todos.length === 0 ? (
              <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/admin/clientes/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro cliente
                </Link>
              </Button>
            ) : undefined,
```

Como `formAberto` só é aberto por `abrirEdicao` agora, simplifique o título do `FormDialog` (linhas 388-393) — troque:

```tsx
      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo={editando ? "Editar cliente" : "Novo cliente"}
        descricao="Os campos com * são obrigatórios."
      >
```

por:

```tsx
      <FormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        titulo="Editar cliente"
        descricao="Os campos com * são obrigatórios."
      >
```

E dentro do mesmo `FormDialog`, troque `inicial={editando}` (linha 395) por `inicial={editando}` — sem mudança (mantém, já está correto; `editando` sempre será não-nulo quando o diálogo abrir agora, mas o tipo continua `Cliente | null` por segurança).

- [ ] **Step 8: Rodar a suíte completa e checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run test`
Expected: PASS — todos os testes existentes + os novos de `cliente-form.test.tsx` e `pagina-cadastro-dedicada.test.tsx`, sem regressão.

- [ ] **Step 9: Commit**

```bash
git add src/features/clientes/components/cliente-form.tsx \
  src/features/clientes/components/cliente-form.test.tsx \
  src/features/clientes/components/resumo-novo-cliente.tsx \
  src/features/clientes/components/novo-cliente-page.tsx \
  src/routes/admin.clientes.novo.tsx \
  src/features/clientes/components/clientes-page.tsx
git commit -m "feat: move cliente creation to dedicated page /admin/clientes/novo"
```

---

### Task 3: Equipamento — página dedicada `/admin/equipamentos/novo`

**Files:**
- Modify: `src/features/equipamentos/components/equipamento-form.tsx`
- Create: `src/features/equipamentos/components/resumo-novo-equipamento.tsx`
- Create: `src/features/equipamentos/components/novo-equipamento-page.tsx`
- Create: `src/routes/admin.equipamentos.novo.tsx`
- Modify: `src/features/equipamentos/components/equipamentos-page.tsx`
- Test: `src/features/equipamentos/components/equipamento-form.test.tsx`

**Interfaces:**
- Consumes: `PaginaCadastroDedicada`, `Linha` (Task 1).
- Produces: `ResumoNovoEquipamento({ control }: { control: Control<EquipamentoFormValues> })`; `NovoEquipamentoPage`.

- [ ] **Step 1: Criar `resumo-novo-equipamento.tsx`**

Crie `src/features/equipamentos/components/resumo-novo-equipamento.tsx`:

```tsx
import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { TIPO_LABEL, TIPO_ICONE, STATUS_LABEL } from "@/features/equipamentos/labels";
import { formatHorimetro } from "@/shared/lib/format";
import type { EquipamentoFormValues } from "@/features/equipamentos/equipamento-schema";

export function ResumoNovoEquipamento({ control }: { control: Control<EquipamentoFormValues> }) {
  const valores = useWatch({ control });
  const tipo = valores.tipo ?? "escavadeira";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon={TIPO_ICONE[tipo]} className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.nome?.trim() || "Novo equipamento"}
            </div>
            <div className="text-xs text-muted-foreground">{TIPO_LABEL[tipo]}</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Capacidade"
            valor={valores.capacidade?.trim() || "a definir"}
            vazio={!valores.capacidade?.trim()}
          />
          <Linha
            rotulo="Identificador"
            valor={valores.identificador?.trim() || "a definir"}
            vazio={!valores.identificador?.trim()}
          />
          <Linha rotulo="Horímetro" valor={formatHorimetro(valores.horimetro_atual ?? 0)} />
          <Linha rotulo="Status" valor={STATUS_LABEL[valores.status ?? "disponivel"]} />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          O equipamento fica disponível para <strong className="text-foreground">apontamentos</strong>{" "}
          e <strong className="text-foreground">OS</strong>. O horímetro alimenta o{" "}
          <strong className="text-foreground">Custo da Hora</strong> e os{" "}
          <strong className="text-foreground">planos de manutenção</strong>.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Escrever o teste que falha**

Crie `src/features/equipamentos/components/equipamento-form.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { EquipamentoForm } from "./equipamento-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("EquipamentoForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<EquipamentoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo equipamento")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nome *"), {
      target: { value: "Escavadeira CAT 320" },
    });
    fireEvent.change(screen.getByLabelText("Capacidade *"), {
      target: { value: "18 toneladas" },
    });

    expect(screen.getByText("ESCAVADEIRA CAT 320")).toBeInTheDocument();
    expect(screen.getByText("18 toneladas")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <EquipamentoForm
        inicial={{
          id: "eq-teste",
          nome: "Equipamento Existente",
          tipo: "escavadeira",
          capacidade: "18t",
          horimetro_atual: 100,
          identificador: null,
          status: "disponivel",
          ativo: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Novo equipamento")).not.toBeInTheDocument();
  });

  it("cadastra o equipamento e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<EquipamentoForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByLabelText("Capacidade *"), { target: { value: "10t" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Equipamento cadastrado.");
  });
});
```

- [ ] **Step 3: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/equipamentos/components/equipamento-form.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Atualizar `equipamento-form.tsx`**

Substitua o conteúdo inteiro de `src/features/equipamentos/components/equipamento-form.tsx` por:

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { TIPOS, TIPO_LABEL, STATUS, STATUS_LABEL } from "@/features/equipamentos/labels";
import {
  equipamentoSchema,
  type EquipamentoFormValues,
} from "@/features/equipamentos/equipamento-schema";
import { ResumoNovoEquipamento } from "@/features/equipamentos/components/resumo-novo-equipamento";
import type { Equipamento } from "@/shared/types";

interface Props {
  inicial: Equipamento | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EquipamentoForm({ inicial, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EquipamentoFormValues>({
    resolver: zodResolver(equipamentoSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      tipo: inicial?.tipo ?? "escavadeira",
      capacidade: inicial?.capacidade ?? "",
      horimetro_atual: inicial?.horimetro_atual ?? 0,
      identificador: inicial?.identificador ?? "",
      status: inicial?.status ?? "disponivel",
      ativo: inicial?.ativo ?? true,
    },
  });

  const onSubmit = async (values: EquipamentoFormValues) => {
    const payload = {
      nome: values.nome,
      tipo: values.tipo,
      capacidade: values.capacidade,
      horimetro_atual: values.horimetro_atual,
      identificador: values.identificador?.trim() ? values.identificador.trim() : null,
      status: values.status,
      ativo: values.ativo,
    };
    try {
      if (inicial) {
        await equipamentosStore.update(inicial.id, payload);
        toast.success("Equipamento atualizado.");
      } else {
        await equipamentosStore.create(payload);
        toast.success("Equipamento cadastrado.");
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error(
        (inicial ? "Falha ao atualizar o equipamento" : "Falha ao cadastrar o equipamento") +
          detalhe,
      );
    }
  };

  const formulario = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tipo">Tipo *</Label>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="capacidade">Capacidade *</Label>
          <Input
            id="capacidade"
            placeholder="ex.: 18 toneladas"
            {...register("capacidade")}
            aria-invalid={!!errors.capacidade}
          />
          {errors.capacidade ? (
            <p className="text-xs text-destructive">{errors.capacidade.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="horimetro_atual">Horímetro atual *</Label>
          <Input
            id="horimetro_atual"
            type="number"
            step="0.1"
            min="0"
            className="font-mono"
            {...register("horimetro_atual", { valueAsNumber: true })}
            aria-invalid={!!errors.horimetro_atual}
          />
          {errors.horimetro_atual ? (
            <p className="text-xs text-destructive">{errors.horimetro_atual.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="identificador">Identificador / patrimônio</Label>
          <Input id="identificador" placeholder="opcional" {...register("identificador")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status operacional *</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Equipamento ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não aparecem para novas ordens, mas ficam no histórico.
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
          <CardTitle>Dados do equipamento</CardTitle>
        </CardHeader>
        <CardContent>{formulario}</CardContent>
      </Card>
      <ResumoNovoEquipamento control={control} />
    </div>
  );
}
```

- [ ] **Step 5: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/equipamentos/components/equipamento-form.test.tsx`
Expected: PASS.

- [ ] **Step 6: Criar a página e a rota**

Crie `src/features/equipamentos/components/novo-equipamento-page.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { EquipamentoForm } from "@/features/equipamentos/components/equipamento-form";

export function NovoEquipamentoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/equipamentos" });

  return (
    <PaginaCadastroDedicada
      backLabel="Equipamentos"
      backTo="/admin/equipamentos"
      title="Novo equipamento"
      tag="frota"
    >
      <EquipamentoForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
```

Crie `src/routes/admin.equipamentos.novo.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { NovoEquipamentoPage } from "@/features/equipamentos/components/novo-equipamento-page";

export const Route = createFileRoute("/admin/equipamentos/novo")({
  head: () => ({
    meta: [
      { title: "Novo equipamento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoEquipamentoPage,
});
```

- [ ] **Step 7: Trocar o botão "Novo equipamento" por navegação em `equipamentos-page.tsx`**

Em `src/features/equipamentos/components/equipamentos-page.tsx`, remova a função `abrirNovo` (linhas 128-131):

```tsx
  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
```

Troque o botão do `PageHeader` (linhas 376-383):

```tsx
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo equipamento
          </Button>
```

por:

```tsx
          <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
            <Link to="/admin/equipamentos/novo">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Novo equipamento
            </Link>
          </Button>
```

Troque o botão do empty state (linhas 404-411):

```tsx
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro equipamento
              </Button>
            ) : undefined,
```

por:

```tsx
            todos.length === 0 ? (
              <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/admin/equipamentos/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro equipamento
                </Link>
              </Button>
            ) : undefined,
```

Simplifique o título do `FormDialog` (linhas 416-421) — troque `titulo={editando ? "Editar equipamento" : "Novo equipamento"}` por `titulo="Editar equipamento"`.

- [ ] **Step 8: Rodar a suíte completa e checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run test`
Expected: PASS, sem regressão.

- [ ] **Step 9: Commit**

```bash
git add src/features/equipamentos/components/equipamento-form.tsx \
  src/features/equipamentos/components/equipamento-form.test.tsx \
  src/features/equipamentos/components/resumo-novo-equipamento.tsx \
  src/features/equipamentos/components/novo-equipamento-page.tsx \
  src/routes/admin.equipamentos.novo.tsx \
  src/features/equipamentos/components/equipamentos-page.tsx
git commit -m "feat: move equipamento creation to dedicated page /admin/equipamentos/novo"
```

---

### Task 4: Componente de Custo — página dedicada `/admin/custo-hora/novo`

**Files:**
- Modify: `src/shared/types/index.ts` (interface `ComponenteCusto`, novo type `CategoriaComponenteCusto`)
- Modify: `src/mocks/componentes-custo.ts` (9 registros, via `sed`)
- Modify: `src/features/custo-hora/custo-hora-schema.ts`
- Modify: `src/features/custo-hora/labels.tsx` (novo `CATEGORIA_COMPONENTE_LABEL`/`CATEGORIAS_COMPONENTE`)
- Modify: `src/features/custo-hora/components/componente-custo-form.tsx`
- Create: `src/features/custo-hora/components/resumo-novo-custo.tsx`
- Create: `src/features/custo-hora/components/novo-custo-page.tsx`
- Create: `src/routes/admin.custo-hora.novo.tsx`
- Modify: `src/features/custo-hora/components/componente-custo-list.tsx`
- Test: `src/features/custo-hora/components/componente-custo-form.test.tsx`

**Interfaces:**
- Consumes: `PaginaCadastroDedicada`, `Linha` (Task 1).
- Produces: `CategoriaComponenteCusto` (type export); `CATEGORIA_COMPONENTE_LABEL`, `CATEGORIA_COMPONENTE_ICONE`, `CATEGORIAS_COMPONENTE` (`labels.tsx`); `ResumoNovoCusto`; `NovoCustoPage`.

- [ ] **Step 1: Atualizar o tipo `ComponenteCusto`**

Em `src/shared/types/index.ts`, localize:

```ts
export type TipoComponenteCusto = "fixo_mensal" | "variavel_hora" | "diesel" | "manutencao";

export interface ComponenteCusto {
  id: string;
  equipamento_id: string; // FK → Equipamento
  descricao: string; // ex.: "Parcela FINAME", "Seguro", "Material rodante", "Operador"
  tipo: TipoComponenteCusto; // configurável pelo usuário: só fixo_mensal | variavel_hora
  valor: number; // R$ (mensal se fixo; por hora se variável)
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

Troque para:

```ts
export type TipoComponenteCusto = "fixo_mensal" | "variavel_hora" | "diesel" | "manutencao";
export type CategoriaComponenteCusto =
  | "depreciacao"
  | "seguro"
  | "pneus"
  | "operador"
  | "indireto"
  | "outros";

export interface ComponenteCusto {
  id: string;
  equipamento_id: string; // FK → Equipamento
  descricao: string; // ex.: "Parcela FINAME", "Seguro", "Material rodante", "Operador"
  tipo: TipoComponenteCusto; // configurável pelo usuário: só fixo_mensal | variavel_hora
  valor: number; // R$ (mensal se fixo; por hora se variável)
  categoria: CategoriaComponenteCusto | null; // organização/relatório — não entra no cálculo
  competencia: string | null; // "YYYY-MM"
  observacao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Atualizar os 9 registros do mock**

```bash
sed -i -E '/^    valor: [0-9]+,$/a\    categoria: null,\n    competencia: null,\n    observacao: null,' src/mocks/componentes-custo.ts
```

Confirme:

```bash
grep -c "categoria: null," src/mocks/componentes-custo.ts
```

Expected: `9`.

- [ ] **Step 3: Atualizar `labels.tsx`**

Em `src/features/custo-hora/labels.tsx`, adicione (após o import, antes de `TIPO_COMPONENTE_LABEL`):

```tsx
import type { CategoriaComponenteCusto, TipoComponenteCusto } from "@/shared/types";
```

(troque a linha de import existente `import type { TipoComponenteCusto } from "@/shared/types";` por essa, incluindo `CategoriaComponenteCusto`.)

No final do arquivo, adicione:

```tsx
export const CATEGORIA_COMPONENTE_LABEL: Record<CategoriaComponenteCusto, string> = {
  depreciacao: "Depreciação",
  seguro: "Seguro",
  pneus: "Pneus / rodante",
  operador: "Operador / folha",
  indireto: "Custo indireto",
  outros: "Outros",
};

export const CATEGORIA_COMPONENTE_ICONE: Record<CategoriaComponenteCusto, string> = {
  depreciacao: "lucide:history",
  seguro: "lucide:badge-check",
  pneus: "lucide:truck",
  operador: "lucide:hard-hat",
  indireto: "lucide:wallet",
  outros: "lucide:calculator",
};

export const CATEGORIAS_COMPONENTE: CategoriaComponenteCusto[] = [
  "depreciacao",
  "seguro",
  "pneus",
  "operador",
  "indireto",
  "outros",
];
```

- [ ] **Step 4: Atualizar `custo-hora-schema.ts`**

Substitua o conteúdo inteiro de `src/features/custo-hora/custo-hora-schema.ts` por:

```ts
import { z } from "zod";

const valorPositivo = (msg = "Informe um valor maior que zero") =>
  z.number({ invalid_type_error: "Informe um valor válido" }).positive(msg);

export const componenteCustoSchema = z.object({
  equipamento_id: z.string().min(1, "Selecione o equipamento"),
  descricao: z.string().trim().min(2, "Informe a descrição"),
  tipo: z.enum(["fixo_mensal", "variavel_hora"]),
  valor: valorPositivo(),
  categoria: z
    .enum(["depreciacao", "seguro", "pneus", "operador", "indireto", "outros"])
    .optional(),
  competencia: z.string().trim().optional(),
  observacao: z.string().trim().optional(),
  ativo: z.boolean(),
});

export type ComponenteCustoFormValues = z.infer<typeof componenteCustoSchema>;
```

- [ ] **Step 5: Criar `resumo-novo-custo.tsx`**

Crie `src/features/custo-hora/components/resumo-novo-custo.tsx`:

```tsx
import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { formatBRL } from "@/features/retaguarda/format";
import {
  CATEGORIA_COMPONENTE_LABEL,
  CATEGORIA_COMPONENTE_ICONE,
  unidadeComponente,
} from "@/features/custo-hora/labels";
import type { ComponenteCustoFormValues } from "@/features/custo-hora/custo-hora-schema";

interface Props {
  control: Control<ComponenteCustoFormValues>;
  equipamentoNome: string;
  impactoPorHora: number;
}

export function ResumoNovoCusto({ control, equipamentoNome, impactoPorHora }: Props) {
  const valores = useWatch({ control });
  const categoria = valores.categoria ?? "outros";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon={CATEGORIA_COMPONENTE_ICONE[categoria]} className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {CATEGORIA_COMPONENTE_LABEL[categoria]}
            </div>
            <div className="text-xs text-muted-foreground">{equipamentoNome}</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Valor"
            valor={valores.valor ? `${formatBRL(valores.valor)}${unidadeComponente(valores.tipo ?? "fixo_mensal")}` : "a definir"}
            vazio={!valores.valor}
          />
          <Linha
            rotulo="Competência"
            valor={valores.competencia?.trim() || "atual"}
            vazio={!valores.competencia?.trim()}
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Impacto no custo/h</span>
          <span className="font-mono text-lg font-bold text-primary">
            {formatBRL(Math.round(impactoPorHora * 100) / 100)}
            <span className="text-xs font-normal text-muted-foreground">/h</span>
          </span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Entra na composição do <strong className="text-foreground">Custo da Hora</strong> do
          equipamento (ao lado de diesel e manutenção).
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Escrever o teste que falha**

Crie `src/features/custo-hora/components/componente-custo-form.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ComponenteCustoForm } from "./componente-custo-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ComponenteCustoForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação calcula o impacto no custo/h ao vivo (base mensal)", () => {
    render(<ComponenteCustoForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Descrição *"), {
      target: { value: "Parcela FINAME" },
    });
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "4200" } });
    fireEvent.change(screen.getByLabelText("Horas/mês de referência"), {
      target: { value: "200" },
    });

    expect(screen.getByText("R$ 21,00")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <ComponenteCustoForm
        inicial={{
          id: "cc-teste",
          equipamento_id: "eq-001",
          descricao: "Componente Existente",
          tipo: "fixo_mensal",
          valor: 100,
          categoria: null,
          competencia: null,
          observacao: null,
          ativo: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Impacto no custo/h")).not.toBeInTheDocument();
  });

  it("cadastra o componente e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<ComponenteCustoForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Descrição *"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Componente cadastrado.");
  });
});
```

Note: `screen.getByLabelText("Valor (R$) *")` presume que `CurrencyInput` (já usado pelo formulário) associa o `Label htmlFor="valor"` ao input real — mesmo padrão já validado no componente atual (não muda nesta task).

- [ ] **Step 7: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/custo-hora/components/componente-custo-form.test.tsx`
Expected: FAIL.

- [ ] **Step 8: Atualizar `componente-custo-form.tsx`**

Substitua o conteúdo inteiro de `src/features/custo-hora/components/componente-custo-form.tsx` por:

```tsx
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/features/precos/components/currency-input";
import { componentesCustoStore } from "@/features/custo-hora/componentes-custo-store";
import {
  componenteCustoSchema,
  type ComponenteCustoFormValues,
} from "@/features/custo-hora/custo-hora-schema";
import {
  TIPOS_CONFIGURAVEIS,
  TIPO_COMPONENTE_LABEL,
  CATEGORIAS_COMPONENTE,
  CATEGORIA_COMPONENTE_LABEL,
} from "@/features/custo-hora/labels";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { ResumoNovoCusto } from "@/features/custo-hora/components/resumo-novo-custo";
import type { ComponenteCusto } from "@/shared/types";

interface Props {
  inicial: ComponenteCusto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ComponenteCustoForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentos = equipamentosStore.useAll().filter((e) => e.ativo);
  // Horas/mês de referência é só um auxílio de cálculo do "impacto no custo/h"
  // do resumo — não persiste em ComponenteCusto (não há coluna pra isso).
  const [horasReferencia, setHorasReferencia] = useState("160");
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ComponenteCustoFormValues>({
    resolver: zodResolver(componenteCustoSchema),
    defaultValues: {
      equipamento_id: inicial?.equipamento_id ?? "",
      descricao: inicial?.descricao ?? "",
      tipo: (inicial?.tipo as "fixo_mensal" | "variavel_hora") ?? "fixo_mensal",
      valor: inicial?.valor ?? 0,
      categoria: inicial?.categoria ?? undefined,
      competencia: inicial?.competencia ?? "",
      observacao: inicial?.observacao ?? "",
      ativo: inicial?.ativo ?? true,
    },
  });

  const equipamentoId = useWatch({ control, name: "equipamento_id" });
  const tipo = useWatch({ control, name: "tipo" });
  const valor = useWatch({ control, name: "valor" });
  const equipamentoNome =
    equipamentos.find((e) => e.id === equipamentoId)?.nome ?? "Selecione o equipamento";
  const horas = Number(horasReferencia) || 0;
  const impactoPorHora = tipo === "variavel_hora" ? (valor ?? 0) : horas ? (valor ?? 0) / horas : 0;

  const onSubmit = (values: ComponenteCustoFormValues) => {
    const payload = {
      equipamento_id: values.equipamento_id,
      descricao: values.descricao,
      tipo: values.tipo,
      valor: values.valor,
      categoria: values.categoria ?? null,
      competencia: values.competencia?.trim() ? values.competencia.trim() : null,
      observacao: values.observacao?.trim() ? values.observacao.trim() : null,
      ativo: values.ativo,
    };
    if (inicial) {
      componentesCustoStore.update(inicial.id, payload);
      toast.success("Componente atualizado.");
    } else {
      componentesCustoStore.create(payload);
      toast.success("Componente cadastrado.");
    }
    onSuccess();
  };

  const formulario = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="equipamento_id">Equipamento *</Label>
          <Controller
            control={control}
            name="equipamento_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="equipamento_id" aria-invalid={!!errors.equipamento_id}>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  {equipamentos.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.equipamento_id ? (
            <p className="text-xs text-destructive">{errors.equipamento_id.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoria</Label>
          <Controller
            control={control}
            name="categoria"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_COMPONENTE.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_COMPONENTE_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input id="descricao" {...register("descricao")} aria-invalid={!!errors.descricao} />
        {errors.descricao ? (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipo">Base do valor *</Label>
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CONFIGURAVEIS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIPO_COMPONENTE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="valor">Valor (R$) *</Label>
          <Controller
            control={control}
            name="valor"
            render={({ field }) => (
              <CurrencyInput
                id="valor"
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor}
              />
            )}
          />
          {errors.valor ? <p className="text-xs text-destructive">{errors.valor.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="horas_referencia">Horas/mês de referência</Label>
          <Input
            id="horas_referencia"
            type="number"
            min="0"
            inputMode="numeric"
            className="font-mono"
            disabled={tipo === "variavel_hora"}
            value={horasReferencia}
            onChange={(e) => setHorasReferencia(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="competencia">Competência</Label>
          <Input id="competencia" placeholder="mm/aaaa" {...register("competencia")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacao">Observações</Label>
        <Textarea
          id="observacao"
          placeholder="Critério de rateio, referência do contrato, memória de cálculo…"
          {...register("observacao")}
        />
      </div>

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Componente ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não entram no cálculo do custo/hora, mas ficam no histórico.
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
          <CardTitle>Dados do custo</CardTitle>
        </CardHeader>
        <CardContent>{formulario}</CardContent>
      </Card>
      <ResumoNovoCusto
        control={control}
        equipamentoNome={equipamentoNome}
        impactoPorHora={impactoPorHora}
      />
    </div>
  );
}
```

- [ ] **Step 9: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/custo-hora/components/componente-custo-form.test.tsx`
Expected: PASS.

- [ ] **Step 10: Criar a página e a rota**

Crie `src/features/custo-hora/components/novo-custo-page.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { ComponenteCustoForm } from "@/features/custo-hora/components/componente-custo-form";

export function NovoCustoPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/custo-hora" });

  return (
    <PaginaCadastroDedicada
      backLabel="Custo da Hora"
      backTo="/admin/custo-hora"
      title="Novo lançamento de custo"
      tag="custo da hora"
    >
      <ComponenteCustoForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
```

Crie `src/routes/admin.custo-hora.novo.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { NovoCustoPage } from "@/features/custo-hora/components/novo-custo-page";

export const Route = createFileRoute("/admin/custo-hora/novo")({
  head: () => ({
    meta: [
      { title: "Novo lançamento de custo · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoCustoPage,
});
```

- [ ] **Step 11: Trocar o botão "Novo componente" por navegação em `componente-custo-list.tsx`**

Em `src/features/custo-hora/components/componente-custo-list.tsx`, adicione ao topo dos imports:

```tsx
import { Link } from "@tanstack/react-router";
```

Remova a função `abrirNovo` (linhas 36-39):

```tsx
  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
```

Troque o botão do `toolbar` (linhas 137-143):

```tsx
      <Button
        onClick={abrirNovo}
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        <Icon icon="lucide:plus" className="h-4 w-4" />
        Novo componente
      </Button>
```

por:

```tsx
      <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
        <Link to="/admin/custo-hora/novo">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          Novo componente
        </Link>
      </Button>
```

Troque o botão do empty state (linhas 167-174):

```tsx
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro componente
              </Button>
            ) : undefined,
```

por:

```tsx
            todos.length === 0 ? (
              <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/admin/custo-hora/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro componente
                </Link>
              </Button>
            ) : undefined,
```

Simplifique o título do `FormDialog` (linha 182) — troque
`titulo={editando ? "Editar componente de custo" : "Novo componente de custo"}` por
`titulo="Editar componente de custo"`.

- [ ] **Step 12: Rodar a suíte completa e checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run test`
Expected: PASS, sem regressão.

- [ ] **Step 13: Commit**

```bash
git add src/shared/types/index.ts src/mocks/componentes-custo.ts \
  src/features/custo-hora/custo-hora-schema.ts src/features/custo-hora/labels.tsx \
  src/features/custo-hora/components/componente-custo-form.tsx \
  src/features/custo-hora/components/componente-custo-form.test.tsx \
  src/features/custo-hora/components/resumo-novo-custo.tsx \
  src/features/custo-hora/components/novo-custo-page.tsx \
  src/routes/admin.custo-hora.novo.tsx \
  src/features/custo-hora/components/componente-custo-list.tsx
git commit -m "feat: add categoria/competencia/observacao to ComponenteCusto and move creation to dedicated page"
```

---

### Task 5: Conta a Pagar — página dedicada `/admin/financeiro/contas-pagar/novo`

**Files:**
- Modify: `src/shared/types/index.ts` (interface `ContaPagar`, novo type `FormaPagamento`)
- Modify: `src/mocks/contas-pagar.ts` (5 registros, via `sed`)
- Modify: `src/features/financeiro/contas-pagar-store.ts` (`NovaContaPagar`)
- Modify: `src/features/financeiro/labels.tsx` (novo `FORMA_PAGAMENTO_LABEL`)
- Create: `src/features/financeiro/conta-pagar-schema.ts`
- Create: `src/features/financeiro/components/conta-pagar-form.tsx`
- Create: `src/features/financeiro/components/resumo-novo-pagamento.tsx`
- Create: `src/features/financeiro/components/nova-conta-pagar-page.tsx`
- Create: `src/routes/admin.financeiro.contas-pagar.novo.tsx`
- Modify: `src/features/financeiro/components/financeiro-page.tsx`
- Modify: `src/features/financeiro/components/contas-pagar-tab.tsx`
- Delete: `src/features/financeiro/components/nova-conta-pagar-dialog.tsx`
- Test: `src/features/financeiro/components/conta-pagar-form.test.tsx`

**Interfaces:**
- Consumes: `PaginaCadastroDedicada`, `Linha` (Task 1).
- Produces: `FormaPagamento` (type export); `FORMA_PAGAMENTO_LABEL` (`labels.tsx`); `contaPagarSchema`/`ContaPagarFormValues`; `ContaPagarForm({ onSuccess, onCancel })` (sem `inicial` — não existe edição de conta a pagar); `ResumoNovoPagamento`; `NovaContaPagarPage`.

- [ ] **Step 1: Atualizar o tipo `ContaPagar`**

Em `src/shared/types/index.ts`, localize:

```ts
export type FormaRecebimento = "dinheiro" | "pix" | "transferencia" | "boleto" | "cheque" | "outro";
export type CategoriaDespesa = "diesel" | "manutencao" | "folha" | "fornecedor" | "outro";
```

Adicione logo abaixo:

```ts
export type FormaPagamento = "dinheiro" | "pix" | "transferencia" | "boleto" | "cheque" | "outro";
```

Localize `interface ContaPagar` e troque:

```ts
export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  status: StatusConta;
  pago_em: string | null; // "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}
```

por:

```ts
export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  status: StatusConta;
  pago_em: string | null; // "YYYY-MM-DD"
  documento: string | null; // ex.: "BOL 8821", "NF 5540"
  forma_pagamento: FormaPagamento | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Atualizar os 5 registros do mock**

```bash
sed -i -E '/^    categoria: "[a-z]+",$/a\    documento: null,\n    forma_pagamento: null,\n    observacao: null,' src/mocks/contas-pagar.ts
```

Confirme:

```bash
grep -c "documento: null," src/mocks/contas-pagar.ts
```

Expected: `5`.

- [ ] **Step 3: Atualizar `contas-pagar-store.ts`**

Em `src/features/financeiro/contas-pagar-store.ts`, troque:

```ts
export type NovaContaPagar = {
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
};
```

por:

```ts
export type NovaContaPagar = {
  descricao: string;
  fornecedor: string | null;
  categoria: CategoriaDespesa;
  valor: number;
  vencimento: string; // "YYYY-MM-DD"
  documento: string | null;
  forma_pagamento: FormaPagamento | null;
  observacao: string | null;
};
```

E o import do topo do arquivo — troque `import type { ContaPagar, CategoriaDespesa } from "@/shared/types";` por `import type { ContaPagar, CategoriaDespesa, FormaPagamento } from "@/shared/types";`.

- [ ] **Step 4: Atualizar `labels.tsx` do Financeiro**

Em `src/features/financeiro/labels.tsx`, troque o import do topo:

```tsx
import type { StatusConta, CategoriaDespesa, FormaRecebimento } from "@/shared/types";
```

por:

```tsx
import type { StatusConta, CategoriaDespesa, FormaRecebimento, FormaPagamento } from "@/shared/types";
```

No final do arquivo, adicione:

```tsx
export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  transferencia: "Transferência",
  boleto: "Boleto",
  cheque: "Cheque",
  outro: "Outro",
};
```

- [ ] **Step 5: Criar `conta-pagar-schema.ts`**

Crie `src/features/financeiro/conta-pagar-schema.ts`:

```ts
import { z } from "zod";

export const contaPagarSchema = z.object({
  descricao: z.string().trim().min(3, "Mínimo 3 caracteres"),
  fornecedor: z.string().trim().optional(),
  categoria: z.enum(["diesel", "manutencao", "folha", "fornecedor", "outro"]),
  valor: z.coerce.number().positive("Valor deve ser positivo"),
  vencimento: z.string().min(10, "Informe a data de vencimento"),
  documento: z.string().trim().optional(),
  forma_pagamento: z
    .enum(["dinheiro", "pix", "transferencia", "boleto", "cheque", "outro"])
    .optional(),
  observacao: z.string().trim().optional(),
});

export type ContaPagarFormValues = z.infer<typeof contaPagarSchema>;
```

- [ ] **Step 6: Criar `resumo-novo-pagamento.tsx`**

Crie `src/features/financeiro/components/resumo-novo-pagamento.tsx`:

```tsx
import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { formatBRL } from "@/features/retaguarda/format";
import { CATEGORIA_LABEL, FORMA_PAGAMENTO_LABEL } from "@/features/financeiro/labels";
import type { ContaPagarFormValues } from "@/features/financeiro/conta-pagar-schema";

export function ResumoNovoPagamento({ control }: { control: Control<ContaPagarFormValues> }) {
  const valores = useWatch({ control });
  const categoria = valores.categoria ?? "diesel";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Icon icon="lucide:wallet" className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.fornecedor?.trim() || "Novo pagamento"}
            </div>
            <div className="text-xs text-muted-foreground">{CATEGORIA_LABEL[categoria]}</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha
            rotulo="Documento"
            valor={valores.documento?.trim() || "sem documento"}
            vazio={!valores.documento?.trim()}
          />
          <Linha
            rotulo="Vencimento"
            valor={valores.vencimento || "a definir"}
            vazio={!valores.vencimento}
          />
          <Linha
            rotulo="Forma"
            valor={
              valores.forma_pagamento ? FORMA_PAGAMENTO_LABEL[valores.forma_pagamento] : "a definir"
            }
            vazio={!valores.forma_pagamento}
          />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Valor a pagar</span>
          <span className="font-mono text-lg font-bold text-primary">
            {formatBRL(valores.valor ?? 0)}
          </span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:info" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Entra em <strong className="text-foreground">Financeiro › Contas a pagar</strong>. Pagamentos
          de <strong className="text-foreground">diesel</strong> e{" "}
          <strong className="text-foreground">manutenção</strong> são rateados no{" "}
          <strong className="text-foreground">Custo da Hora</strong> do equipamento.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Escrever o teste que falha**

Crie `src/features/financeiro/components/conta-pagar-form.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { ContaPagarForm } from "./conta-pagar-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ContaPagarForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<ContaPagarForm onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo pagamento")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Fornecedor / beneficiário *"), {
      target: { value: "Posto Missões" },
    });
    fireEvent.change(screen.getByLabelText("Documento"), { target: { value: "NF 5540" } });

    expect(screen.getByText("Posto Missões")).toBeInTheDocument();
    expect(screen.getByText("NF 5540")).toBeInTheDocument();
  });

  it("registra a conta e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<ContaPagarForm onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Descrição *"), {
      target: { value: "Abastecimento Julho" },
    });
    fireEvent.change(screen.getByLabelText("Fornecedor / beneficiário *"), {
      target: { value: "Posto Missões" },
    });
    fireEvent.change(screen.getByLabelText("Valor (R$) *"), { target: { value: "1500" } });
    fireEvent.change(screen.getByLabelText("Vencimento *"), {
      target: { value: "2026-08-10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lançar pagamento" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Conta a pagar registrada.");
  });
});
```

- [ ] **Step 8: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/financeiro/components/conta-pagar-form.test.tsx`
Expected: FAIL.

- [ ] **Step 9: Criar `conta-pagar-form.tsx`**

Crie `src/features/financeiro/components/conta-pagar-form.tsx`:

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { contasPagarStore } from "@/features/financeiro/contas-pagar-store";
import {
  contaPagarSchema,
  type ContaPagarFormValues,
} from "@/features/financeiro/conta-pagar-schema";
import { CATEGORIA_LABEL, FORMA_PAGAMENTO_LABEL } from "@/features/financeiro/labels";
import { ResumoNovoPagamento } from "@/features/financeiro/components/resumo-novo-pagamento";
import type { CategoriaDespesa, FormaPagamento } from "@/shared/types";

const CATEGORIAS: CategoriaDespesa[] = ["diesel", "manutencao", "folha", "fornecedor", "outro"];
const FORMAS: FormaPagamento[] = ["dinheiro", "pix", "transferencia", "boleto", "cheque", "outro"];

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

// Conta a Pagar não tem fluxo de edição (só criação e "dar baixa", via
// dar-baixa-pagar-dialog.tsx) — por isso este formulário, ao contrário de
// ClienteForm/EquipamentoForm/OperadorForm/ComponenteCustoForm, não recebe
// `inicial` e sempre renderiza o layout de 2 colunas com resumo.
export function ContaPagarForm({ onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContaPagarFormValues>({
    resolver: zodResolver(contaPagarSchema),
    defaultValues: { categoria: "diesel" },
  });

  const onSubmit = (values: ContaPagarFormValues) => {
    contasPagarStore.criar({
      descricao: values.descricao,
      fornecedor: values.fornecedor?.trim() || null,
      categoria: values.categoria,
      valor: values.valor,
      vencimento: values.vencimento,
      documento: values.documento?.trim() || null,
      forma_pagamento: values.forma_pagamento ?? null,
      observacao: values.observacao?.trim() || null,
    });
    toast.success("Conta a pagar registrada.");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do título</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria *</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.categoria ? (
                <p className="text-xs text-destructive">{errors.categoria.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forma_pagamento">Forma de pagamento</Label>
              <Controller
                control={control}
                name="forma_pagamento"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="forma_pagamento">
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FORMA_PAGAMENTO_LABEL[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Ex: Abastecimento Julho"
              {...register("descricao")}
              aria-invalid={!!errors.descricao}
            />
            {errors.descricao ? (
              <p className="text-xs text-destructive">{errors.descricao.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fornecedor">Fornecedor / beneficiário *</Label>
            <Input
              id="fornecedor"
              placeholder="Ex.: Posto Missões"
              {...register("fornecedor")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                className="font-mono"
                placeholder="BOL 8821 / NF 5540"
                {...register("documento")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vencimento">Vencimento *</Label>
              <Input
                id="vencimento"
                type="date"
                className="font-mono"
                {...register("vencimento")}
                aria-invalid={!!errors.vencimento}
              />
              {errors.vencimento ? (
                <p className="text-xs text-destructive">{errors.vencimento.message}</p>
              ) : null}
            </div>
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
              aria-invalid={!!errors.valor}
            />
            {errors.valor ? <p className="text-xs text-destructive">{errors.valor.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Rateio por equipamento, centro de custo, referência…"
              {...register("observacao")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isSubmitting ? "Salvando…" : "Lançar pagamento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ResumoNovoPagamento control={control} />
    </form>
  );
}
```

- [ ] **Step 10: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/financeiro/components/conta-pagar-form.test.tsx`
Expected: PASS.

- [ ] **Step 11: Criar a página e a rota**

Crie `src/features/financeiro/components/nova-conta-pagar-page.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { ContaPagarForm } from "@/features/financeiro/components/conta-pagar-form";

export function NovaContaPagarPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/financeiro" });

  return (
    <PaginaCadastroDedicada
      backLabel="Financeiro"
      backTo="/admin/financeiro"
      title="Novo pagamento"
      tag="conta a pagar"
    >
      <ContaPagarForm onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
```

Crie `src/routes/admin.financeiro.contas-pagar.novo.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { NovaContaPagarPage } from "@/features/financeiro/components/nova-conta-pagar-page";

export const Route = createFileRoute("/admin/financeiro/contas-pagar/novo")({
  head: () => ({
    meta: [
      { title: "Novo pagamento · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovaContaPagarPage,
});
```

- [ ] **Step 12: Trocar o botão por navegação e remover o diálogo**

Em `src/features/financeiro/components/contas-pagar-tab.tsx`, troque o import do topo:

```tsx
import { Button } from "@/components/ui/button";
```

por:

```tsx
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
```

Remova `onNovaConta` da interface e da desestruturação de props:

```tsx
interface ContasPagarTabProps {
  contasPagar: ContaPagar[];
  onDarBaixa?: (conta: ContaPagar) => void;
  onNovaConta?: () => void;
}

export function ContasPagarTab({ contasPagar, onDarBaixa, onNovaConta }: ContasPagarTabProps) {
```

por:

```tsx
interface ContasPagarTabProps {
  contasPagar: ContaPagar[];
  onDarBaixa?: (conta: ContaPagar) => void;
}

export function ContasPagarTab({ contasPagar, onDarBaixa }: ContasPagarTabProps) {
```

Troque o botão (linhas 21-25):

```tsx
      <div className="flex justify-end">
        <Button onClick={onNovaConta}>
          <Icon icon="lucide:plus" className="mr-1.5 h-4 w-4" />
          Nova Conta a Pagar
        </Button>
      </div>
```

por:

```tsx
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/admin/financeiro/contas-pagar/novo">
            <Icon icon="lucide:plus" className="mr-1.5 h-4 w-4" />
            Nova Conta a Pagar
          </Link>
        </Button>
      </div>
```

Em `src/features/financeiro/components/financeiro-page.tsx`, remova o import:

```tsx
import { NovaContaPagarDialog } from "@/features/financeiro/components/nova-conta-pagar-dialog";
```

Remova o estado `novaContaAberta` (linha 26):

```tsx
  const [novaContaAberta, setNovaContaAberta] = useState(false);
```

No `<ContasPagarTab>`, remova a prop `onNovaConta`:

```tsx
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab
            contasPagar={contasPagar}
            onDarBaixa={setContaPagarSelecionada}
            onNovaConta={() => setNovaContaAberta(true)}
          />
        </TabsContent>
```

por:

```tsx
        <TabsContent value="pagar" className="mt-4">
          <ContasPagarTab contasPagar={contasPagar} onDarBaixa={setContaPagarSelecionada} />
        </TabsContent>
```

Remova o JSX de `<NovaContaPagarDialog open={novaContaAberta} onOpenChange={setNovaContaAberta} />` (linha 82) inteiro.

Delete `src/features/financeiro/components/nova-conta-pagar-dialog.tsx`:

```bash
rm src/features/financeiro/components/nova-conta-pagar-dialog.tsx
```

- [ ] **Step 13: Rodar a suíte completa e checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run test`
Expected: PASS, sem regressão.

- [ ] **Step 14: Commit**

```bash
git add src/shared/types/index.ts src/mocks/contas-pagar.ts \
  src/features/financeiro/contas-pagar-store.ts src/features/financeiro/labels.tsx \
  src/features/financeiro/conta-pagar-schema.ts \
  src/features/financeiro/components/conta-pagar-form.tsx \
  src/features/financeiro/components/conta-pagar-form.test.tsx \
  src/features/financeiro/components/resumo-novo-pagamento.tsx \
  src/features/financeiro/components/nova-conta-pagar-page.tsx \
  src/routes/admin.financeiro.contas-pagar.novo.tsx \
  src/features/financeiro/components/financeiro-page.tsx \
  src/features/financeiro/components/contas-pagar-tab.tsx
git add -u src/features/financeiro/components/nova-conta-pagar-dialog.tsx
git commit -m "feat: add documento/forma_pagamento/observacao to ContaPagar and move creation to dedicated page"
```

---

### Task 6: Operador — página dedicada `/admin/operadores/novo`

**Files:**
- Create: `supabase/migrations/20260715120000_operadores_campos_cadastrais.sql`
- Modify: `src/shared/types/index.ts` (interface `Operador`, novo type `VinculoOperador`)
- Modify: `src/shared/types/database.ts` (regenerar, escopar só `operadores`/`operadores_equipamentos`/RPC `criar_operador`)
- Modify: `src/mocks/operadores.ts` (5 registros, via `sed`)
- Modify: `src/features/operadores/operador-schema.ts`
- Modify: `src/features/operadores/operadores-store.ts`
- Modify: `vitest.setup.ts` (fixture `operadores`/`operadores_equipamentos` + mock de `supabase.rpc`)
- Modify: `src/features/operadores/components/operador-form.tsx`
- Create: `src/features/operadores/components/resumo-novo-operador.tsx`
- Create: `src/features/operadores/components/novo-operador-page.tsx`
- Create: `src/routes/admin.operadores.novo.tsx`
- Modify: `src/features/operadores/components/operadores-page.tsx`
- Test: `src/features/operadores/components/operador-form.test.tsx`

**Interfaces:**
- Consumes: `PaginaCadastroDedicada`, `Linha` (Task 1).
- Produces: `VinculoOperador` (type export); `ResumoNovoOperador`; `NovoOperadorPage`.

- [ ] **Step 1: Escrever e aplicar a migration**

Crie `supabase/migrations/20260715120000_operadores_campos_cadastrais.sql`:

```sql
alter table public.operadores
  add column vinculo text check (vinculo in ('CLT', 'PJ')),
  add column data_nascimento date,
  add column cnh_categoria text,
  add column cnh_validade date,
  add column base text;

create table public.operadores_equipamentos (
  operador_id uuid not null references public.operadores (id) on delete cascade,
  equipamento_id uuid not null references public.equipamentos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (operador_id, equipamento_id)
);

alter table public.operadores_equipamentos enable row level security;

create policy "retaguarda lê operadores_equipamentos"
  on public.operadores_equipamentos for select
  to authenticated
  using (public.is_retaguarda());

create policy "retaguarda gerencia operadores_equipamentos"
  on public.operadores_equipamentos for all
  to authenticated
  using (public.is_retaguarda())
  with check (public.is_retaguarda());

-- Estende criar_operador com os novos campos cadastrais e a lista de
-- equipamentos habilitados — mantém tudo atômico na mesma transação da RPC
-- (em vez de um insert separado do lado do cliente após o retorno).
create or replace function public.criar_operador(
  p_nome text,
  p_telefone text,
  p_cpf text,
  p_ativo boolean default true,
  p_vinculo text default null,
  p_data_nascimento date default null,
  p_cnh_categoria text default null,
  p_cnh_validade date default null,
  p_base text default null,
  p_equipamentos_ids uuid[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_operador public.operadores;
  v_cpf text := regexp_replace(p_cpf, '\D', '', 'g');
begin
  if not public.is_retaguarda() then
    raise exception 'Acesso negado';
  end if;

  insert into public.operadores (
    nome, telefone, cpf, pin_hash, ativo,
    vinculo, data_nascimento, cnh_categoria, cnh_validade, base
  )
  values (
    trim(p_nome),
    nullif(trim(coalesce(p_telefone, '')), ''),
    v_cpf,
    extensions.crypt(right(v_cpf, 4), extensions.gen_salt('bf')),
    coalesce(p_ativo, true),
    p_vinculo,
    p_data_nascimento,
    p_cnh_categoria,
    p_cnh_validade,
    p_base
  )
  returning * into v_operador;

  if p_equipamentos_ids is not null and array_length(p_equipamentos_ids, 1) > 0 then
    insert into public.operadores_equipamentos (operador_id, equipamento_id)
    select v_operador.id, unnest(p_equipamentos_ids);
  end if;

  return jsonb_build_object(
    'id', v_operador.id,
    'nome', v_operador.nome,
    'telefone', v_operador.telefone,
    'cpf', v_operador.cpf,
    'ativo', v_operador.ativo,
    'vinculo', v_operador.vinculo,
    'data_nascimento', v_operador.data_nascimento,
    'cnh_categoria', v_operador.cnh_categoria,
    'cnh_validade', v_operador.cnh_validade,
    'base', v_operador.base,
    'created_at', v_operador.created_at,
    'updated_at', v_operador.updated_at
  );
end;
$$;

revoke all on function public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[]
) from public;
grant execute on function public.criar_operador(
  text, text, text, boolean, text, date, text, date, text, uuid[]
) to authenticated;
```

Aplique via `mcp__supabase__apply_migration` (`name: "operadores_campos_cadastrais"`). Confirme com `mcp__supabase__list_tables` (schema `public`, `verbose: true`) que `operadores` tem as 5 colunas novas (todas nullable) e que `operadores_equipamentos` existe com RLS habilitada.

- [ ] **Step 2: Atualizar o tipo `Operador`**

Em `src/shared/types/index.ts`, localize:

```ts
export interface Operador {
  id: string;
  nome: string;
  telefone: string | null;
  cpf: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

Troque para:

```ts
export type VinculoOperador = "CLT" | "PJ";

export interface Operador {
  id: string;
  nome: string;
  telefone: string | null;
  cpf: string;
  ativo: boolean;
  vinculo: VinculoOperador | null;
  data_nascimento: string | null; // "YYYY-MM-DD"
  cnh_categoria: string | null;
  cnh_validade: string | null; // "YYYY-MM-DD"
  base: string | null;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 3: Regenerar `database.ts`, escopado**

Rode `mcp__supabase__generate_typescript_types` e compare o resultado com o `src/shared/types/database.ts` atual. Aplique **só** as mudanças relacionadas a `operadores` (5 colunas novas em Row/Insert/Update), a tabela nova `operadores_equipamentos` (Row/Insert/Update + Relationships) e a assinatura da função `criar_operador` em `Functions`. Se o regen trouxer qualquer outra mudança não relacionada (mesmo padrão de drift já visto na Task 1 da Nova OS), reverta manualmente essas partes e mantenha o resto do arquivo intacto. Rode `npx prettier --write src/shared/types/database.ts` ao final. Confirme com `git diff src/shared/types/database.ts` que o diff contém só mudanças de `operadores`/`operadores_equipamentos`/`criar_operador`.

- [ ] **Step 4: Atualizar os 5 registros do mock**

```bash
sed -i -E '/^    cpf: "[0-9]+",$/a\    vinculo: null,\n    data_nascimento: null,\n    cnh_categoria: null,\n    cnh_validade: null,\n    base: null,' src/mocks/operadores.ts
```

Confirme:

```bash
grep -c "vinculo: null," src/mocks/operadores.ts
```

Expected: `5`.

- [ ] **Step 5: Atualizar `operador-schema.ts`**

Substitua o conteúdo inteiro de `src/features/operadores/operador-schema.ts` por:

```ts
import { z } from "zod";
import { isCpf } from "@/shared/lib/validators";

export const operadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do operador"),
  cpf: z
    .string()
    .trim()
    .refine((v) => isCpf(v), "CPF inválido"),
  telefone: z.string().trim().optional(),
  ativo: z.boolean(),
  vinculo: z.enum(["CLT", "PJ"]).optional(),
  data_nascimento: z.string().trim().optional(),
  cnh_categoria: z.string().trim().optional(),
  cnh_validade: z.string().trim().optional(),
  base: z.string().trim().optional(),
  equipamentos_ids: z.array(z.string()).optional(),
});

export type OperadorFormValues = z.infer<typeof operadorSchema>;
```

- [ ] **Step 6: Atualizar `operadores-store.ts`**

Em `src/features/operadores/operadores-store.ts`, troque:

```ts
type NovoOperador = Omit<Operador, "id" | "created_at" | "updated_at">;
```

por:

```ts
type NovoOperador = Omit<Operador, "id" | "created_at" | "updated_at"> & {
  equipamentos_ids?: string[];
};
```

Troque a função `create`:

```ts
const create = async (dados: NovoOperador): Promise<Operador> => {
  const { data, error } = await supabase.rpc("criar_operador", {
    p_nome: dados.nome,
    p_telefone: dados.telefone,
    p_cpf: dados.cpf,
    p_ativo: dados.ativo,
  });

  if (error) throw new Error(error.message);
  await carregar();
  return data as unknown as Operador;
};
```

por:

```ts
const create = async (dados: NovoOperador): Promise<Operador> => {
  const { data, error } = await supabase.rpc("criar_operador", {
    p_nome: dados.nome,
    p_telefone: dados.telefone,
    p_cpf: dados.cpf,
    p_ativo: dados.ativo,
    p_vinculo: dados.vinculo,
    p_data_nascimento: dados.data_nascimento,
    p_cnh_categoria: dados.cnh_categoria,
    p_cnh_validade: dados.cnh_validade,
    p_base: dados.base,
    p_equipamentos_ids: dados.equipamentos_ids ?? null,
  });

  if (error) throw new Error(error.message);
  await carregar();
  return data as unknown as Operador;
};
```

- [ ] **Step 7: Estender o mock de Supabase em `vitest.setup.ts`**

Em `vitest.setup.ts`, adicione ao topo, junto dos outros imports de fixture:

```ts
import { operadores as operadoresFixture } from "./src/mocks/operadores";
```

No objeto `tabelas`, adicione a entrada `operadores` (e uma entrada vazia para a tabela de junção nova):

```ts
  const tabelas: Record<string, Record<string, unknown>[]> = {
    equipamentos: equipamentosFixture.map((e) => ({ ...e })),
    clientes: clientesFixture.map((c) => ({ ...c })),
    ordens_servico: ordensFixture.map((o) => ({ ...o })),
    orcamentos: orcamentosFixture.map(({ itens: _itens, ...o }) => ({ ...o })),
    orcamento_itens: orcamentosFixture.flatMap((o) =>
      o.itens.map((item) => ({ ...item, orcamento_id: o.id })),
    ),
    avisos_whatsapp: avisosWhatsAppFixture.map((a) => ({ ...a })),
    operadores: operadoresFixture.map((o) => ({ ...o })),
    operadores_equipamentos: [],
  };
```

No objeto `supabase` retornado, adicione `rpc` (mantendo `from`/`functions`/`auth` como já estão):

```ts
  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
      rpc: (fn: string, args: Record<string, unknown> = {}) => {
        if (fn === "criar_operador") {
          const agora = new Date().toISOString();
          const id = `operadores-teste-${(tabelas.operadores?.length ?? 0) + 1}`;
          const novo = {
            id,
            nome: String(args.p_nome ?? "").trim(),
            telefone: args.p_telefone ? String(args.p_telefone).trim() : null,
            cpf: String(args.p_cpf ?? "").replace(/\D/g, ""),
            ativo: (args.p_ativo as boolean | undefined) ?? true,
            vinculo: (args.p_vinculo as string | null | undefined) ?? null,
            data_nascimento: (args.p_data_nascimento as string | null | undefined) ?? null,
            cnh_categoria: (args.p_cnh_categoria as string | null | undefined) ?? null,
            cnh_validade: (args.p_cnh_validade as string | null | undefined) ?? null,
            base: (args.p_base as string | null | undefined) ?? null,
            created_at: agora,
            updated_at: agora,
          };
          tabelas.operadores = [...(tabelas.operadores ?? []), novo];
          const equipamentosIds = (args.p_equipamentos_ids as string[] | null | undefined) ?? [];
          tabelas.operadores_equipamentos = [
            ...(tabelas.operadores_equipamentos ?? []),
            ...equipamentosIds.map((equipamentoId) => ({
              operador_id: id,
              equipamento_id: equipamentoId,
              created_at: agora,
            })),
          ];
          return Promise.resolve({ data: novo, error: null });
        }
        return Promise.resolve({
          data: null,
          error: { message: `RPC "${fn}" não mockada em vitest.setup.ts` },
        });
      },
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
      },
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
    },
    sessaoRestaurada: Promise.resolve({ data: { session: null }, error: null }),
  };
```

- [ ] **Step 8: Criar `resumo-novo-operador.tsx`**

Crie `src/features/operadores/components/resumo-novo-operador.tsx`:

```tsx
import { useWatch, type Control } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Linha } from "@/shared/components/linha-resumo";
import { iniciais } from "@/features/operadores/components/operador-hero";
import type { OperadorFormValues } from "@/features/operadores/operador-schema";
import type { Equipamento } from "@/shared/types";

interface Props {
  control: Control<OperadorFormValues>;
  equipamentosSelecionados: Equipamento[];
}

export function ResumoNovoOperador({ control, equipamentosSelecionados }: Props) {
  const valores = useWatch({ control });
  const cnh = valores.cnh_categoria
    ? `Categoria ${valores.cnh_categoria}${valores.cnh_validade ? ` · ${valores.cnh_validade}` : ""}`
    : "a definir";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
            {iniciais(valores.nome ?? "")}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">
              {valores.nome?.trim() || "Novo operador"}
            </div>
            <div className="text-xs text-muted-foreground">
              Operador · {valores.vinculo ?? "CLT"}
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          <Linha rotulo="CPF" valor={valores.cpf?.trim() || "a definir"} vazio={!valores.cpf?.trim()} />
          <Linha
            rotulo="Telefone"
            valor={valores.telefone?.trim() || "a definir"}
            vazio={!valores.telefone?.trim()}
          />
          <Linha rotulo="CNH" valor={cnh} vazio={!valores.cnh_categoria} />
          <Linha rotulo="Base" valor={valores.base?.trim() || "a definir"} vazio={!valores.base?.trim()} />
          <Linha
            rotulo="Equipamentos"
            valor={
              equipamentosSelecionados.length > 0
                ? `${equipamentosSelecionados.length} habilitados`
                : "nenhum"
            }
            vazio={equipamentosSelecionados.length === 0}
          />
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Icon icon="lucide:lock" className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Perfil operacional — sem dados financeiros. O PIN inicial de acesso ao app de campo será
          os últimos 4 dígitos do CPF.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Escrever o teste que falha**

Crie `src/features/operadores/components/operador-form.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { OperadorForm } from "./operador-form";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("OperadorForm", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it("na criação mostra o resumo ao vivo e atualiza ao digitar", () => {
    render(<OperadorForm inicial={null} onSuccess={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Novo operador")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Adelar Machado" } });
    fireEvent.change(screen.getByLabelText("Base"), { target: { value: "Santo Ângelo — RS" } });

    expect(screen.getByText("ADELAR MACHADO")).toBeInTheDocument();
    expect(screen.getByText("Santo Ângelo — RS")).toBeInTheDocument();
  });

  it("na edição não mostra o resumo ao vivo", () => {
    render(
      <OperadorForm
        inicial={{
          id: "op-teste",
          nome: "Operador Existente",
          telefone: null,
          cpf: "11111111111",
          ativo: true,
          vinculo: null,
          data_nascimento: null,
          cnh_categoria: null,
          cnh_validade: null,
          base: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }}
        onSuccess={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.queryByText("Novo operador")).not.toBeInTheDocument();
  });

  it("cadastra o operador e chama onSuccess", async () => {
    const onSuccess = vi.fn();
    render(<OperadorForm inicial={null} onSuccess={onSuccess} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText("Nome *"), { target: { value: "Teste Operador" } });
    fireEvent.change(screen.getByLabelText("CPF *"), { target: { value: "52998224725" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Operador cadastrado.");
  });
});
```

(CPF `52998224725` no terceiro teste é um CPF matematicamente válido — necessário porque `operadorSchema` valida via `isCpf`.)

- [ ] **Step 10: Rodar o teste para confirmar que falha**

Run: `npx vitest run src/features/operadores/components/operador-form.test.tsx`
Expected: FAIL.

- [ ] **Step 11: Atualizar `operador-form.tsx`**

Substitua o conteúdo inteiro de `src/features/operadores/components/operador-form.tsx` por:

```tsx
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { operadoresStore } from "@/features/operadores/operadores-store";
import { operadorSchema, type OperadorFormValues } from "@/features/operadores/operador-schema";
import { equipamentosStore } from "@/features/equipamentos/equipamentos-store";
import { ResumoNovoOperador } from "@/features/operadores/components/resumo-novo-operador";
import type { Operador, Equipamento } from "@/shared/types";

const CNH_CATEGORIAS = ["A", "B", "C", "D", "E"];

interface Props {
  inicial: Operador | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OperadorForm({ inicial, onSuccess, onCancel }: Props) {
  const equipamentosAtivos = equipamentosStore.useAll().filter((e) => e.ativo);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OperadorFormValues>({
    resolver: zodResolver(operadorSchema),
    defaultValues: {
      nome: inicial?.nome ?? "",
      cpf: inicial?.cpf ?? "",
      telefone: inicial?.telefone ?? "",
      ativo: inicial?.ativo ?? true,
      vinculo: inicial?.vinculo ?? "CLT",
      data_nascimento: inicial?.data_nascimento ?? "",
      cnh_categoria: inicial?.cnh_categoria ?? "",
      cnh_validade: inicial?.cnh_validade ?? "",
      base: inicial?.base ?? "",
      equipamentos_ids: [],
    },
  });

  const onSubmit = async (values: OperadorFormValues) => {
    const payload = {
      nome: values.nome,
      cpf: values.cpf.replace(/\D/g, ""),
      telefone: values.telefone?.trim() ? values.telefone.trim() : null,
      ativo: values.ativo,
      vinculo: values.vinculo ?? null,
      data_nascimento: values.data_nascimento?.trim() ? values.data_nascimento.trim() : null,
      cnh_categoria: values.cnh_categoria?.trim() ? values.cnh_categoria.trim() : null,
      cnh_validade: values.cnh_validade?.trim() ? values.cnh_validade.trim() : null,
      base: values.base?.trim() ? values.base.trim() : null,
      equipamentos_ids: values.equipamentos_ids,
    };
    try {
      if (inicial) {
        await operadoresStore.update(inicial.id, payload);
        toast.success("Operador atualizado.");
      } else {
        await operadoresStore.create(payload);
        toast.success("Operador cadastrado.");
      }
      onSuccess();
    } catch (err) {
      const detalhe = err instanceof Error ? `: ${err.message}` : "";
      toast.error(
        (inicial ? "Falha ao atualizar o operador" : "Falha ao cadastrar o operador") + detalhe,
      );
    }
  };

  const formulario = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
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

      {!inicial ? (
        <div className="space-y-1.5">
          <Label htmlFor="vinculo">Vínculo</Label>
          <Controller
            control={control}
            name="vinculo"
            render={({ field }) => (
              <Select value={field.value ?? "CLT"} onValueChange={field.onChange}>
                <SelectTrigger id="vinculo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="PJ">PJ</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          inputMode="numeric"
          placeholder="somente números"
          className="font-mono"
          {...register("cpf")}
          aria-invalid={!!errors.cpf}
        />
        {errors.cpf ? (
          <p className="text-xs text-destructive">{errors.cpf.message}</p>
        ) : !inicial ? (
          <p className="text-xs text-muted-foreground">
            O PIN inicial de acesso ao app de campo será os últimos 4 dígitos do CPF.
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          inputMode="tel"
          placeholder="opcional — ex.: 44999990001"
          className="font-mono"
          {...register("telefone")}
        />
      </div>

      {!inicial ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="data_nascimento">Nascimento</Label>
              <Input id="data_nascimento" type="date" className="font-mono" {...register("data_nascimento")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base">Base</Label>
              <Input id="base" placeholder="Santo Ângelo — RS" {...register("base")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cnh_categoria">CNH — categoria</Label>
              <Controller
                control={control}
                name="cnh_categoria"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="cnh_categoria">
                      <SelectValue placeholder="Selecione…" />
                    </SelectTrigger>
                    <SelectContent>
                      {CNH_CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>
                          Categoria {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cnh_validade">CNH — validade</Label>
              <Input id="cnh_validade" type="date" className="font-mono" {...register("cnh_validade")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium leading-none">Equipamentos habilitados</span>
            <Controller
              control={control}
              name="equipamentos_ids"
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2">
                  {equipamentosAtivos.map((e) => {
                    const selecionados = field.value ?? [];
                    const marcado = selecionados.includes(e.id);
                    return (
                      <label key={e.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={marcado}
                          onCheckedChange={(v) =>
                            field.onChange(
                              v ? [...selecionados, e.id] : selecionados.filter((id) => id !== e.id),
                            )
                          }
                        />
                        {e.nome}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </>
      ) : null}

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border bg-surface/40 px-3 py-2.5">
            <div>
              <Label htmlFor="ativo">Operador ativo</Label>
              <p className="text-xs text-muted-foreground">
                Inativos não podem ser atribuídos a novas ordens.
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
      <ResumoNovoOperadorConectado control={control} equipamentosAtivos={equipamentosAtivos} />
    </div>
  );
}

// Lê `equipamentos_ids` do próprio formulário (useWatch) e resolve pra
// objetos Equipamento completos antes de repassar ao resumo — mantém
// ResumoNovoOperador simples (recebe a lista já resolvida, não os ids).
function ResumoNovoOperadorConectado({
  control,
  equipamentosAtivos,
}: {
  control: Control<OperadorFormValues>;
  equipamentosAtivos: Equipamento[];
}) {
  const ids = useWatch({ control, name: "equipamentos_ids" }) ?? [];
  const selecionados = equipamentosAtivos.filter((e) => ids.includes(e.id));
  return <ResumoNovoOperador control={control} equipamentosSelecionados={selecionados} />;
}
```

- [ ] **Step 12: Rodar o teste para confirmar que passa**

Run: `npx vitest run src/features/operadores/components/operador-form.test.tsx`
Expected: PASS.

- [ ] **Step 13: Criar a página e a rota**

Crie `src/features/operadores/components/novo-operador-page.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { PaginaCadastroDedicada } from "@/shared/components/pagina-cadastro-dedicada";
import { OperadorForm } from "@/features/operadores/components/operador-form";

export function NovoOperadorPage() {
  const navigate = useNavigate();
  const voltar = () => navigate({ to: "/admin/operadores" });

  return (
    <PaginaCadastroDedicada
      backLabel="Operadores"
      backTo="/admin/operadores"
      title="Novo operador"
      tag="cadastro"
    >
      <OperadorForm inicial={null} onSuccess={voltar} onCancel={voltar} />
    </PaginaCadastroDedicada>
  );
}
```

Crie `src/routes/admin.operadores.novo.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { NovoOperadorPage } from "@/features/operadores/components/novo-operador-page";

export const Route = createFileRoute("/admin/operadores/novo")({
  head: () => ({
    meta: [
      { title: "Novo operador · Antonello" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NovoOperadorPage,
});
```

- [ ] **Step 14: Trocar o botão "Novo operador" por navegação em `operadores-page.tsx`**

Em `src/features/operadores/components/operadores-page.tsx`, remova a função `abrirNovo` (linhas 69-72):

```tsx
  const abrirNovo = () => {
    setEditando(null);
    setFormAberto(true);
  };
```

Troque o botão do `PageHeader` (linhas 263-270):

```tsx
          <Button
            onClick={abrirNovo}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Novo operador
          </Button>
```

por:

```tsx
          <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
            <Link to="/admin/operadores/novo">
              <Icon icon="lucide:plus" className="h-4 w-4" />
              Novo operador
            </Link>
          </Button>
```

Troque o botão do empty state (linhas 289-296):

```tsx
            todos.length === 0 ? (
              <Button
                onClick={abrirNovo}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                <Icon icon="lucide:plus" className="h-4 w-4" />
                Cadastrar primeiro operador
              </Button>
            ) : undefined,
```

por:

```tsx
            todos.length === 0 ? (
              <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary-hover">
                <Link to="/admin/operadores/novo">
                  <Icon icon="lucide:plus" className="h-4 w-4" />
                  Cadastrar primeiro operador
                </Link>
              </Button>
            ) : undefined,
```

Simplifique o título do `FormDialog` (linha 304) — troque `titulo={editando ? "Editar operador" : "Novo operador"}` por `titulo="Editar operador"`.

- [ ] **Step 15: Rodar a suíte completa e checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run test`
Expected: PASS — todos os testes existentes + os novos desta task, sem regressão.

- [ ] **Step 16: Commit**

```bash
git add supabase/migrations/20260715120000_operadores_campos_cadastrais.sql \
  src/shared/types/index.ts src/shared/types/database.ts src/mocks/operadores.ts \
  src/features/operadores/operador-schema.ts src/features/operadores/operadores-store.ts \
  vitest.setup.ts \
  src/features/operadores/components/operador-form.tsx \
  src/features/operadores/components/operador-form.test.tsx \
  src/features/operadores/components/resumo-novo-operador.tsx \
  src/features/operadores/components/novo-operador-page.tsx \
  src/routes/admin.operadores.novo.tsx \
  src/features/operadores/components/operadores-page.tsx
git commit -m "feat: add cadastral fields and equipamentos habilitados to Operador, move creation to dedicated page"
```

---

## Self-Review Notes

- **Spec coverage:** as 8 decisões da spec (`docs/superpowers/specs/2026-07-15-cadastros-paginas-dedicadas-design.md`) estão cobertas: shell compartilhado (Task 1), rotas novas + botões viram `Link` (Tasks 2-6), edição fora de escopo (branch `if (inicial) return formulario` preservado em todas as 4 telas dual-purpose), Custo/Pagamento sem migration (Tasks 4/5 só tocam `shared/types/index.ts` + mocks), Cliente/Equipamento reskin puro (Tasks 2/3 sem campo novo), Custo com 3 campos + sem "base anual" (Task 4), Operador com 5 colunas + tabela de junção + sem toggle de app (Task 6), Pagamento com 3 campos + sem rascunho + categoria inalterada (Task 5).
- **Placeholder scan:** nenhum "TBD"/similar. Uma primeira versão deste plano deixou um rascunho morto (`ResumoComEquipamentos` retornando `null`) e um teste inválido (`.valueOf`) na Task 6 — corrigidos inline durante este self-review; os Steps 9 e 11 da Task 6 agora contêm só a versão final de cada arquivo, sem rascunhos intermediários.
- **Type consistency:** `PaginaCadastroDedicadaProps.backTo` (Task 1) usa a mesma união literal das 5 rotas usadas em `NovoXPage` (Tasks 2-6). `Linha` (Task 1) tem a mesma assinatura em todo `ResumoNovoX`. `CategoriaComponenteCusto`/`FormaPagamento`/`VinculoOperador` (Tasks 4/5/6) são definidos uma vez em `shared/types/index.ts` e importados (não redeclarados) em `labels.tsx`, no schema e nos componentes. `NovaContaPagar`/`NovoOperador` (stores) recebem exatamente os campos que os respectivos `XForm.onSubmit` produzem.
- **Escopo:** Orçamento, Abastecimento, Manutenção, Parâmetros, Sobre e a divergência de fluxo da Nova NF ficam de fora desta onda (ver `docs/prds/ROADMAP-ui-kit-retaguarda.md`) — nenhuma task deste plano toca esses arquivos.
