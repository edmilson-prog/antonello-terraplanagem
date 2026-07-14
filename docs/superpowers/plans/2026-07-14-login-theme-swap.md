# Login Theme Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the login screen's theme toggle actually do something: the form panel follows
the real light/dark theme (instead of being locked to light), and the brand/form panels swap
sides with an animated cross-slide when the theme changes.

**Architecture:** Single-file change to `src/features/auth/login-page.tsx`. The theme value
itself (`useTheme().theme`) becomes the one source of truth driving both the panel colors (via
removing a fixed `.theme-light` override) and each panel's horizontal position (via a Tailwind
`translate-x` class pair, animated with `transition-transform`).

**Tech Stack:** React + TypeScript + Tailwind (existing tokens/utilities only, no new
dependencies), the project's existing `useTheme` hook (`@/shared/hooks/use-theme`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-14-login-theme-swap-design.md` — read it if anything
  below seems to contradict it; the spec wins.
- No new Tailwind tokens, no new CSS files, no new npm dependencies (no animation library) — the
  swap is pure `transform`/`transition-transform` plus Tailwind's `motion-reduce:` variant.
- Only `src/features/auth/login-page.tsx` and its test are touched. No other file changes.
- The swap only applies at `md:` and above (desktop split-screen). Mobile layout/behavior is
  unchanged except the compact header logo now swaps with theme.
- Testing: `fireEvent` from `@testing-library/react`, never `user-event`. The file already mocks
  `@tanstack/react-router`'s `useNavigate` and `sonner`'s `toast` — reuse those existing mocks,
  don't duplicate or replace them.

---

### Task 1: Theme-driven swap on the login page

**Files:**
- Modify: `src/features/auth/login-page.tsx` (full current content shown below)
- Modify: `src/features/auth/login-page.test.tsx` (append new tests to the existing file)

**Interfaces:**
- Consumes: `useTheme()` from `@/shared/hooks/use-theme` — returns `{ theme: "light" | "dark",
  toggle: () => void }` (already used internally by the existing `ThemeToggle` component, now
  also called directly in `login-page.tsx`).
- Consumes: `cn` from `@/lib/utils` — `cn(...inputs: ClassValue[]): string`.
- No new exports — this task only changes internal JSX/classes of `LoginPage`.

Current full content of `src/features/auth/login-page.tsx`:

```tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { EsqueciSenhaDialog } from "@/features/auth/esqueci-senha-dialog";
import { VERSAO_SISTEMA, CODINOME_SISTEMA } from "@/features/auth/versao-sistema";
import { STORAGE_KEY_LEMBRAR } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const [dialogEsqueciSenhaAberto, setDialogEsqueciSenhaAberto] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

    localStorage.setItem(STORAGE_KEY_LEMBRAR, manterConectado ? "true" : "false");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error || !data.session) {
      setEntrando(false);
      setErro("E-mail ou senha incorretos.");
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios_retaguarda")
      .select("id")
      .eq("id", data.session.user.id)
      .maybeSingle();

    if (!perfil) {
      await supabase.auth.signOut();
      setEntrando(false);
      setErro("Conta não configurada — fale com o proprietário.");
      return;
    }

    toast.success("Bem-vindo!");
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen w-full bg-asphalt">
      {/* Painel de marca — logo full-bleed com gradiente escuro e rodapé de status. */}
      <aside className="relative hidden w-1/2 flex-col overflow-hidden bg-asphalt md:flex">
        <img
          src="/logo-antonello-preto.png"
          alt="Antonello Terraplanagem"
          className="absolute inset-0 h-full w-full select-none object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-asphalt/10 via-asphalt/5 to-asphalt/75"
        />

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

      {/* Painel do formulário — tom concreto claro FIXO (via .theme-light):
          NÃO segue o toggle de tema, para manter o contraste do split-screen. */}
      <div className="theme-light flex w-full flex-1 flex-col bg-background text-foreground md:w-1/2">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          {/* Logo "branco" traz fundo creme embutido idêntico ao bg-background,
              então se funde ao painel no header compacto do mobile. */}
          <img
            src="/logo-antonello-branco.png"
            alt="Antonello Terraplanagem"
            className="h-12 w-auto select-none object-contain md:hidden"
          />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3">
              <HazardStripe className="h-1.5 w-12 rounded-full" />
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  Entrar na retaguarda
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acesso da recepção e do proprietário.
                </p>
              </div>
            </div>

            <form onSubmit={entrar} className="space-y-5">
              <CampoComIcone
                icone="lucide:mail"
                label="E-mail"
                id="email"
                tipo="email"
                valor={email}
                onChange={(valor) => {
                  setEmail(valor);
                  setErro(null);
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
                required
                ariaInvalid={!!erro}
                ariaDescribedBy={erro ? "login-erro" : undefined}
              />

              <CampoComIcone
                icone="lucide:lock"
                label="Senha"
                id="senha"
                tipo={mostrarSenha ? "text" : "password"}
                valor={senha}
                onChange={(valor) => {
                  setSenha(valor);
                  setErro(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                ariaInvalid={!!erro}
                ariaDescribedBy={erro ? "login-erro" : undefined}
                acao={
                  <button
                    type="button"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground hover:text-primary"
                  >
                    <Icon
                      icon={mostrarSenha ? "lucide:eye-off" : "lucide:eye"}
                      className="h-4 w-4"
                    />
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="manter-conectado"
                    checked={manterConectado}
                    onCheckedChange={(v) => setManterConectado(v === true)}
                  />
                  <Label
                    htmlFor="manter-conectado"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    Manter conectado
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogEsqueciSenhaAberto(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              {erro ? (
                <p
                  id="login-erro"
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                >
                  {erro}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={entrando}
                className="h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                {entrando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="border-t border-border pt-5 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
              Operador de campo? O apontamento é feito pelo app, no celular da obra.
            </p>
          </div>
        </div>
      </div>

      <EsqueciSenhaDialog
        aberto={dialogEsqueciSenhaAberto}
        onOpenChange={setDialogEsqueciSenhaAberto}
        emailInicial={email}
      />
    </main>
  );
}
```

- [ ] **Step 1: Write the failing tests**

Append these four tests to the existing `describe("LoginPage", ...)` block in
`src/features/auth/login-page.test.tsx` (keep all existing tests and the existing
`vi.mock`/`beforeEach` exactly as they are — just add these `it(...)` blocks alongside the four
already there):

```tsx
  it("no tema claro (padrão), painel de marca fica à esquerda e formulário à direita", () => {
    const { container } = render(<LoginPage />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("md:translate-x-0");
    expect(aside?.className).not.toContain("md:translate-x-full");
  });

  it("alternar para tema escuro troca os painéis de lado", () => {
    const { container } = render(<LoginPage />);
    const aside = container.querySelector("aside");

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(aside?.className).toContain("md:translate-x-full");
  });

  it("alternar o tema troca a logo do cabeçalho mobile", () => {
    render(<LoginPage />);
    const logos = screen.getAllByAltText("Antonello Terraplanagem") as HTMLImageElement[];
    const logoMobile = logos.find((img) => img.className.includes("md:hidden"));
    expect(logoMobile?.src).toContain("logo-antonello-branco.png");

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(logoMobile?.src).toContain("logo-antonello-preto.png");
  });

  it("anuncia a troca de tema para leitores de tela", () => {
    render(<LoginPage />);
    expect(screen.getByText("Tema alterado para claro")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(screen.getByText("Tema alterado para escuro")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/auth/login-page.test.tsx`
Expected: the 4 new tests FAIL (the current code has no `md:translate-x-*` classes, the mobile
logo never changes, and there's no "Tema alterado" text anywhere). The 4 pre-existing tests
still PASS — do not let the new tests break them.

- [ ] **Step 3: Write the new implementation**

Replace the full content of `src/features/auth/login-page.tsx` with:

```tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { EsqueciSenhaDialog } from "@/features/auth/esqueci-senha-dialog";
import { VERSAO_SISTEMA, CODINOME_SISTEMA } from "@/features/auth/versao-sistema";
import { STORAGE_KEY_LEMBRAR } from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/shared/hooks/use-theme";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const invertido = theme === "dark";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const [dialogEsqueciSenhaAberto, setDialogEsqueciSenhaAberto] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

    localStorage.setItem(STORAGE_KEY_LEMBRAR, manterConectado ? "true" : "false");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error || !data.session) {
      setEntrando(false);
      setErro("E-mail ou senha incorretos.");
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios_retaguarda")
      .select("id")
      .eq("id", data.session.user.id)
      .maybeSingle();

    if (!perfil) {
      await supabase.auth.signOut();
      setEntrando(false);
      setErro("Conta não configurada — fale com o proprietário.");
      return;
    }

    toast.success("Bem-vindo!");
    navigate({ to: "/admin" });
  }

  return (
    <main className="relative flex min-h-screen w-full overflow-hidden bg-asphalt">
      <div aria-live="polite" className="sr-only">
        {`Tema alterado para ${invertido ? "escuro" : "claro"}`}
      </div>

      {/* Painel de marca — logo full-bleed com gradiente escuro e rodapé de status.
          Aparência sempre escura; só a posição (esquerda/direita) muda com o tema. */}
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
          className="absolute inset-0 bg-gradient-to-b from-asphalt/10 via-asphalt/5 to-asphalt/75"
        />

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

      {/* Painel do formulário — agora segue o tema real (sem .theme-light fixo).
          Ancorado à direita no desktop; troca de lado com o tema junto com o painel de marca. */}
      <div
        className={cn(
          "flex w-full flex-1 flex-col bg-background text-foreground",
          "md:absolute md:inset-y-0 md:right-0 md:w-1/2 md:transition-transform md:duration-500 md:ease-in-out motion-reduce:md:transition-none",
          invertido ? "md:-translate-x-full" : "md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          {/* Logo troca com o tema: "branco" (fundo claro embutido) no tema claro,
              "preto" (fundo escuro embutido) no tema escuro — evita um quadrado
              destoando do fundo do cabeçalho compacto no mobile. */}
          <img
            src={invertido ? "/logo-antonello-preto.png" : "/logo-antonello-branco.png"}
            alt="Antonello Terraplanagem"
            className="h-12 w-auto select-none object-contain md:hidden"
          />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-3">
              <HazardStripe className="h-1.5 w-12 rounded-full" />
              <div className="space-y-1">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  Entrar na retaguarda
                </h1>
                <p className="text-sm text-muted-foreground">
                  Acesso da recepção e do proprietário.
                </p>
              </div>
            </div>

            <form onSubmit={entrar} className="space-y-5">
              <CampoComIcone
                icone="lucide:mail"
                label="E-mail"
                id="email"
                tipo="email"
                valor={email}
                onChange={(valor) => {
                  setEmail(valor);
                  setErro(null);
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
                required
                ariaInvalid={!!erro}
                ariaDescribedBy={erro ? "login-erro" : undefined}
              />

              <CampoComIcone
                icone="lucide:lock"
                label="Senha"
                id="senha"
                tipo={mostrarSenha ? "text" : "password"}
                valor={senha}
                onChange={(valor) => {
                  setSenha(valor);
                  setErro(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                ariaInvalid={!!erro}
                ariaDescribedBy={erro ? "login-erro" : undefined}
                acao={
                  <button
                    type="button"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground hover:text-primary"
                  >
                    <Icon
                      icon={mostrarSenha ? "lucide:eye-off" : "lucide:eye"}
                      className="h-4 w-4"
                    />
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="manter-conectado"
                    checked={manterConectado}
                    onCheckedChange={(v) => setManterConectado(v === true)}
                  />
                  <Label
                    htmlFor="manter-conectado"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    Manter conectado
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogEsqueciSenhaAberto(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              {erro ? (
                <p
                  id="login-erro"
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                >
                  {erro}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={entrando}
                className="h-11 w-full bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              >
                {entrando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="border-t border-border pt-5 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-foreground-faint">
              Operador de campo? O apontamento é feito pelo app, no celular da obra.
            </p>
          </div>
        </div>
      </div>

      <EsqueciSenhaDialog
        aberto={dialogEsqueciSenhaAberto}
        onOpenChange={setDialogEsqueciSenhaAberto}
        emailInicial={email}
      />
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/auth/login-page.test.tsx`
Expected: PASS (8 tests — the 4 pre-existing plus the 4 new ones).

- [ ] **Step 5: Run the full suite to confirm nothing else broke**

Run: `npx vitest run`
Expected: PASS — same total as before this task, plus these 4 new tests (no other file changed,
so no other test file is affected).

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/login-page.tsx src/features/auth/login-page.test.tsx
git commit -m "feat: make login theme toggle swap panel sides with a real theme change"
```

---

### Task 2: Final hygiene

**Files:** none (verification only).

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint the touched file**

Run: `npx eslint src/features/auth/login-page.tsx src/features/auth/login-page.test.tsx`
Expected: no errors. (Full-project `npm run lint` is known-unreliable in this environment — see
the progress ledger from the prior "Login v2 redesign" plan — use per-file eslint instead.)

- [ ] **Step 3: Manual visual check (user)**

Per this project's convention, the user does the manual browser smoke test — not a subagent.
Ask the user to check, at `/login`, desktop width (≥768px): clicking the theme toggle animates
the two panels sliding to swap sides, the form panel's colors genuinely invert (not just stay
light), and the motion is instant (no slide) when the OS "reduce motion" setting is on. Also
check the mobile width (<768px): the compact header logo swaps between the light/dark variant
when the theme toggle is clicked.

- [ ] **Step 4: Commit (only if a fix was needed)**

If Steps 1–2 were clean, there is nothing to commit for this task.
