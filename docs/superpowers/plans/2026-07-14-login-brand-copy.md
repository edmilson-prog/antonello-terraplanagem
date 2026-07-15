# Login — Reintrodução do Texto de Marca Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reintroduzir o texto de marca (tagline mono "Gestão de Terraplanagem" + parágrafo de destaque) no topo do painel de marca da tela `/login`, ajustando o gradiente para sustentar a legibilidade do texto sem perder o efeito full-bleed da foto.

**Architecture:** Mudança contida em um único arquivo de produção (`src/features/auth/login-page.tsx`): troca o valor do gradiente do `<aside>` e insere um novo bloco JSX de texto antes do rodapé técnico já existente. O `<aside>` já é `flex flex-col` com a imagem/gradiente `absolute` (fora do fluxo) e o rodapé com `mt-auto` — o bloco novo entra no fluxo flex como primeiro item, sem precisar de posicionamento adicional.

**Tech Stack:** React + TypeScript + Tailwind CSS (classes utilitárias), Vitest + Testing Library para os testes.

## Global Constraints

- Conteúdo textual exato (não alterar a redação):
  - Tagline: `Gestão de Terraplanagem`
  - Parágrafo: `Horas de máquina, ordens de serviço e faturamento em um só lugar — com a rentabilidade de cada equipamento e cada obra sempre à vista.`
- Gradiente novo do `<aside>`: `bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85` (substitui `from-asphalt/10 via-asphalt/5 to-asphalt/75`).
- Tagline: `font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary`.
- Parágrafo: `max-w-sm text-balance text-base leading-relaxed text-sidebar-foreground/90`.
- Bloco novo: `<div className="relative space-y-3 p-10">`, inserido **antes** do `<div className="relative mt-auto space-y-4 p-10">` (rodapé técnico) dentro do `<aside>`.
- Nenhuma mudança no rodapé técnico, em `/admin`, em outras telas, ou em qualquer outro arquivo além de `src/features/auth/login-page.tsx` e `src/features/auth/login-page.test.tsx`.
- Sem lógica condicional de tema para o texto novo — o painel de marca já é sempre escuro, independente do `theme` atual.
- Sem alteração em nenhum outro teste já existente em `login-page.test.tsx` — todos os 8 testes atuais devem continuar passando inalterados.

---

### Task 1: Reintroduzir texto de marca no painel de login

**Files:**
- Modify: `src/features/auth/login-page.tsx:69-98` (bloco do `<aside>`)
- Test: `src/features/auth/login-page.test.tsx`

**Interfaces:**
- Consumes: nenhuma interface nova — usa apenas classes Tailwind já existentes no projeto (`text-primary`, `text-sidebar-foreground`, `bg-asphalt`, `font-mono`, `font-sans` via padrão).
- Produces: nenhuma interface nova — mudança é puramente de JSX/markup dentro do componente `LoginPage`, que já é exportado e consumido por `src/routes/login.tsx` sem alterações de assinatura.

- [ ] **Step 1: Escrever os testes que falham**

Abra `src/features/auth/login-page.test.tsx` e adicione estes dois testes **dentro do bloco `describe("LoginPage", ...)`**, logo após o teste `"renderiza o rodapé de versão no painel de marca"` (linha 28, após o `});` que fecha esse `it`):

```tsx
  it("renderiza a tagline de marca no painel de marca", () => {
    render(<LoginPage />);
    expect(screen.getByText("Gestão de Terraplanagem")).toBeInTheDocument();
  });

  it("renderiza o parágrafo de destaque no painel de marca", () => {
    render(<LoginPage />);
    expect(
      screen.getByText(/Horas de máquina, ordens de serviço e faturamento/),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/features/auth/login-page.test.tsx`
Expected: FAIL — os dois novos testes não encontram o texto ("Unable to find an element with the text..."), os outros 8 testes existentes continuam passando.

- [ ] **Step 3: Ajustar o gradiente do `<aside>`**

Em `src/features/auth/login-page.tsx`, localize (dentro do bloco `<aside>`, por volta da linha 81-84):

```tsx
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/10 via-asphalt/5 to-asphalt/75"
        />
```

Troque para:

```tsx
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85"
        />
```

- [ ] **Step 4: Inserir o bloco de texto de marca**

Ainda em `src/features/auth/login-page.tsx`, localize o fechamento da `<div>` do gradiente e a abertura do rodapé técnico (por volta das linhas 84-87):

```tsx
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85"
        />

        <div className="relative mt-auto space-y-4 p-10">
          <HazardStripe className="h-2" />
```

Insira o novo bloco entre as duas, ficando assim:

```tsx
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85"
        />

        <div className="relative space-y-3 p-10">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Gestão de Terraplanagem
          </p>
          <p className="max-w-sm text-balance text-base leading-relaxed text-sidebar-foreground/90">
            Horas de máquina, ordens de serviço e faturamento em um só lugar — com a
            rentabilidade de cada equipamento e cada obra sempre à vista.
          </p>
        </div>

        <div className="relative mt-auto space-y-4 p-10">
          <HazardStripe className="h-2" />
```

O `<aside>` inteiro deve ficar assim após a mudança (para conferência — não é um passo à parte, é o resultado dos Steps 3 e 4 juntos):

```tsx
      <aside
        className={cn(
          "relative hidden w-1/2 flex-col overflow-hidden bg-asphalt md:flex",
          "md:absolute md:inset-y-0 md:left-0 md:transition-transform md:duration-500 md:ease-in-out motion-reduce:md:transition-none",
          invertido ? "md:translate-x-full" : "md:translate-x-0",
        )}
      >
        <img
          src="/logo-antonello-preto.png"
          alt="Antonello Terraplanagem"
          className="absolute inset-0 h-full w-full select-none object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85"
        />

        <div className="relative space-y-3 p-10">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Gestão de Terraplanagem
          </p>
          <p className="max-w-sm text-balance text-base leading-relaxed text-sidebar-foreground/90">
            Horas de máquina, ordens de serviço e faturamento em um só lugar — com a
            rentabilidade de cada equipamento e cada obra sempre à vista.
          </p>
        </div>

        <div className="relative mt-auto space-y-4 p-10">
          <HazardStripe className="h-2" />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold text-sidebar-foreground">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
              Sistemas operacionais
            </span>
            <span className="ml-auto font-mono text-[11px] text-sidebar-foreground/60">
              v{VERSAO_SISTEMA} · {CODINOME_SISTEMA}
            </span>
          </div>
        </div>
      </aside>
```

- [ ] **Step 5: Rodar os testes para confirmar que passam**

Run: `npx vitest run src/features/auth/login-page.test.tsx`
Expected: PASS — todos os 10 testes (8 existentes + 2 novos) passam.

- [ ] **Step 6: Rodar a suíte completa para garantir que nada quebrou fora deste arquivo**

Run: `npm run test`
Expected: PASS — todos os testes do projeto (incluindo os 548 já existentes antes desta task) continuam passando.

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/login-page.tsx src/features/auth/login-page.test.tsx
git commit -m "feat: reintroduce brand copy on login brand panel"
```

---

## Self-Review Notes

- **Spec coverage:** todos os 8 pontos de decisão da spec (`docs/superpowers/specs/2026-07-14-login-brand-copy-design.md`) estão cobertos: posição no topo (Step 4), gradiente nas duas pontas (Step 3), ordem tagline→parágrafo (Step 4), conteúdo textual inalterado (Global Constraints + Step 4), hierarquia tipográfica exata (Step 4), espaçamento `p-10`/`space-y-3` (Step 4), sem lógica de tema (nenhum `invertido`/`theme` usado no bloco novo), só desktop (bloco vive dentro do `<aside>` que já é `hidden md:flex`, herda a regra sem mudança adicional).
- **Placeholder scan:** nenhum "TBD"/"TODO" — todo código e comando estão completos e literais.
- **Type consistency:** nenhuma interface nova, nenhuma prop nova — o componente `LoginPage` mantém a mesma assinatura (sem parâmetros), consumido sem mudança por `src/routes/login.tsx`.
