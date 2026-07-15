# Login v2 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the retaguarda login screen to match the "Login v2" mockup (full-bleed brand
panel, boxed icon-prefixed fields) and add two real features the mockup only hints at visually:
"Manter conectado" (session persistence) and a full "Esqueci minha senha" reset-password flow.

**Architecture:** A new shared `CampoComIcone` input wraps the mockup's boxed-icon field style,
reused by the redesigned login form, a new `EsqueciSenhaDialog`, and a new `/redefinir-senha`
route. Session persistence is controlled by a small standalone storage-adapter module (kept out
of `src/lib/supabase.ts` so it stays testable — the project's global test mock replaces that
whole module). All three Supabase Auth calls involved (`resetPasswordForEmail`, `updateUser`,
`getSession`, plus the pre-existing `signInWithPassword`/`signOut`) need a first-time `auth` stub
added to the shared `vitest.setup.ts` mock.

**Tech Stack:** React + TypeScript + Tailwind (existing tokens only), `@tanstack/react-router`,
Supabase Auth (`@supabase/supabase-js`), shadcn/ui (`Dialog`, `Checkbox`, `Button`, `Input`,
`Label`), `@iconify/react` (`lucide:*`), Vitest + Testing Library (`fireEvent`, no
`user-event` — not a project dependency).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-14-login-v2-redesign-design.md` — read it if any task
  step below seems to contradict it; the spec wins.
- No new Tailwind tokens/hex colors. Reuse existing tokens only: `bg-asphalt`, `bg-primary`,
  `bg-background`, `bg-surface`, `border-border`, `text-foreground`, `text-muted-foreground`,
  `text-foreground-faint`, `text-destructive`, `bg-destructive/10`, `text-sidebar-foreground`,
  `font-display`/`font-sans`/`font-mono`. The mock's "success" green does not exist as a token in
  this project — the established mapping (`filtro-chips.tsx`) is `success → text-primary`; reuse
  that, do not invent green.
- No `react-hook-form`/`zod` in this feature — `login-page.tsx` already uses plain `useState`;
  the two new forms (`EsqueciSenhaDialog`, `RedefinirSenhaPage`) follow the same plain-`useState`
  pattern for consistency.
- Testing: `fireEvent` from `@testing-library/react`, never `@testing-library/user-event` (not
  installed). Mock `@tanstack/react-router`'s `useNavigate`/`Link` and `sonner`'s `toast`
  per-test-file with `vi.mock(...)` when a test needs them — there is no existing router-test
  harness in this project to reuse.
- Real version/codename to display: `0.21.0` / `Ledger` (from `package.json` `"version"` and the
  top entry of `CHANGELOG.md` at the time this plan was written — do not invent different values).
- Storage key name: `"sb-lembrar-conectado"` (exported as `STORAGE_KEY_LEMBRAR`). New route path:
  `/redefinir-senha`.
- Icons via `@iconify/react`, `icon` prop (not `name`), `lucide:` prefix — matches the whole
  codebase's existing convention.

---

### Task 1: `versao-sistema.ts` — version/codename constant

**Files:**
- Create: `src/features/auth/versao-sistema.ts`
- Test: `src/features/auth/versao-sistema.test.ts`

**Interfaces:**
- Produces: `VERSAO_SISTEMA: string`, `CODINOME_SISTEMA: string` — consumed by Task 6
  (`login-page.tsx` redesign) to render the brand-panel status footer.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/versao-sistema.test.ts
import { describe, it, expect } from "vitest";
import { VERSAO_SISTEMA, CODINOME_SISTEMA } from "./versao-sistema";

describe("versao-sistema", () => {
  it("expõe a versão e o codinome atuais do sistema", () => {
    expect(VERSAO_SISTEMA).toBe("0.21.0");
    expect(CODINOME_SISTEMA).toBe("Ledger");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/auth/versao-sistema.test.ts`
Expected: FAIL — `Failed to resolve import "./versao-sistema"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/features/auth/versao-sistema.ts
/** Mantida manualmente a cada bump de versão (ver CLAUDE.md, passo "Incrementar versão"). */
export const VERSAO_SISTEMA = "0.21.0";
export const CODINOME_SISTEMA = "Ledger";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/auth/versao-sistema.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/versao-sistema.ts src/features/auth/versao-sistema.test.ts
git commit -m "feat: add system version constant for login v2 status footer"
```

---

### Task 2: `supabase-storage.ts` — "Manter conectado" storage adapter

**Files:**
- Create: `src/lib/supabase-storage.ts`
- Modify: `src/lib/supabase.ts` (full current content below)
- Test: `src/lib/supabase-storage.test.ts`

**Interfaces:**
- Produces: `STORAGE_KEY_LEMBRAR: string`, `backingStorage(): Storage`,
  `storageAdaptavel: { getItem, setItem, removeItem }` (shape matching supabase-js's
  `SupportedStorage` interface) — consumed by Task 6 (`login-page.tsx`, writes the key before
  calling `signInWithPassword`) and wired into the real Supabase client in this task.

This module is deliberately **not** imported by any file that is globally mocked in tests — the
project's `vitest.setup.ts` already has `vi.mock("./src/lib/supabase", ...)` which replaces the
*entire* `@/lib/supabase` module for every test in the suite (it only stubs `from` and
`functions.invoke` today). If this adapter lived inside `supabase.ts`, no test could ever import
the real implementation. Keeping it in its own file, with no import relationship to
`supabase.ts`'s Supabase client construction, means tests import it directly and get the real
code.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/supabase-storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { STORAGE_KEY_LEMBRAR, backingStorage, storageAdaptavel } from "./supabase-storage";

describe("storageAdaptavel", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("usa localStorage quando não há preferência gravada", () => {
    expect(backingStorage()).toBe(localStorage);
    storageAdaptavel.setItem("chave", "valor");
    expect(localStorage.getItem("chave")).toBe("valor");
    expect(sessionStorage.getItem("chave")).toBeNull();
  });

  it("usa localStorage quando a preferência é lembrar (true)", () => {
    localStorage.setItem(STORAGE_KEY_LEMBRAR, "true");
    expect(backingStorage()).toBe(localStorage);
  });

  it("usa sessionStorage quando a preferência é não lembrar (false)", () => {
    localStorage.setItem(STORAGE_KEY_LEMBRAR, "false");
    expect(backingStorage()).toBe(sessionStorage);
    storageAdaptavel.setItem("chave", "valor");
    expect(sessionStorage.getItem("chave")).toBe("valor");
    expect(localStorage.getItem("chave")).toBeNull();
  });

  it("removeItem limpa dos dois storages", () => {
    localStorage.setItem("chave", "valor-local");
    sessionStorage.setItem("chave", "valor-session");
    storageAdaptavel.removeItem("chave");
    expect(localStorage.getItem("chave")).toBeNull();
    expect(sessionStorage.getItem("chave")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/supabase-storage.test.ts`
Expected: FAIL — `Failed to resolve import "./supabase-storage"`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/supabase-storage.ts
export const STORAGE_KEY_LEMBRAR = "sb-lembrar-conectado";

export function backingStorage(): Storage {
  return localStorage.getItem(STORAGE_KEY_LEMBRAR) === "false" ? sessionStorage : localStorage;
}

export const storageAdaptavel = {
  getItem: (key: string) => backingStorage().getItem(key),
  setItem: (key: string, value: string) => backingStorage().setItem(key, value),
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/supabase-storage.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Wire the adapter into the real Supabase client**

Current full content of `src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidas (.env, ver .env.example)",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

Replace it with:

```ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";
import { storageAdaptavel } from "@/lib/supabase-storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar definidas (.env, ver .env.example)",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { storage: storageAdaptavel },
});
```

- [ ] **Step 6: Run the full suite to confirm nothing broke**

Run: `npx vitest run`
Expected: PASS — same total as before this task (this file is globally mocked in tests, so this
change is invisible to the rest of the suite; it only takes effect in the real browser client).

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase-storage.ts src/lib/supabase-storage.test.ts src/lib/supabase.ts
git commit -m "feat: add remember-me storage adapter for the Supabase client"
```

---

### Task 3: `CampoComIcone` — shared icon-prefixed input

**Files:**
- Create: `src/shared/components/campo-com-icone.tsx`
- Test: `src/shared/components/campo-com-icone.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  interface CampoComIconeProps {
    icone: string;
    label: string;
    id: string;
    tipo?: React.HTMLInputTypeAttribute; // default "text"
    valor: string;
    onChange: (valor: string) => void;
    placeholder?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    required?: boolean;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
    acao?: React.ReactNode;
  }
  function CampoComIcone(props: CampoComIconeProps): JSX.Element;
  ```
  Consumed by Task 4 (`EsqueciSenhaDialog`), Task 5 (`RedefinirSenhaPage`), Task 6
  (`login-page.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/components/campo-com-icone.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CampoComIcone } from "./campo-com-icone";

describe("CampoComIcone", () => {
  it("renderiza o rótulo e repassa o valor digitado via onChange", () => {
    const onChange = vi.fn();
    render(
      <CampoComIcone
        icone="lucide:mail"
        label="E-mail"
        id="email"
        valor=""
        onChange={onChange}
        placeholder="seu@email.com"
      />,
    );

    expect(screen.getByText("E-mail")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
      target: { value: "joao@antonello.com" },
    });
    expect(onChange).toHaveBeenCalledWith("joao@antonello.com");
  });

  it("associa o rótulo ao input via htmlFor/id", () => {
    render(
      <CampoComIcone icone="lucide:mail" label="E-mail" id="email" valor="" onChange={() => {}} />,
    );
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("renderiza a ação opcional dentro da caixa", () => {
    render(
      <CampoComIcone
        icone="lucide:lock"
        label="Senha"
        id="senha"
        valor=""
        onChange={() => {}}
        acao={<button type="button">Mostrar senha</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/shared/components/campo-com-icone.test.tsx`
Expected: FAIL — `Failed to resolve import "./campo-com-icone"`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/shared/components/campo-com-icone.tsx
import type { ReactNode, HTMLInputTypeAttribute } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CampoComIconeProps {
  icone: string;
  label: string;
  id: string;
  tipo?: HTMLInputTypeAttribute;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  acao?: ReactNode;
}

export function CampoComIcone({
  icone,
  label,
  id,
  tipo = "text",
  valor,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  required,
  ariaInvalid,
  ariaDescribedBy,
  acao,
}: CampoComIconeProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
      >
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-md border border-border bg-surface px-3",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        )}
      >
        <Icon icon={icone} className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          id={id}
          type={tipo}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
          aria-invalid={ariaInvalid ? true : undefined}
          aria-describedby={ariaDescribedBy}
          className="h-11 min-w-0 flex-1 border-none bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
        />
        {acao}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/shared/components/campo-com-icone.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/campo-com-icone.tsx src/shared/components/campo-com-icone.test.tsx
git commit -m "feat: add CampoComIcone shared input for the login v2 field style"
```

---

### Task 4: Extend the global Supabase auth test mock + `EsqueciSenhaDialog`

**Files:**
- Modify: `vitest.setup.ts` (only the returned mock object, shown in full below)
- Create: `src/features/auth/esqueci-senha-dialog.tsx`
- Test: `src/features/auth/esqueci-senha-dialog.test.tsx`

**Interfaces:**
- Consumes: `CampoComIcone` (Task 3, exact props above).
- Produces:
  ```ts
  interface EsqueciSenhaDialogProps {
    aberto: boolean;
    onOpenChange: (aberto: boolean) => void;
    emailInicial?: string;
  }
  function EsqueciSenhaDialog(props: EsqueciSenhaDialogProps): JSX.Element;
  ```
  Consumed by Task 6 (`login-page.tsx`).
- After this task, every test in the suite can call `vi.mocked(supabase.auth.<método>)` for
  `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`, `getSession` — none of
  these exist on the shared mock today (`supabase.auth` is currently `undefined` under test).

**Why this task touches `vitest.setup.ts`:** `login-page.tsx` already calls
`supabase.auth.signInWithPassword` in production, but it has never had a test, so this gap was
never hit. This task is the first to need `supabase.auth.*` under test, so it adds the stub here.

- [ ] **Step 1: Extend the shared test mock**

Current end of the `vi.mock("./src/lib/supabase", ...)` factory in `vitest.setup.ts`:

```ts
  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { ok: true }, error: null }),
      },
    },
  };
});
```

Replace with:

```ts
  return {
    supabase: {
      from: (table: string) => new FakeQueryBuilder(table),
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
  };
});
```

- [ ] **Step 2: Run the full suite to confirm this is purely additive**

Run: `npx vitest run`
Expected: PASS — same total as before (no existing code reads `supabase.auth`).

- [ ] **Step 3: Write the failing test for `EsqueciSenhaDialog`**

```tsx
// src/features/auth/esqueci-senha-dialog.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EsqueciSenhaDialog } from "./esqueci-senha-dialog";
import { supabase } from "@/lib/supabase";

describe("EsqueciSenhaDialog", () => {
  beforeEach(() => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockReset();
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as never);
  });

  it("envia o e-mail e mostra a confirmação", async () => {
    render(
      <EsqueciSenhaDialog aberto onOpenChange={() => {}} emailInicial="joao@antonello.com" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    await waitFor(() =>
      expect(
        screen.getByText(/Se esse e-mail estiver cadastrado, enviamos um link/),
      ).toBeInTheDocument(),
    );
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "joao@antonello.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/redefinir-senha") }),
    );
  });

  it("mostra erro inline quando a chamada falha", async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValueOnce(new Error("rede"));
    render(
      <EsqueciSenhaDialog aberto onOpenChange={() => {}} emailInicial="joao@antonello.com" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    await waitFor(() =>
      expect(
        screen.getByText("Não foi possível enviar o link agora. Tente novamente em instantes."),
      ).toBeInTheDocument(),
    );
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/features/auth/esqueci-senha-dialog.test.tsx`
Expected: FAIL — `Failed to resolve import "./esqueci-senha-dialog"`.

- [ ] **Step 5: Write minimal implementation**

```tsx
// src/features/auth/esqueci-senha-dialog.tsx
import { useState, type FormEvent } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { supabase } from "@/lib/supabase";

interface EsqueciSenhaDialogProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  emailInicial?: string;
}

export function EsqueciSenhaDialog({
  aberto,
  onOpenChange,
  emailInicial,
}: EsqueciSenhaDialogProps) {
  const [email, setEmail] = useState(emailInicial ?? "");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function fechar(novoAberto: boolean) {
    if (!novoAberto) {
      setEmail(emailInicial ?? "");
      setEnviando(false);
      setEnviado(false);
      setErro(null);
    }
    onOpenChange(novoAberto);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar o link agora. Tente novamente em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">Redefinir senha</DialogTitle>
          <DialogDescription>
            Informe seu e-mail — enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>

        {enviado ? (
          <div className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-3 text-sm text-foreground">
            <Icon icon="lucide:mail-check" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>Se esse e-mail estiver cadastrado, enviamos um link de redefinição.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <CampoComIcone
              icone="lucide:mail"
              label="E-mail"
              id="esqueci-senha-email"
              tipo="email"
              valor={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
              required
            />

            {erro ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              >
                {erro}
              </p>
            ) : null}

            <Button type="submit" disabled={enviando} className="w-full">
              {enviando ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/features/auth/esqueci-senha-dialog.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add vitest.setup.ts src/features/auth/esqueci-senha-dialog.tsx src/features/auth/esqueci-senha-dialog.test.tsx
git commit -m "feat: add EsqueciSenhaDialog and auth stubs to the shared Supabase test mock"
```

---

### Task 5: `/redefinir-senha` route + `RedefinirSenhaPage`

**Files:**
- Create: `src/features/auth/redefinir-senha-page.tsx`
- Create: `src/routes/redefinir-senha.tsx`
- Test: `src/features/auth/redefinir-senha-page.test.tsx`

**Interfaces:**
- Consumes: `CampoComIcone` (Task 3).
- Produces: `RedefinirSenhaPage(): JSX.Element` — a route component with no props, mounted at
  `/redefinir-senha`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/auth/redefinir-senha-page.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RedefinirSenhaPage } from "./redefinir-senha-page";
import { supabase } from "@/lib/supabase";

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("RedefinirSenhaPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(supabase.auth.getSession).mockReset();
    vi.mocked(supabase.auth.updateUser).mockReset();
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: {}, error: null } as never);
  });

  it("com sessão de recuperação válida, salva a nova senha e navega para /admin", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "x" } as never },
      error: null,
    });

    render(<RedefinirSenhaPage />);
    await screen.findByText("Definir nova senha");

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "senha123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: "/admin" }));
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "senha123" });
  });

  it("sem sessão de recuperação, mostra o estado de link inválido", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<RedefinirSenhaPage />);

    await screen.findByText("Este link expirou ou já foi usado.");
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("bloqueia o envio quando as senhas não coincidem, sem chamar updateUser", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "x" } as never },
      error: null,
    });

    render(<RedefinirSenhaPage />);
    await screen.findByText("Definir nova senha");

    fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: "senha123" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "outraSenha" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/auth/redefinir-senha-page.test.tsx`
Expected: FAIL — `Failed to resolve import "./redefinir-senha-page"`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/auth/redefinir-senha-page.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { CampoComIcone } from "@/shared/components/campo-com-icone";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { supabase } from "@/lib/supabase";

type Estado = "verificando" | "formulario" | "link-invalido";

export function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEstado(data.session ? "formulario" : "link-invalido");
    });
  }, []);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    toast.success("Senha atualizada!");
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end px-4 py-4 md:px-8">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm space-y-6">
          {estado === "verificando" ? (
            <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Icon icon="lucide:loader-circle" className="h-6 w-6 animate-spin" />
              <p className="text-sm">Verificando o link...</p>
            </div>
          ) : null}

          {estado === "link-invalido" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <Icon icon="lucide:circle-alert" className="h-8 w-8 text-destructive" />
              <h1 className="font-display text-xl font-bold text-foreground">
                Este link expirou ou já foi usado.
              </h1>
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Voltar para o login
              </Link>
            </div>
          ) : null}

          {estado === "formulario" ? (
            <>
              <div className="space-y-1 text-center">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Definir nova senha
                </h1>
                <p className="text-sm text-muted-foreground">
                  Escolha uma nova senha para acessar a retaguarda.
                </p>
              </div>

              <form onSubmit={salvar} className="space-y-4">
                <CampoComIcone
                  icone="lucide:lock"
                  label="Nova senha"
                  id="nova-senha"
                  tipo="password"
                  valor={novaSenha}
                  onChange={setNovaSenha}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <CampoComIcone
                  icone="lucide:lock"
                  label="Confirmar nova senha"
                  id="confirmar-senha"
                  tipo="password"
                  valor={confirmarSenha}
                  onChange={setConfirmarSenha}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />

                {erro ? (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                  >
                    {erro}
                  </p>
                ) : null}

                <Button type="submit" disabled={salvando} className="w-full">
                  {salvando ? "Salvando..." : "Salvar nova senha"}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
```

```tsx
// src/routes/redefinir-senha.tsx
import { createFileRoute } from "@tanstack/react-router";
import { RedefinirSenhaPage } from "@/features/auth/redefinir-senha-page";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha · Antonello Terraplanagem" },
      {
        name: "description",
        content: "Defina uma nova senha de acesso à retaguarda da Antonello Terraplanagem.",
      },
    ],
  }),
  component: RedefinirSenhaPage,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/auth/redefinir-senha-page.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/redefinir-senha-page.tsx src/features/auth/redefinir-senha-page.test.tsx src/routes/redefinir-senha.tsx
git commit -m "feat: add /redefinir-senha route and page for real password reset"
```

---

### Task 6: Redesign `login-page.tsx`

**Files:**
- Modify: `src/features/auth/login-page.tsx` (full current content shown below)
- Test: `src/features/auth/login-page.test.tsx`

**Interfaces:**
- Consumes: `CampoComIcone` (Task 3), `EsqueciSenhaDialog` (Task 4), `STORAGE_KEY_LEMBRAR` (Task
  2), `VERSAO_SISTEMA`/`CODINOME_SISTEMA` (Task 1).

Current full content of `src/features/auth/login-page.tsx`:

```tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HazardStripe } from "@/shared/components/hazard-stripe";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

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
      {/* Painel de marca — asfalto fixo (não segue o toggle); tablet e desktop.
          A logo "preto" já traz fundo escuro embutido idêntico ao bg-asphalt,
          então as bordas do PNG quadrado se fundem ao painel. */}
      <aside className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-asphalt md:flex">
        <HazardStripe className="absolute inset-x-0 top-0" />

        <div className="flex flex-col items-center gap-8 px-12 text-center">
          <img
            src="/logo-antonello-preto.png"
            alt="Antonello Terraplanagem"
            className="w-[20rem] max-w-full select-none object-contain"
          />
          <div className="space-y-4">
            <p className="mx-auto max-w-sm text-balance text-base leading-relaxed text-sidebar-foreground/85">
              Horas de máquina, ordens de serviço e faturamento em um só lugar — com a rentabilidade
              de cada equipamento e cada obra sempre à vista.
            </p>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              Gestão de Terraplanagem
            </p>
          </div>
        </div>

        <HazardStripe className="absolute inset-x-0 bottom-0" />
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
          {/* Toggle mantido: não muda a cor desta tela (painéis são fixos), mas
              persiste a preferência de tema do usuário para quando entrar em /admin,
              atendendo à regra de tema claro/escuro obrigatório em toda a aplicação. */}
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
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? "login-erro" : undefined}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-invalid={erro ? true : undefined}
                  aria-describedby={erro ? "login-erro" : undefined}
                  className="h-11"
                />
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
    </main>
  );
}
```

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/auth/login-page.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginPage } from "./login-page";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEY_LEMBRAR } from "@/lib/supabase-storage";

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    vi.mocked(supabase.auth.signInWithPassword).mockReset();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null },
      error: { message: "Credenciais inválidas" },
    } as never);
  });

  it("renderiza o rodapé de versão no painel de marca", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sistemas operacionais")).toBeInTheDocument();
    expect(screen.getByText("v0.21.0 · Ledger")).toBeInTheDocument();
  });

  it("alterna a visibilidade da senha", () => {
    render(<LoginPage />);
    const senha = screen.getByLabelText("Senha") as HTMLInputElement;
    expect(senha.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha.type).toBe("text");
  });

  it("desmarcar 'Manter conectado' grava a preferência antes de submeter", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByLabelText("Manter conectado"));
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "joao@antonello.com" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY_LEMBRAR)).toBe("false"));
  });

  it("clique em 'Esqueci minha senha' abre o dialog", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Esqueci minha senha" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/auth/login-page.test.tsx`
Expected: FAIL — version footer / show-hide button / checkbox / dialog trigger don't exist yet in
the current markup.

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

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/auth/login-page.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/login-page.tsx src/features/auth/login-page.test.tsx
git commit -m "feat: redesign login page with full-bleed brand panel and remember-me"
```

---

### Task 7: Final hygiene

**Files:** none (verification only).

- [ ] **Step 1: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run: `npx vitest run`
Expected: PASS — previous total (526 tests / 93 files, per the last full run on this branch)
plus the new tests added by Tasks 1, 2, 3, 4, 5, 6 (1 + 4 + 3 + 2 + 3 + 4 = 17 new tests across 6
new test files).

- [ ] **Step 4: Manual visual check (user)**

Per this project's convention, the user does the manual browser smoke test — not a subagent.
Ask the user to check, in both light and dark theme:
- `/login`: full-bleed brand panel with status/version footer, show/hide password, "Manter
  conectado" + "Esqueci minha senha" row, dialog opens and shows the confirmation state.
- `/redefinir-senha` (with no valid recovery session, e.g. visiting it directly): shows the
  "link expirado" state with a working link back to `/login`.

- [ ] **Step 5: Commit (only if any hygiene step required a fix)**

If Steps 1–3 were clean, there is nothing to commit for this task. If a fix was needed:

```bash
git add -A
git commit -m "fix: address lint/type issues from login v2 redesign"
```
