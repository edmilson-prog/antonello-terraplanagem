# Login v2 — redesign visual + recuperação de senha real

**Data:** 2026-07-14
**Áreas:**
- `src/features/auth/login-page.tsx` (redesign)
- `src/lib/supabase.ts` (adaptador de storage para "Manter conectado")
- `src/features/auth/esqueci-senha-dialog.tsx` (novo)
- `src/features/auth/redefinir-senha-page.tsx` (novo)
- `src/routes/redefinir-senha.tsx` (novo)
- `src/shared/components/campo-com-icone.tsx` (novo, compartilhado)
- `src/features/auth/versao-sistema.ts` (novo, constante)

**Mock alvo (UI kit, fonte de verdade de design):**
`docs/html/Antonello Terraplanagem — Design System (2)/ui_kits/retaguarda/LoginV2.jsx` +
`screen-login-v2.html` + regras `.rtg-login*`/`.rtg-field` em `kit.css` (linhas 314–361).

## Objetivo

Trocar o painel de marca da tela de login (hoje: logo centralizada sobre `bg-asphalt`) pelo
painel *full-bleed* do mock v2 (logo cobrindo o painel inteiro + gradiente escuro por cima +
faixa de sinalização + rodapé de status/versão), reestilizar os campos do formulário no padrão
"caixa com ícone" do mock, e adicionar duas funcionalidades reais que o mock só sugere
visualmente: "Manter conectado" (persistência de sessão) e "Esqueci minha senha" (fluxo completo
de redefinição via Supabase Auth).

## Decisões de design (resolvendo mock × domínio real)

1. **Painel de marca: mesma logo já usada hoje, não uma foto nova.** O mock v2 usa
   `assets/logo-antonello-dark.png` como imagem de fundo *full-bleed* (não uma foto de obra) —
   o projeto não tem fotos de canteiro no repositório, então a implementação real usa
   `/logo-antonello-preto.png` (já em `public/`, mesmo arquivo hoje usado no painel do login v1)
   como `background-image`/`object-cover`, com o gradiente escuro por cima
   (`linear-gradient` replicando `.rtg-login2-scrim`: de `rgba(asphalt,.10)` no topo a
   `rgba(asphalt,.72)` no rodapé) e uma `HazardStripe` ancorada no rodapé do painel (reaproveita
   o componente existente, sem recriar o gradiente diagonal).
2. **Campo "Usuário" do mock vira "E-mail" no real.** O mock usa autenticação username-only
   fictícia; o backend real é `supabase.auth.signInWithPassword({ email, password })`. Mantém-se
   o rótulo/placeholder "E-mail" (`type="email"`, `inputMode="email"`) — só o estilo visual da
   caixa com ícone (`lucide:mail` em vez de `lucide:user`) vem do mock.
3. **"Manter conectado" é funcional, não decorativo.** Controla se a sessão do Supabase
   persiste em `localStorage` (sobrevive ao fechar o navegador) ou só em `sessionStorage`
   (expira ao fechar a aba) — ver seção "Adaptador de storage" abaixo. Estado inicial do
   checkbox: marcado (mesmo padrão do mock, que já nasce `useState(true)`).
4. **"Esqueci minha senha" é funcional.** Abre um `Dialog` (shadcn, já usado no projeto) sobre a
   própria tela de login — não uma rota nova. Chama
   `supabase.auth.resetPasswordForEmail(email, { redirectTo })` de verdade.
5. **Rodapé de status/versão usa a versão real do projeto, não "v0.1 · fundação" do mock.**
   Nova constante `src/features/auth/versao-sistema.ts` exporta `VERSAO_SISTEMA = "0.21.0"` e
   `CODINOME_SISTEMA = "Ledger"` (hoje em `package.json`/`CHANGELOG.md`) — mantida manualmente a
   cada bump de versão, junto do passo já existente no fluxo de PRDs do `CLAUDE.md`
   ("Incrementar versão... Atualizar CHANGELOG"). O texto exibido é
   `"Sistemas operacionais"` (bolinha verde, `text-success`/token semântico) +
   `"v{VERSAO_SISTEMA} · {CODINOME_SISTEMA}"` em `font-mono`.
6. **Nada de placeholder/dead end nos dois novos fluxos** — ao contrário do que o próprio mock
   faz (checkbox e link sem lógica nenhuma), a implementação real cobre os dois de ponta a
   ponta, incluindo a tela de "definir nova senha" e os estados de erro (ver seções abaixo).
7. **Componente novo `CampoComIcone` por regra dos três.** É usado em 3 lugares: e-mail/senha do
   login, e-mail do dialog "Esqueci minha senha", e nova senha/confirmar senha da tela de
   redefinição — mesmo padrão visual do mock (ícone `@iconify/react` à esquerda dentro de uma
   caixa com borda, `focus-within` destaca com anel amarelo).
8. **Sem `react-hook-form`/`zod` nesta tela.** O `login-page.tsx` atual usa `useState` puro
   (sem lib de formulário); os dois formulários novos seguem o mesmo padrão para consistência —
   validação de "senhas iguais"/"mínimo 6 caracteres" é trivial o suficiente para não justificar
   introduzir uma lib de validação só aqui.
9. **Light/dark:** painel de marca continua fixo em asfalto (não segue o toggle, como hoje);
   painel do formulário continua forçado a `theme-light` (como hoje). O `Dialog` de "Esqueci
   minha senha" e a página `/redefinir-senha` seguem o tema normal da aplicação (não fixo) —
   são telas independentes do split-screen do login, sem painel de marca lateral.

## Reuso (não reinventar)

- `src/shared/components/hazard-stripe.tsx` — `HazardStripe` para a faixa de sinalização.
- `src/shared/components/theme-toggle.tsx` — `ThemeToggle`, mantido no header do painel do
  formulário exatamente como hoje.
- `src/components/ui/dialog.tsx` — `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` do
  shadcn para "Esqueci minha senha".
- `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/label.tsx` —
  mantidos como base; `CampoComIcone` envolve um `Input` existente, não recria o campo do zero.
- `@iconify/react` (`lucide:mail`, `lucide:lock`, `lucide:eye`, `lucide:eye-off`,
  `lucide:circle-alert`, `lucide:smartphone`) — ícones da tela, mesmo padrão de toda a app.
- `toast` (`sonner`) — mensagens de sucesso/erro do dialog e da página de redefinição, mesmo
  padrão já usado em `login-page.tsx` (`toast.success("Bem-vindo!")`).
- `bg-asphalt`, `hazard-stripe` (utility), `theme-light` — tokens/classes já existentes em
  `src/styles.css`, nenhum token novo.

## Componente compartilhado novo

### `src/shared/components/campo-com-icone.tsx`

```ts
interface CampoComIconeProps {
  icone: string; // nome do ícone Iconify, ex. "lucide:mail"
  label: string;
  id: string;
  tipo?: React.HTMLInputTypeAttribute; // padrão "text"
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  acao?: React.ReactNode; // botão opcional dentro da caixa (ex. mostrar/ocultar senha)
}
function CampoComIcone(props: CampoComIconeProps): JSX.Element;
```

Visual: `<div>` com rótulo pequeno em uppercase (`font-display text-[10px] uppercase
tracking-[0.12em] text-muted-foreground`) acima de uma caixa (`flex items-center gap-2.5 px-3
rounded-md border border-border bg-surface focus-within:border-primary
focus-within:ring-2 focus-within:ring-primary/20`), ícone à esquerda (`text-muted-foreground`,
16px), `<input>` sem borda própria (`flex-1 h-11 bg-transparent border-none outline-none
text-sm`), e a `acao` (quando houver) alinhada à direita dentro da mesma caixa.

## Tela 1 — Login (`src/features/auth/login-page.tsx`)

**Painel de marca (`aside`, metade esquerda, `hidden md:flex`):**
- `<img src="/logo-antonello-preto.png">` em `absolute inset-0 object-cover object-center`.
- Camada de gradiente por cima: `absolute inset-0` com
  `bg-gradient-to-b from-asphalt/10 via-asphalt/5 to-asphalt/75` (replica `.rtg-login2-scrim`).
- Rodapé ancorado (`absolute inset-x-0 bottom-0 p-8`): `HazardStripe` (altura reduzida, `h-2`) +
  linha com indicador de status à esquerda (bolinha verde + "Sistemas operacionais",
  `font-semibold text-[11px]`) e versão à direita (`font-mono text-[11px]
  text-sidebar-foreground/60`, formato `"v0.21.0 · Ledger"`).

**Marca compacta (mobile, quando o painel lateral some — `md:hidden`):** mantém o header atual
(logo branca + `ThemeToggle`), sem mudanças.

**Formulário (mantém tudo que já existe: `h1`, `p`, submit, erro, nota de rodapé sobre operador
de campo), com as trocas:**
- Campo "E-mail" → `CampoComIcone` (`icone="lucide:mail"`, `tipo="email"`).
- Campo "Senha" → `CampoComIcone` (`icone="lucide:lock"`, `tipo={mostrarSenha ? "text" :
  "password"}`, `acao`: botão ghost `lucide:eye`/`lucide:eye-off` que alterna `mostrarSenha`,
  `aria-label` "Mostrar senha"/"Ocultar senha").
- Nova linha entre a senha e o botão de submit: `<div className="flex items-center
  justify-between">` com `Checkbox` do shadcn (`src/components/ui/checkbox.tsx`) + `Label`
  "Manter conectado" à esquerda, e `<button type="button">` "Esqueci minha senha?" à direita
  (`text-xs font-semibold text-primary hover:underline`) que abre o `EsqueciSenhaDialog`.
- Estado `mostrarSenha` (novo `useState<boolean>(false)`) e `manterConectado` (novo
  `useState<boolean>(true)`) no componente.
- Em `entrar()`, antes de `supabase.auth.signInWithPassword`:
  `localStorage.setItem("sb-lembrar-conectado", manterConectado ? "true" : "false")`.

## Adaptador de storage (`src/lib/supabase.ts`)

```ts
export const STORAGE_KEY_LEMBRAR = "sb-lembrar-conectado";

export function backingStorage(): Storage {
  return localStorage.getItem(STORAGE_KEY_LEMBRAR) === "false" ? sessionStorage : localStorage;
}

const storageAdaptavel = {
  getItem: (key: string) => backingStorage().getItem(key),
  setItem: (key: string, value: string) => backingStorage().setItem(key, value),
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { storage: storageAdaptavel },
});
```

`backingStorage` e `STORAGE_KEY_LEMBRAR` são exportados nomeadamente de `src/lib/supabase.ts`
especificamente para serem testáveis sem instanciar o client real (ver "Testes" abaixo).

Padrão: ausência da chave (primeiro acesso, antes de qualquer login) equivale a "lembrar"
(`localStorage`), igual ao checkbox nascer marcado. `removeItem` limpa dos dois storages para
garantir logout limpo independente de onde a sessão foi gravada.

## Tela 2 — `EsqueciSenhaDialog` (`src/features/auth/esqueci-senha-dialog.tsx`)

```ts
interface EsqueciSenhaDialogProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  emailInicial?: string; // pré-preenche com o que já foi digitado no login
}
function EsqueciSenhaDialog(props: EsqueciSenhaDialogProps): JSX.Element;
```

- `DialogContent` com título "Redefinir senha" e descrição "Informe seu e-mail — enviaremos um
  link para você criar uma nova senha."
- Um `CampoComIcone` (e-mail, `icone="lucide:mail"`), estado próprio `email` (inicializado de
  `emailInicial`).
- Estado `enviando`/`enviado`/`erro`.
- Ao enviar: `supabase.auth.resetPasswordForEmail(email, { redirectTo:
  `${window.location.origin}/redefinir-senha` })`. Em caso de sucesso **ou** de erro que não seja
  de rede (o Supabase não informa se o e-mail existe), mostra o mesmo estado `enviado`: ícone
  `lucide:mail-check` + "Se esse e-mail estiver cadastrado, enviamos um link de redefinição." Erro
  de rede/rate-limit real (exceção lançada) mostra banner inline (mesmo padrão visual do erro de
  login: `rounded-md border border-destructive/30 bg-destructive/10 ... text-destructive`).
- Fechar o dialog (`onOpenChange(false)`) reseta `email`/`enviado`/`erro` para o próximo uso.

## Tela 3 — `/redefinir-senha` (`src/routes/redefinir-senha.tsx` + `redefinir-senha-page.tsx`)

Rota pública nova, mesmo padrão de `login.tsx` (`createFileRoute("/redefinir-senha")`, `head`
com `title`/`description`/`canonical`). Nenhuma rota existente no projeto usa `meta` `robots`
hoje (nem `login.tsx`) — esta tela segue o mesmo padrão, sem adicionar `noindex` (não há
convenção estabelecida para isso; ficaria inconsistente introduzir uma só aqui).

`RedefinirSenhaPage`:
- Ao montar, `useEffect` chama `supabase.auth.getSession()`. Três estados possíveis:
  1. **Sem sessão** → `estado = "link-invalido"`: cartão central com ícone
     `lucide:circle-alert`, "Este link expirou ou já foi usado.", botão/`Link` "Voltar para o
     login" (`to: "/login"`).
  2. **Com sessão de recuperação** → `estado = "formulario"`: mostra o formulário (ver abaixo).
  3. **Enquanto verifica** → `estado = "verificando"`: mesmo padrão de loading já usado em
     outras telas assíncronas do projeto (spinner/skeleton simples).
- **Formulário** (quando `estado === "formulario"`): dois `CampoComIcone` (`icone="lucide:lock"`,
  `tipo="password"`) — "Nova senha" e "Confirmar nova senha" — mais botão "Salvar nova senha".
  Validação client-side antes de chamar a API: nova senha com no mínimo 6 caracteres (mínimo já
  exigido pelo Supabase Auth por padrão) e os dois campos iguais; erro inline se não passar,
  sem chamar `updateUser`.
- Ao enviar com sucesso: `supabase.auth.updateUser({ password: novaSenha })` →
  `toast.success("Senha atualizada!")` → `navigate({ to: "/admin" })` (usuário já está
  autenticado pela sessão de recuperação, não precisa logar de novo).
- Erro do `updateUser` (ex. senha considerada fraca pela política do Supabase): banner inline
  com a mensagem retornada pela API.
- Layout: card centralizado simples (`min-h-screen grid place-items-center bg-background`,
  `w-full max-w-sm` — sem split-screen/painel de marca, tema normal da app com `ThemeToggle` no
  canto superior).

## Estados de tela (checklist)

- Login: `isLoading` (botão "Entrando..." já existe) / erro (já existe) — sem mudança de
  comportamento, só de estilo dos campos.
- Dialog: `enviando` (botão desabilitado + label "Enviando...") / `enviado` (estado de sucesso) /
  `erro` (banner inline).
- `/redefinir-senha`: `verificando` / `formulario` / `link-invalido`, mais erro de validação
  client-side (senhas diferentes) e erro de API (`updateUser` falhou).

## Acessibilidade (checklist)

- `CampoComIcone` associa `label`/`id` corretamente (`htmlFor`/`id`), `aria-invalid` e
  `aria-describedby` repassados quando há erro (mesmo padrão já usado nos campos atuais de
  `login-page.tsx`).
- Botão de mostrar/ocultar senha: `aria-label` dinâmico, `type="button"` (não envia o form).
- Checkbox "Manter conectado": `<label>` associado, navegável por teclado.
- Contraste do rodapé de status sobre a imagem: o gradiente escurece o suficiente na faixa
  inferior (`asphalt/75` no fim) para o texto claro (`sidebar-foreground`) manter ≥ 4.5:1 —
  mesma técnica de scrim já usada no hero da landing page.
- `Dialog` e página de redefinição seguem o mesmo padrão de foco/`Escape` que os demais
  `Dialog`s do projeto (shadcn já cobre isso).

## Testes

- `login-page.test.tsx` (novo — `login-page.tsx` não tem teste hoje): painel de marca renderiza
  o rodapé de versão (`"v0.21.0 · Ledger"`); botão de mostrar/ocultar senha alterna `type` do
  input; desmarcar "Manter conectado" antes de submeter grava `"false"` em
  `localStorage["sb-lembrar-conectado"]`; clique em "Esqueci minha senha?" abre o dialog
  (verificar `role="dialog"` visível).
- `esqueci-senha-dialog.test.tsx` (novo): envio com e-mail preenchido mostra o estado "enviado"
  (mock de `supabase.auth.resetPasswordForEmail` resolvendo); erro de rede (mock rejeitando)
  mostra banner inline; fechar e reabrir o dialog reseta o estado.
- `redefinir-senha-page.test.tsx` (novo): com `getSession` mockado retornando uma sessão, o
  formulário aparece e submeter chama `updateUser` com a nova senha e navega para `/admin`; com
  `getSession` mockado retornando `null`, mostra o estado "link-invalido"; senhas diferentes no
  formulário bloqueiam o envio sem chamar `updateUser`.
- `supabase-storage-adaptavel.test.ts` (novo, lógica pura, sem React — pode viver como teste de
  uma função exportada separadamente de `src/lib/supabase.ts` para ser testável sem instanciar o
  client real): sem a chave em `localStorage`, grava/lê em `localStorage`; com a chave
  `"false"`, grava/lê em `sessionStorage`; `removeItem` limpa dos dois.
- `campo-com-icone.test.tsx` (novo): renderiza ícone + label + input; `onChange` repassa o valor
  digitado; `acao` (quando fornecida) é renderizada dentro da caixa.
- `tsc --noEmit` limpo; suíte `vitest` existente permanece verde.

**Infraestrutura de teste (pré-requisito):** o mock global de `vitest.setup.ts`
(`vi.mock("./src/lib/supabase", ...)`) hoje só expõe `from` e `functions.invoke` — não tem
`auth` nenhum. `login-page.tsx` já chama `supabase.auth.signInWithPassword` em produção, mas
nunca foi testado (por isso o gap nunca apareceu). Antes de qualquer teste desta spec, o mock
global precisa ganhar um objeto `auth` com `vi.fn()` para `signInWithPassword`, `signOut`,
`resetPasswordForEmail`, `updateUser` e `getSession` (todos resolvendo um valor neutro por
padrão, ex. `{ data: {}, error: null }`), para que cada teste sobrescreva com
`vi.mocked(supabase.auth.<método>).mockResolvedValueOnce(...)` conforme o cenário — mesmo padrão
já usado pelos stores para `supabase.from`.

## Fora de escopo

- Política de força de senha customizada (usa a validação padrão do Supabase Auth + o mínimo de
  6 caracteres verificado no cliente).
- E-mail transacional customizado (template do link de reset) — usa o template padrão já
  configurado no projeto Supabase, sem alteração de branding do e-mail nesta spec.
- Rate limiting / CAPTCHA no "Esqueci minha senha" — depende só da proteção nativa do Supabase
  Auth, nada adicional implementado aqui.
- Redesign do `operador-login-page.tsx` (login do app de campo) — fora de escopo, mock v2 é
  específico da retaguarda.
