# Landing Page Institucional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Servir uma landing page institucional em `/`, reaproveitando o design system exportado em `docs/html/Antonello Terraplanagem — Design System (2)/ui_kits/site/`, com dados reais da empresa levantados do ERP legado.

**Architecture:** Feature folder novo `src/features/site/` com um componente por seção (header, hero, marquee, contadores, serviços, frota, processo, contato, footer), montados por `landing-page.tsx` e servidos pela rota `src/routes/index.tsx` (que hoje só redireciona para `/login`). Dois hooks próprios cobrem a interatividade (reveal-on-scroll, contadores animados), sem bibliotecas novas. Zero tokens de design novos — tudo reaproveita `src/styles.css`.

**Tech Stack:** React 19, TanStack Router (file-based routes), Tailwind CSS v4, shadcn/ui (`Button`), `@iconify/react` (ícones `lucide:*`), Vitest + Testing Library.

**Branch:** `feat/landing-page-institucional` (já criada a partir de `main` @ `ad594c2`, que inclui a spec aprovada).

## Global Constraints

- **Sem tokens de design novos.** Toda cor/fonte vem de `src/styles.css` (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`, `bg-sidebar`, `text-sidebar-foreground`, `font-display`/`font-sans`/`font-mono`). Nunca hardcodar hex.
- **Sem dependências novas no `package.json`.** Animações (reveal-on-scroll, contadores, marquee) são hooks React + CSS puro.
- **Sem formulário de lead.** Todo CTA "Pedir orçamento"/"Falar no WhatsApp" é um link direto `https://wa.me/5555999242409?text=...` (mensagem pré-preenchida diferente por CTA). Nenhum deles faz scroll interno.
- **Dados reais da empresa** (tabela `EMPRESA` do ERP legado `docs/db/Gerencial.fdb`): cidade/UF `Frederico Westphalen — RS`, telefone/WhatsApp `(55) 99924-2409`, CNPJ `36.508.280/0001-90`. Não usar e-mail nem nome de responsável do ERP (info interna, fora de escopo público).
- **Placeholders explícitos no código** (comentário `// PLACEHOLDER: ...`) para: contadores do hero (números do mock, não medidos), os 3 cards da seção "Frota própria" (máquinas de exemplo, não o inventário real), e fotos (usar `FotoPlaceholder` em vez de `<img>`).
- **Tema:** a landing reage ao toggle claro/escuro já existente (`useTheme`/`ThemeToggle` de `src/shared/`) — nada de tema fixo.
- **Ícones:** `@iconify/react`, prefixo `lucide:` — nunca SVG inline novo (exceto o logo-tile de marca, que é um desenho de marca fixo, não um ícone de UI).
- **Acessibilidade/motion:** toda animação (reveal, contador, marquee) respeita `prefers-reduced-motion: reduce`.
- **`prossiga` de teste:** todo teste que renderiza algo dependente de `window.matchMedia` precisa que o global esteja stubado (jsdom não implementa `matchMedia` por padrão neste projeto — verificado empiricamente).

---

### Task 1: `contato.ts` — dados reais da empresa

**Files:**
- Create: `src/features/site/lib/contato.ts`
- Test: `src/features/site/lib/contato.test.ts`

**Interfaces:**
- Produces: `contato: { cidadeUf: string; telefoneExibicao: string; cnpj: string; whatsappOrcamento: string; whatsappContato: string }` — usado por `site-header.tsx`, `hero-section.tsx`, `contato-band.tsx`, `site-footer.tsx` (tasks 4, 5, 11).

- [ ] **Step 1: Write the failing test**

```ts
// src/features/site/lib/contato.test.ts
import { describe, it, expect } from "vitest";
import { contato } from "./contato";

describe("contato", () => {
  it("expõe os dados reais da empresa e wa.me links distintos por CTA", () => {
    expect(contato.cidadeUf).toBe("Frederico Westphalen — RS");
    expect(contato.telefoneExibicao).toBe("(55) 99924-2409");
    expect(contato.cnpj).toBe("36.508.280/0001-90");

    expect(contato.whatsappOrcamento).toMatch(/^https:\/\/wa\.me\/5555999242409\?text=/);
    expect(contato.whatsappContato).toMatch(/^https:\/\/wa\.me\/5555999242409\?text=/);
    expect(contato.whatsappOrcamento).not.toBe(contato.whatsappContato);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/lib/contato.test.ts`
Expected: FAIL with "Cannot find module './contato'" (o arquivo ainda não existe).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/features/site/lib/contato.ts
const TELEFONE_DIGITOS = "5555999242409"; // 55 (Brasil) + 55 (DDD) + 999242409
const CNPJ = "36.508.280/0001-90";
const CIDADE_UF = "Frederico Westphalen — RS";
const TELEFONE_EXIBICAO = "(55) 99924-2409";

function whatsappHref(mensagem: string): string {
  return `https://wa.me/${TELEFONE_DIGITOS}?text=${encodeURIComponent(mensagem)}`;
}

export const contato = {
  cidadeUf: CIDADE_UF,
  telefoneExibicao: TELEFONE_EXIBICAO,
  cnpj: CNPJ,
  whatsappOrcamento: whatsappHref(
    "Olá! Gostaria de pedir um orçamento de terraplanagem com a Antonello Terraplanagem.",
  ),
  whatsappContato: whatsappHref("Olá! Gostaria de falar com a Antonello Terraplanagem."),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/lib/contato.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/lib/contato.ts src/features/site/lib/contato.test.ts
git commit -m "feat: add real company contact constants for the landing page"
```

---

### Task 2: hooks `useCountUp` e `useRevealOnScroll` + polyfill de teste

**Files:**
- Create: `src/features/site/hooks/use-count-up.ts`
- Create: `src/features/site/hooks/use-count-up.test.ts`
- Create: `src/features/site/hooks/use-reveal-on-scroll.ts`
- Create: `src/features/site/hooks/use-reveal-on-scroll.test.tsx`
- Modify: `vitest.setup.ts` — adicionar polyfill global de `window.matchMedia` (jsdom não implementa por padrão; qualquer teste que renderize algo usando esses hooks — ou `ThemeToggle` — quebra sem isso).

**Interfaces:**
- Produces: `useCountUp(alvo: number, ativo: boolean, duracaoMs?: number): number` — usado por `contadores-section.tsx` (task 7).
- Produces: `useRevealOnScroll<T extends HTMLElement>(): { ref: React.RefObject<T | null>; revelado: boolean }` — usado por `hero-section.tsx`, `contadores-section.tsx`, `servicos-section.tsx`, `frota-section.tsx` (tasks 5, 7, 8, 9).

- [ ] **Step 1: Write the failing tests**

```ts
// src/features/site/hooks/use-count-up.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useCountUp } from "./use-count-up";

describe("useCountUp", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("não anima enquanto ativo é false", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { result } = renderHook(() => useCountUp(100, false));
    expect(result.current).toBe(0);
  });

  it("anima até o valor alvo quando ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    let callback: FrameRequestCallback | null = null;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      callback = cb;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.spyOn(performance, "now").mockReturnValue(0);

    const { result } = renderHook(() => useCountUp(100, true));

    expect(callback).not.toBeNull();
    vi.spyOn(performance, "now").mockReturnValue(2000); // além da duração padrão (1500ms)
    act(() => {
      callback?.(2000);
    });

    expect(result.current).toBe(100);
  });

  it("aplica o valor final direto quando prefers-reduced-motion está ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { result } = renderHook(() => useCountUp(42, true));
    expect(result.current).toBe(42);
  });
});
```

```tsx
// src/features/site/hooks/use-reveal-on-scroll.test.tsx
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useRevealOnScroll } from "./use-reveal-on-scroll";

function Exemplo() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();
  return <div ref={ref} data-testid="alvo">{revelado ? "visivel" : "oculto"}</div>;
}

describe("useRevealOnScroll", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("revela imediatamente quando prefers-reduced-motion está ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    render(<Exemplo />);
    expect(screen.getByTestId("alvo")).toHaveTextContent("visivel");
  });

  it("revela quando o IntersectionObserver reporta interseção", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    let callback: IntersectionObserverCallback | null = null;
    class ObserverFalso {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", ObserverFalso);

    render(<Exemplo />);
    expect(screen.getByTestId("alvo")).toHaveTextContent("oculto");

    act(() => {
      callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(screen.getByTestId("alvo")).toHaveTextContent("visivel");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/site/hooks/use-count-up.test.ts src/features/site/hooks/use-reveal-on-scroll.test.tsx`
Expected: FAIL — módulos `./use-count-up` e `./use-reveal-on-scroll` não existem; e o primeiro teste (`matchMedia`) falharia mesmo depois de criar os arquivos, com `TypeError: window.matchMedia is not a function`, até o Step 3b ser feito.

- [ ] **Step 3a: Write minimal implementation — hooks**

```ts
// src/features/site/hooks/use-count-up.ts
import { useEffect, useRef, useState } from "react";

export function useCountUp(alvo: number, ativo: boolean, duracaoMs = 1500): number {
  const [valor, setValor] = useState(0);
  const jaAnimouRef = useRef(false);

  useEffect(() => {
    if (!ativo || jaAnimouRef.current) return;
    jaAnimouRef.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValor(alvo);
      return;
    }

    let frame: number;
    const inicio = performance.now();

    function tick(agora: number) {
      const progresso = Math.min(1, (agora - inicio) / duracaoMs);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setValor(Math.round(alvo * suavizado));
      if (progresso < 1) {
        frame = requestAnimationFrame(tick);
      }
    }
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [ativo, alvo, duracaoMs]);

  return valor;
}
```

```ts
// src/features/site/hooks/use-reveal-on-scroll.ts
import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevelado(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setRevelado(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevelado(true);
          observer.unobserve(elemento);
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(elemento);

    return () => observer.disconnect();
  }, []);

  return { ref, revelado };
}
```

- [ ] **Step 3b: Add global `matchMedia` polyfill to the test setup**

Modify `vitest.setup.ts` — adicionar no topo do arquivo (antes do `vi.mock("./src/lib/supabase", ...)` existente):

```ts
// jsdom (ambiente de teste deste projeto) não implementa window.matchMedia por
// padrão. Vários componentes/hooks usam prefers-color-scheme (useTheme) e
// prefers-reduced-motion (useCountUp, useRevealOnScroll) — sem este polyfill,
// qualquer teste que os renderize quebra com "matchMedia is not a function".
// Testes que precisam simular prefers-reduced-motion: reduce sobrescrevem isso
// com vi.stubGlobal("matchMedia", ...) e limpam com vi.unstubAllGlobals().
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/site/hooks/use-count-up.test.ts src/features/site/hooks/use-reveal-on-scroll.test.tsx`
Expected: PASS (3 + 2 tests)

- [ ] **Step 5: Commit**

```bash
git add vitest.setup.ts src/features/site/hooks/use-count-up.ts src/features/site/hooks/use-count-up.test.ts src/features/site/hooks/use-reveal-on-scroll.ts src/features/site/hooks/use-reveal-on-scroll.test.tsx
git commit -m "feat: add count-up and reveal-on-scroll hooks for the landing page"
```

---

### Task 3: `FotoPlaceholder`

**Files:**
- Create: `src/features/site/components/foto-placeholder.tsx`
- Test: `src/features/site/components/foto-placeholder.test.tsx`

**Interfaces:**
- Produces: `FotoPlaceholder({ icone: string; legenda: string; className?: string }): JSX.Element` — usado por `hero-section.tsx` (task 5) e `frota-section.tsx` (task 9).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/foto-placeholder.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FotoPlaceholder } from "./foto-placeholder";

describe("FotoPlaceholder", () => {
  it("renderiza a legenda e aceita className adicional", () => {
    const { container } = render(
      <FotoPlaceholder icone="lucide:truck" legenda="Foto da obra" className="h-40" />,
    );
    expect(screen.getByText("Foto da obra")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("h-40");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/foto-placeholder.test.tsx`
Expected: FAIL with "Cannot find module './foto-placeholder'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/foto-placeholder.tsx
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export interface FotoPlaceholderProps {
  icone: string;
  legenda: string;
  className?: string;
}

// Bloco visual temporário no lugar de uma foto real (obra/frota) ainda não
// recebida do cliente — trocar por <img> assim que as fotos chegarem.
export function FotoPlaceholder({ icone, legenda, className }: FotoPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-gradient-to-br from-surface to-card p-4 text-center",
        className,
      )}
    >
      <Icon icon={icone} className="h-8 w-8 text-primary" aria-hidden />
      <p className="text-xs font-medium text-muted-foreground">{legenda}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/foto-placeholder.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/foto-placeholder.tsx src/features/site/components/foto-placeholder.test.tsx
git commit -m "feat: add photo placeholder component for the landing page"
```

---

### Task 4: `MarcaAntonello` e `SiteHeader`

**Files:**
- Create: `src/features/site/components/marca-antonello.tsx`
- Create: `src/features/site/components/marca-antonello.test.tsx`
- Create: `src/features/site/components/site-header.tsx`
- Create: `src/features/site/components/site-header.test.tsx`

**Interfaces:**
- Consumes: `contato.whatsappOrcamento` (task 1); `Button` de `@/components/ui/button`; `ThemeToggle` de `@/shared/components/theme-toggle` (já existe, sem props).
- Produces: `MarcaAntonello({ className?: string }): JSX.Element` — reaproveitado por `site-footer.tsx` (task 11). `SiteHeader(): JSX.Element` — usado por `landing-page.tsx` (task 12).

- [ ] **Step 1: Write the failing tests**

```tsx
// src/features/site/components/marca-antonello.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarcaAntonello } from "./marca-antonello";

describe("MarcaAntonello", () => {
  it("renderiza o nome da marca com link para o topo", () => {
    render(<MarcaAntonello />);
    expect(screen.getByText("ANTONELLO")).toBeInTheDocument();
    expect(screen.getByText("TERRAPLANAGEM")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "#top");
  });
});
```

```tsx
// src/features/site/components/site-header.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renderiza os links de navegação e o CTA de orçamento", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "#servicos");
    expect(screen.getByRole("link", { name: "Frota" })).toHaveAttribute("href", "#frota");
    expect(screen.getByRole("link", { name: "Como trabalhamos" })).toHaveAttribute(
      "href",
      "#processo",
    );
    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute("href", "#contato");

    const cta = screen.getByRole("link", { name: /pedir orçamento/i });
    expect(cta).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));
    expect(cta).toHaveAttribute("target", "_blank");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/site/components/marca-antonello.test.tsx src/features/site/components/site-header.test.tsx`
Expected: FAIL — módulos ainda não existem.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/marca-antonello.tsx
import { cn } from "@/lib/utils";

export interface MarcaAntonelloProps {
  className?: string;
}

// Logo-tile + nome da marca, reaproveitado no header e no rodapé da landing.
// SVG fixo (cor âmbar de marca, não um ícone de UI) — funciona sobre fundo
// claro ou escuro, diferente dos PNGs `/logo-antonello-*.png` que já trazem
// um fundo sólido embutido (ver `login-page.tsx`).
export function MarcaAntonello({ className }: MarcaAntonelloProps) {
  return (
    <a href="#top" className={cn("flex items-center gap-2.5", className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 48 48"
        role="img"
        aria-label="Antonello Terraplanagem"
        className="shrink-0"
      >
        <rect width="48" height="48" rx="14" fill="#ffb300" />
        <g
          transform="translate(12,12)"
          fill="none"
          stroke="#16140f"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 20h18" />
          <path d="M6 20v-4h4v4" />
          <path d="m10 16 3-7 5 4v3" />
        </g>
      </svg>
      <span className="font-display text-sm font-extrabold leading-tight text-foreground">
        ANTONELLO
        <span className="block text-[9px] font-semibold tracking-[0.22em] text-primary">
          TERRAPLANAGEM
        </span>
      </span>
    </a>
  );
}
```

```tsx
// src/features/site/components/site-header.tsx
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { MarcaAntonello } from "@/features/site/components/marca-antonello";
import { contato } from "@/features/site/lib/contato";

const LINKS_NAV = [
  { href: "#servicos", label: "Serviços" },
  { href: "#frota", label: "Frota" },
  { href: "#processo", label: "Como trabalhamos" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <MarcaAntonello className="mr-auto" />
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS_NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <Button
          asChild
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <a href={contato.whatsappOrcamento} target="_blank" rel="noopener noreferrer">
            Pedir orçamento
            <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/site/components/marca-antonello.test.tsx src/features/site/components/site-header.test.tsx`
Expected: PASS (1 + 1 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/marca-antonello.tsx src/features/site/components/marca-antonello.test.tsx src/features/site/components/site-header.tsx src/features/site/components/site-header.test.tsx
git commit -m "feat: add brand mark and sticky header for the landing page"
```

---

### Task 5: `HeroSection`

**Files:**
- Create: `src/features/site/components/hero-section.tsx`
- Test: `src/features/site/components/hero-section.test.tsx`

**Interfaces:**
- Consumes: `contato` (task 1), `FotoPlaceholder` (task 3), `useRevealOnScroll` (task 2), `Button` de `@/components/ui/button`.
- Produces: `HeroSection(): JSX.Element` — usado por `landing-page.tsx` (task 12). Renderiza `<section id="top">`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/hero-section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  it("renderiza o título, os CTAs de WhatsApp e os chips", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "O terreno pronto para o seu projeto",
    );

    const orcamento = screen.getByRole("link", { name: /pedir orçamento/i });
    expect(orcamento).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));

    const whatsapp = screen.getByRole("link", { name: /falar no whatsapp/i });
    expect(whatsapp).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));
    expect(orcamento).not.toBe(whatsapp);

    expect(screen.getByText("Apontamento por horímetro")).toBeInTheDocument();
    expect(screen.getByText("Medição e NF por etapa")).toBeInTheDocument();
    expect(screen.getByText("Orçamento em até 48 h")).toBeInTheDocument();
    expect(screen.getByText(/Frederico Westphalen — RS/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/hero-section.test.tsx`
Expected: FAIL with "Cannot find module './hero-section'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/hero-section.tsx
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { FotoPlaceholder } from "@/features/site/components/foto-placeholder";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";
import { contato } from "@/features/site/lib/contato";

const CHIPS = ["Apontamento por horímetro", "Medição e NF por etapa", "Orçamento em até 48 h"];

export function HeroSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="top" className="relative overflow-hidden px-6 pb-18 pt-20 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        ref={ref}
        className={`mx-auto grid max-w-6xl gap-14 transition-all duration-700 lg:grid-cols-[1.06fr_1fr] lg:items-center ${
          revelado ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div>
          <span className="inline-flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="hazard-stripe h-2 w-6 rounded-sm" />
            {contato.cidadeUf} · Frota própria
          </span>
          <h1 className="mt-4 text-balance font-display text-[42px] font-extrabold uppercase leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
            O terreno <em className="not-italic text-primary">pronto</em> para o seu projeto
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Terraplenagem, escavação e infraestrutura de solo com equipamentos próprios,
            operadores experientes e gestão de obra em tempo real — do orçamento à nota fiscal.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              <a href={contato.whatsappOrcamento} target="_blank" rel="noopener noreferrer">
                Pedir orçamento
                <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5 rounded-xl">
              <a href={contato.whatsappContato} target="_blank" rel="noopener noreferrer">
                <Icon icon="lucide:message-circle" className="h-4 w-4" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <li
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <Icon icon="lucide:check" className="h-3.5 w-3.5 text-primary" />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <FotoPlaceholder
            icone="lucide:image"
            legenda="Foto de obra (escavadeira em operação)"
            className="h-[340px] sm:h-[400px]"
          />
          <div className="absolute -right-3 top-5 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Icon icon="lucide:clipboard-list" className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">OS-021 em andamento</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                Terraplenagem · lote industrial
              </div>
            </div>
          </div>
          <div className="absolute -left-4 bottom-6 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Icon icon="lucide:gauge" className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Horímetro 4.210 → 4.218
              </div>
              <div className="font-mono text-[11px] text-muted-foreground">
                8,0 h apontadas hoje
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/hero-section.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/hero-section.tsx src/features/site/components/hero-section.test.tsx
git commit -m "feat: add hero section for the landing page"
```

---

### Task 6: `MarqueeServicos`

**Files:**
- Create: `src/features/site/components/marquee-servicos.tsx`
- Test: `src/features/site/components/marquee-servicos.test.tsx`
- Modify: `src/styles.css` — adicionar `@keyframes marquee` (usado via classe arbitrária `animate-[marquee_30s_linear_infinite]`; nenhum utilitário de marquee existe hoje no projeto).

**Interfaces:**
- Produces: `MarqueeServicos(): JSX.Element` — usado por `landing-page.tsx` (task 12). Sem props.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/marquee-servicos.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarqueeServicos } from "./marquee-servicos";

describe("MarqueeServicos", () => {
  it("renderiza a lista de serviços duplicada para o loop contínuo", () => {
    render(<MarqueeServicos />);
    expect(screen.getAllByText("Terraplenagem")).toHaveLength(2);
    expect(screen.getAllByText("Limpeza de terreno")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/marquee-servicos.test.tsx`
Expected: FAIL with "Cannot find module './marquee-servicos'"

- [ ] **Step 3a: Add the `marquee` keyframes to `src/styles.css`**

Adicionar ao final de `src/styles.css` (depois do `@utility scrollbar-hide`):

```css
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
```

- [ ] **Step 3b: Write minimal implementation**

```tsx
// src/features/site/components/marquee-servicos.tsx
const ITENS = [
  "Terraplenagem",
  "Escavação",
  "Drenagem",
  "Fundações",
  "Abertura de acessos",
  "Nivelamento",
  "Limpeza de terreno",
];

// Duas cópias lado a lado + translateX(-50%) = loop sem costura, sem depender
// de clonagem via JS (como o mock original fazia).
export function MarqueeServicos() {
  return (
    <div className="overflow-hidden border-y border-border bg-sidebar py-4" aria-hidden="true">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0">
            {ITENS.map((item, indice) => (
              <span
                key={`${copia}-${item}`}
                className="whitespace-nowrap px-4 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-muted-foreground"
              >
                {item}
                {indice < ITENS.length - 1 ? <b className="text-primary"> · </b> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/marquee-servicos.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/features/site/components/marquee-servicos.tsx src/features/site/components/marquee-servicos.test.tsx
git commit -m "feat: add scrolling services marquee for the landing page"
```

---

### Task 7: `ContadoresSection`

**Files:**
- Create: `src/features/site/components/contadores-section.tsx`
- Test: `src/features/site/components/contadores-section.test.tsx`

**Interfaces:**
- Consumes: `useCountUp`, `useRevealOnScroll` (task 2).
- Produces: `ContadoresSection(): JSX.Element` — usado por `landing-page.tsx` (task 12).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/contadores-section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ContadoresSection } from "./contadores-section";

describe("ContadoresSection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chega ao valor final de cada contador quando prefers-reduced-motion está ativo", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    const { container } = render(<ContadoresSection />);

    expect(screen.getByText("Anos de estrada")).toBeInTheDocument();
    expect(screen.getByText("Equipamentos próprios")).toBeInTheDocument();
    expect(screen.getByText("Obras entregues")).toBeInTheDocument();
    expect(screen.getByText("Operadas por ano")).toBeInTheDocument();
    expect(container.textContent).toContain("20+");
    expect(container.textContent).toContain("180+");
    expect(container.textContent).toContain("2.140h");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/contadores-section.test.tsx`
Expected: FAIL with "Cannot find module './contadores-section'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/contadores-section.tsx
import { useCountUp } from "@/features/site/hooks/use-count-up";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";

// PLACEHOLDER: números ilustrativos do mock do design system, não medidos —
// confirmar com o cliente antes de tratar como dado real do negócio.
interface Contador {
  alvo: number;
  sufixo: string;
  rotulo: string;
}

const CONTADORES: Contador[] = [
  { alvo: 20, sufixo: "+", rotulo: "Anos de estrada" },
  { alvo: 14, sufixo: "", rotulo: "Equipamentos próprios" },
  { alvo: 180, sufixo: "+", rotulo: "Obras entregues" },
  { alvo: 2140, sufixo: "h", rotulo: "Operadas por ano" },
];

export function ContadoresSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-12 sm:grid-cols-4">
      {CONTADORES.map((contador) => (
        <ContadorItem key={contador.rotulo} contador={contador} ativo={revelado} />
      ))}
    </div>
  );
}

function ContadorItem({ contador, ativo }: { contador: Contador; ativo: boolean }) {
  const valor = useCountUp(contador.alvo, ativo);

  return (
    <div className="border-l border-border pl-5 text-left">
      <div className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-[42px]">
        {valor.toLocaleString("pt-BR")}
        <b className="font-semibold text-primary">{contador.sufixo}</b>
      </div>
      <div className="mt-2.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {contador.rotulo}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/contadores-section.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/contadores-section.tsx src/features/site/components/contadores-section.test.tsx
git commit -m "feat: add animated counters section for the landing page"
```

---

### Task 8: `ServicosSection`

**Files:**
- Create: `src/features/site/components/servicos-section.tsx`
- Test: `src/features/site/components/servicos-section.test.tsx`

**Interfaces:**
- Consumes: `useRevealOnScroll` (task 2).
- Produces: `ServicosSection(): JSX.Element` — usado por `landing-page.tsx` (task 12). Renderiza `<section id="servicos">`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/servicos-section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ServicosSection } from "./servicos-section";

describe("ServicosSection", () => {
  it("renderiza os 6 serviços com título e descrição", () => {
    render(<ServicosSection />);
    expect(screen.getByText("Terraplenagem")).toBeInTheDocument();
    expect(screen.getByText("Escavação e drenagem")).toBeInTheDocument();
    expect(screen.getByText("Fundações e estacas")).toBeInTheDocument();
    expect(screen.getByText("Nivelamento de pátios")).toBeInTheDocument();
    expect(screen.getByText("Abertura de acessos")).toBeInTheDocument();
    expect(screen.getByText("Limpeza de terreno")).toBeInTheDocument();
    expect(
      screen.getByText(/Corte, aterro e conformação de platôs/),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/servicos-section.test.tsx`
Expected: FAIL with "Cannot find module './servicos-section'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/servicos-section.tsx
import { Icon } from "@iconify/react";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";

interface Servico {
  icone: string;
  titulo: string;
  descricao: string;
}

const SERVICOS: Servico[] = [
  {
    icone: "lucide:truck",
    titulo: "Terraplenagem",
    descricao:
      "Corte, aterro e conformação de platôs para obras industriais, comerciais e rurais.",
  },
  {
    icone: "lucide:shovel",
    titulo: "Escavação e drenagem",
    descricao: "Valas, canais e redes pluviais com controle de cota e proteção de taludes.",
  },
  {
    icone: "lucide:building-2",
    titulo: "Fundações e estacas",
    descricao:
      "Escavação para fundação de galpões e estruturas, com apoio à cravação de estacas.",
  },
  {
    icone: "lucide:gauge",
    titulo: "Nivelamento de pátios",
    descricao:
      "Regularização e compactação de pátios de manobra, estacionamentos e acessos internos.",
  },
  {
    icone: "lucide:route",
    titulo: "Abertura de acessos",
    descricao: "Estradas de serviço e acessos rurais com cascalhamento e drenagem dimensionada.",
  },
  {
    icone: "lucide:trees",
    titulo: "Limpeza de terreno",
    descricao: "Supressão, destoca e remoção de material com destinação correta.",
  },
];

export function ServicosSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="servicos" className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Serviços
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold uppercase leading-tight text-foreground sm:text-4xl">
            Infraestrutura de solo do início ao fim
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Da limpeza do terreno à compactação final — uma equipe, uma frota e um responsável
            pela sua obra.
          </p>
        </div>

        <div
          ref={ref}
          className={`mt-10 grid gap-3.5 transition-all duration-700 sm:grid-cols-2 lg:grid-cols-3 ${
            revelado ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          {SERVICOS.map((servico) => (
            <div
              key={servico.titulo}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-[11px] bg-primary/10 text-primary">
                <Icon icon={servico.icone} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-[15px] font-bold uppercase tracking-wide text-foreground">
                {servico.titulo}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {servico.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/servicos-section.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/servicos-section.tsx src/features/site/components/servicos-section.test.tsx
git commit -m "feat: add services grid section for the landing page"
```

---

### Task 9: `FrotaSection`

**Files:**
- Create: `src/features/site/components/frota-section.tsx`
- Test: `src/features/site/components/frota-section.test.tsx`

**Interfaces:**
- Consumes: `FotoPlaceholder` (task 3), `useRevealOnScroll` (task 2), `EquipamentoStatusBadge` de `@/features/equipamentos/labels` (já existe — props `{ status: EquipamentoStatus }`, `EquipamentoStatus` de `@/shared/types`).
- Produces: `FrotaSection(): JSX.Element` — usado por `landing-page.tsx` (task 12). Renderiza `<section id="frota">`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/frota-section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FrotaSection } from "./frota-section";

describe("FrotaSection", () => {
  it("renderiza as 3 máquinas de exemplo com status", () => {
    render(<FrotaSection />);
    expect(screen.getByText("Escavadeira CAT 320")).toBeInTheDocument();
    expect(screen.getByText("Retroescavadeira JCB 3CX")).toBeInTheDocument();
    expect(screen.getByText("Pá Carregadeira XCMG")).toBeInTheDocument();
    expect(screen.getAllByText("Disponível")).toHaveLength(2);
    expect(screen.getByText("Em uso")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/frota-section.test.tsx`
Expected: FAIL with "Cannot find module './frota-section'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/frota-section.tsx
import { Icon } from "@iconify/react";
import { FotoPlaceholder } from "@/features/site/components/foto-placeholder";
import { EquipamentoStatusBadge } from "@/features/equipamentos/labels";
import { useRevealOnScroll } from "@/features/site/hooks/use-reveal-on-scroll";
import type { EquipamentoStatus } from "@/shared/types";

// PLACEHOLDER: máquinas de exemplo do mock do design system, não o inventário
// real de equipamentos do sistema — revisar com o cliente numa rodada futura.
interface MaquinaExemplo {
  icone: string;
  nome: string;
  especificacoes: string;
  status: EquipamentoStatus;
}

const FROTA: MaquinaExemplo[] = [
  {
    icone: "lucide:truck",
    nome: "Escavadeira CAT 320",
    especificacoes: "Peso operacional 20,5 t · Caçamba 1,19 m³ · Profundidade de escavação 6,7 m",
    status: "disponivel",
  },
  {
    icone: "lucide:shovel",
    nome: "Retroescavadeira JCB 3CX",
    especificacoes: "4×4 · Caçamba frontal 1,0 m³ · Profundidade de escavação 5,4 m",
    status: "disponivel",
  },
  {
    icone: "lucide:building-2",
    nome: "Pá Carregadeira XCMG",
    especificacoes: "Caçamba 1,8 m³ · Carga 3,5 t · Ideal para carregamento e pátio",
    status: "em_uso",
  },
];

export function FrotaSection() {
  const { ref, revelado } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="frota" className="bg-sidebar px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Frota própria
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold uppercase leading-tight text-sidebar-foreground sm:text-4xl">
            Máquina certa, hora certa
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-sidebar-foreground/70">
            Frota própria com manutenção preditiva por horímetro — menos parada, mais
            previsibilidade no seu cronograma.
          </p>
        </div>

        <div
          ref={ref}
          className={`mt-10 grid gap-3.5 transition-all duration-700 sm:grid-cols-2 lg:grid-cols-3 ${
            revelado ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          {FROTA.map((maquina) => (
            <div
              key={maquina.nome}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <FotoPlaceholder
                icone={maquina.icone}
                legenda={`Foto — ${maquina.nome}`}
                className="h-[190px] rounded-b-none border-x-0 border-t-0"
              />
              <div className="p-4">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
                  <Icon icon={maquina.icone} className="h-4 w-4 text-primary" />
                  {maquina.nome}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {maquina.especificacoes}
                </p>
                <div className="mt-3">
                  <EquipamentoStatusBadge status={maquina.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/frota-section.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/frota-section.tsx src/features/site/components/frota-section.test.tsx
git commit -m "feat: add fleet showcase section for the landing page"
```

---

### Task 10: `ProcessoSection`

**Files:**
- Create: `src/features/site/components/processo-section.tsx`
- Test: `src/features/site/components/processo-section.test.tsx`

**Interfaces:**
- Produces: `ProcessoSection(): JSX.Element` — usado por `landing-page.tsx` (task 12). Renderiza `<section id="processo">`. Sem dependências de outras tasks (mais simples do plano — sem hooks, sem reveal-on-scroll, para manter o componente enxuto).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/processo-section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProcessoSection } from "./processo-section";

describe("ProcessoSection", () => {
  it("renderiza os 4 passos numerados", () => {
    render(<ProcessoSection />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Visita e orçamento")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("OS aberta e planejada")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Execução apontada")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("Medição e NF")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/processo-section.test.tsx`
Expected: FAIL with "Cannot find module './processo-section'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/processo-section.tsx
interface Passo {
  numero: string;
  titulo: string;
  descricao: string;
}

const PASSOS: Passo[] = [
  {
    numero: "01",
    titulo: "Visita e orçamento",
    descricao: "Levantamento no local e proposta detalhada em até 48 horas.",
  },
  {
    numero: "02",
    titulo: "OS aberta e planejada",
    descricao: "Equipamentos, operadores e cronograma definidos na Ordem de Serviço.",
  },
  {
    numero: "03",
    titulo: "Execução apontada",
    descricao: "Horas registradas por horímetro no app de campo, dia a dia.",
  },
  {
    numero: "04",
    titulo: "Medição e NF",
    descricao: "Medição por etapa concluída e nota fiscal vinculada à OS.",
  },
];

export function ProcessoSection() {
  return (
    <section id="processo" className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Como trabalhamos
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl font-extrabold uppercase leading-tight text-foreground sm:text-4xl">
            Obra gerenciada, não improvisada
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Cada obra vira uma Ordem de Serviço no nosso sistema — você acompanha horas, medições
            e faturamento sem surpresa.
          </p>
        </div>

        <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((passo) => (
            <div key={passo.numero} className="rounded-xl border border-border bg-card p-5">
              <div className="font-mono text-[13px] font-semibold text-primary">
                {passo.numero}
              </div>
              <div className="my-3.5 h-[3px] overflow-hidden rounded-full bg-primary/15">
                <div className="h-full w-full rounded-full bg-primary" />
              </div>
              <h3 className="font-display text-[14.5px] font-bold uppercase tracking-wide text-foreground">
                {passo.titulo}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {passo.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/processo-section.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/processo-section.tsx src/features/site/components/processo-section.test.tsx
git commit -m "feat: add work process steps section for the landing page"
```

---

### Task 11: `ContatoBand` e `SiteFooter`

**Files:**
- Create: `src/features/site/components/contato-band.tsx`
- Create: `src/features/site/components/contato-band.test.tsx`
- Create: `src/features/site/components/site-footer.tsx`
- Create: `src/features/site/components/site-footer.test.tsx`

**Interfaces:**
- Consumes: `contato` (task 1), `MarcaAntonello` (task 4), `Button` de `@/components/ui/button`.
- Produces: `ContatoBand(): JSX.Element` (renderiza `<section id="contato">`) e `SiteFooter(): JSX.Element` — ambos usados por `landing-page.tsx` (task 12).

- [ ] **Step 1: Write the failing tests**

```tsx
// src/features/site/components/contato-band.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ContatoBand } from "./contato-band";

describe("ContatoBand", () => {
  it("renderiza a chamada final, o CTA de orçamento e o telefone", () => {
    render(<ContatoBand />);
    expect(screen.getByText(/Tem um terreno para/)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /pedir orçamento/i });
    expect(cta).toHaveAttribute("href", expect.stringContaining("wa.me/5555999242409"));
    expect(screen.getByText("(55) 99924-2409")).toBeInTheDocument();
  });
});
```

```tsx
// src/features/site/components/site-footer.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renderiza navegação, contato e CNPJ", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "#servicos");
    expect(screen.getByText("(55) 99924-2409")).toBeInTheDocument();
    expect(screen.getByText("Frederico Westphalen — RS")).toBeInTheDocument();
    expect(screen.getByText(/CNPJ 36\.508\.280\/0001-90/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/site/components/contato-band.test.tsx src/features/site/components/site-footer.test.tsx`
Expected: FAIL — módulos ainda não existem.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/contato-band.tsx
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { contato } from "@/features/site/lib/contato";

export function ContatoBand() {
  return (
    <section id="contato" className="border-y border-border bg-sidebar px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-8">
        <h2 className="max-w-lg text-balance font-display text-2xl font-extrabold uppercase leading-tight text-sidebar-foreground sm:text-3xl">
          Tem um terreno para <em className="not-italic text-primary">preparar</em>?
        </h2>
        <div className="ml-auto flex flex-col items-end gap-3">
          <Button
            asChild
            className="gap-1.5 rounded-xl bg-primary px-5 py-3 text-primary-foreground hover:bg-primary-hover"
          >
            <a href={contato.whatsappOrcamento} target="_blank" rel="noopener noreferrer">
              Pedir orçamento
              <Icon icon="lucide:arrow-up-right" className="h-4 w-4" />
            </a>
          </Button>
          <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-sidebar-foreground/80">
            <Icon icon="lucide:phone" className="h-4 w-4 text-primary" />
            {contato.telefoneExibicao}
          </span>
        </div>
      </div>
    </section>
  );
}
```

```tsx
// src/features/site/components/site-footer.tsx
import { MarcaAntonello } from "@/features/site/components/marca-antonello";
import { contato } from "@/features/site/lib/contato";

const NAV_LINKS = [
  { href: "#servicos", label: "Serviços" },
  { href: "#frota", label: "Frota" },
  { href: "#processo", label: "Como trabalhamos" },
];

export function SiteFooter() {
  return (
    <footer className="px-6 pb-8 pt-11">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start gap-10">
          <MarcaAntonello className="mr-auto" />

          <div className="flex min-w-[150px] flex-col gap-2">
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Navegação
            </span>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex min-w-[150px] flex-col gap-2">
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contato
            </span>
            <span className="font-mono text-[12.5px] text-muted-foreground">
              {contato.telefoneExibicao}
            </span>
            <span className="text-sm text-muted-foreground">{contato.cidadeUf}</span>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-border pt-[18px] font-mono text-[11.5px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Antonello Terraplanagem</span>
          <span className="flex-1" />
          <span>CNPJ {contato.cnpj}</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/site/components/contato-band.test.tsx src/features/site/components/site-footer.test.tsx`
Expected: PASS (1 + 1 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/contato-band.tsx src/features/site/components/contato-band.test.tsx src/features/site/components/site-footer.tsx src/features/site/components/site-footer.test.tsx
git commit -m "feat: add contact band and footer for the landing page"
```

---

### Task 12: `LandingPage` (montagem)

**Files:**
- Create: `src/features/site/components/landing-page.tsx`
- Test: `src/features/site/components/landing-page.test.tsx`

**Interfaces:**
- Consumes: `SiteHeader` (task 4), `HeroSection` (task 5), `MarqueeServicos` (task 6), `ContadoresSection` (task 7), `ServicosSection` (task 8), `FrotaSection` (task 9), `ProcessoSection` (task 10), `ContatoBand`, `SiteFooter` (task 11).
- Produces: `LandingPage(): JSX.Element` — usado pela rota `src/routes/index.tsx` (task 13).

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/site/components/landing-page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LandingPage } from "./landing-page";

describe("LandingPage", () => {
  it("monta todas as seções sem erros", () => {
    render(<LandingPage />);

    // Header
    expect(screen.getByText("ANTONELLO")).toBeInTheDocument();
    // Hero
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "O terreno pronto para o seu projeto",
    );
    // Contadores
    expect(screen.getByText("Anos de estrada")).toBeInTheDocument();
    // Serviços
    expect(screen.getByText("Infraestrutura de solo do início ao fim")).toBeInTheDocument();
    // Frota
    expect(screen.getByText("Máquina certa, hora certa")).toBeInTheDocument();
    // Processo
    expect(screen.getByText("Obra gerenciada, não improvisada")).toBeInTheDocument();
    // Contato
    expect(screen.getByText(/Tem um terreno para/)).toBeInTheDocument();
    // Footer
    expect(screen.getByText(/CNPJ 36\.508\.280\/0001-90/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/site/components/landing-page.test.tsx`
Expected: FAIL with "Cannot find module './landing-page'"

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/site/components/landing-page.tsx
import { SiteHeader } from "@/features/site/components/site-header";
import { HeroSection } from "@/features/site/components/hero-section";
import { MarqueeServicos } from "@/features/site/components/marquee-servicos";
import { ContadoresSection } from "@/features/site/components/contadores-section";
import { ServicosSection } from "@/features/site/components/servicos-section";
import { FrotaSection } from "@/features/site/components/frota-section";
import { ProcessoSection } from "@/features/site/components/processo-section";
import { ContatoBand } from "@/features/site/components/contato-band";
import { SiteFooter } from "@/features/site/components/site-footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hazard-stripe h-1.5" aria-hidden />
      <SiteHeader />
      <main>
        <HeroSection />
        <MarqueeServicos />
        <ContadoresSection />
        <ServicosSection />
        <FrotaSection />
        <ProcessoSection />
        <ContatoBand />
      </main>
      <SiteFooter />
      <div className="hazard-stripe h-1.5" aria-hidden />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/site/components/landing-page.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/site/components/landing-page.tsx src/features/site/components/landing-page.test.tsx
git commit -m "feat: assemble landing page from all sections"
```

---

### Task 13: Wiring da rota, correção do `__root.tsx` e higiene final

**Files:**
- Modify: `src/routes/index.tsx` — troca o redirect para `/login` pela `LandingPage`.
- Modify: `src/routes/__root.tsx:132` — corrige `areaServed: "BR-PR"` para `areaServed: "BR-RS"`.

**Interfaces:**
- Consumes: `LandingPage` de `@/features/site/components/landing-page` (task 12).
- Não há teste novo nesta task: nenhum arquivo em `src/routes/` tem teste hoje neste projeto (`login.tsx`, `blog.terraplanagem-ou-terraplenagem.tsx` e `__root.tsx` não têm `.test.*` — confirmado antes de planejar). A verificação de comportamento já está coberta pelo teste de `LandingPage` (task 12); esta task é só wiring + 1 correção de dado.

- [ ] **Step 1: Replace the redirect with the landing page**

Substituir todo o conteúdo de `src/routes/index.tsx`:

```tsx
// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/site/components/landing-page";

const URL_PAGINA = "https://antonello-terraplanagem.lovable.app/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Antonello Terraplanagem · Terraplenagem, escavação e infraestrutura de solo" },
      {
        name: "description",
        content:
          "Terraplenagem, escavação e infraestrutura de solo em Frederico Westphalen — RS, com equipamentos próprios, operadores experientes e gestão de obra em tempo real.",
      },
      {
        property: "og:title",
        content: "Antonello Terraplanagem · Terraplenagem, escavação e infraestrutura de solo",
      },
      {
        property: "og:description",
        content:
          "Equipamentos próprios, operadores experientes e gestão de obra em tempo real — do orçamento à nota fiscal.",
      },
      { property: "og:url", content: URL_PAGINA },
    ],
    links: [{ rel: "canonical", href: URL_PAGINA }],
  }),
  component: LandingPage,
});
```

- [ ] **Step 2: Fix the wrong state in `__root.tsx`**

Em `src/routes/__root.tsx`, dentro do primeiro bloco JSON-LD (`"@type": "Organization"`), trocar:

```ts
areaServed: "BR-PR",
```

por:

```ts
areaServed: "BR-RS",
```

- [ ] **Step 3: Full hygiene pass**

Rodar, nesta ordem, e confirmar que todos passam sem erros novos (avisos de CRLF pré-existentes em arquivos não tocados por esta branch, ex. `waha-enviar-texto/index.ts`, `vite.config.ts`, `vitest.config.ts`, são esperados e não bloqueiam):

```bash
npx tsc --noEmit
npx eslint .
npx vitest run
```

Expected: `tsc` sem erros; `eslint` sem erros novos fora dos 3 arquivos CRLF pré-existentes já conhecidos; `vitest run` com todos os testes passando, incluindo os ~15 arquivos de teste novos desta branch.

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx src/routes/__root.tsx
git commit -m "feat: serve the landing page at / and fix wrong company state in JSON-LD"
```

---

## Self-Review (feito pelo planejador antes de entregar)

**Cobertura da spec:** rota `/` (Task 13), feature folder completo com todos os 9 componentes de seção + `landing-page.tsx` (Tasks 3–12), 2 hooks (Task 2), `lib/contato.ts` com dados reais (Task 1), correção do `__root.tsx` (Task 13), tokens só reaproveitados (nenhuma task introduz cor nova), Button/Iconify reaproveitados em todas as tasks com CTA, placeholders marcados explicitamente em `contadores-section.tsx` e `frota-section.tsx` (comentário `// PLACEHOLDER: ...`) e via `FotoPlaceholder` (`hero-section.tsx`, `frota-section.tsx`), testes cobrindo todas as seções + os 2 hooks + wa.me links — tudo coberto.

**Placeholder scan:** nenhum "TBD"/"TODO" no plano; os únicos comentários `// PLACEHOLDER` são intencionais e fazem parte do requisito da spec (marcar conteúdo de exemplo no código-fonte final, não uma lacuna do plano).

**Consistência de tipos:** `useCountUp(alvo, ativo, duracaoMs?)` e `useRevealOnScroll<T>()` (Task 2) são usados com a mesma assinatura em `contadores-section.tsx` (Task 7), `hero-section.tsx` (Task 5), `servicos-section.tsx` (Task 8) e `frota-section.tsx` (Task 9). `contato.*` (Task 1) usado com os mesmos nomes de campo em todas as tasks que o consomem (4, 5, 11). `MarcaAntonello({ className? })` (Task 4) usado com a mesma prop em `site-footer.tsx` (Task 11). `EquipamentoStatusBadge`/`EquipamentoStatus` (Task 9) importados do caminho real já existente no projeto (`@/features/equipamentos/labels`, `@/shared/types`) — confirmado por leitura direta do arquivo antes de planejar, não suposição.
