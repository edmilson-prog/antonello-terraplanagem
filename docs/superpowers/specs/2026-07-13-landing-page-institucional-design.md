# Landing Page Institucional — Design Spec

**Data:** 2026-07-13
**Origem:** brainstorming a partir do export `docs/html/Antonello Terraplanagem — Design System (2)/ui_kits/site/`

## Contexto e objetivo

O projeto hoje só tem `/app` (operador) e `/admin` (retaguarda) — nenhuma página pública
institucional. A rota `/` apenas redireciona para `/login`. O design system recém-exportado traz
um mock completo de landing page de marketing (`ui_kits/site/index.html` + `site.css`), com o
mesmo tema visual "canteiro de obras" já usado no resto do produto.

Objetivo desta rodada: implementar essa landing page em React, servindo em `/`, reaproveitando ao
máximo os tokens e padrões já estabelecidos nas rodadas anteriores de re-vestimento visual
(`DocumentoHero`, `StatStrip`, etc. em `src/shared/components/`).

Escopo: **somente a landing page**. Outras telas do design system ficam para rodadas futuras.

## Dados reais da empresa

Levantados na tabela `EMPRESA` do ERP legado `docs/db/Gerencial.fdb` (única linha, `EMP_CODIGO=1`):

| Campo | Valor a usar publicamente |
|---|---|
| Razão social | ANTONELLO TERRAPLANAGEM LTDA |
| CNPJ | 36.508.280/0001-90 |
| Cidade / UF | Frederico Westphalen — RS |
| Telefone / WhatsApp | (55) 99924-2409 |

**Omitir da UI pública:** e-mail cadastrado (`p.pawimac@gmail.com`, pessoal) e nome do responsável
(`JOSE ANTONELLO`) — informação interna do ERP, não destinada a exibição institucional.

**Correção lateral, mesmo escopo (dado errado sobre a mesma informação):** `src/routes/__root.tsx`
declara hoje `areaServed: "BR-PR"` (Paraná) no JSON-LD `Organization` — incorreto; a empresa é do
Rio Grande do Sul. Corrigir para `"BR-RS"` como parte desta tarefa.

## Conteúdo placeholder (marcar explicitamente no código)

Estes trechos do mock são exemplo/ilustrativo, não dado real levantado nesta rodada — devem ficar
com um comentário `// PLACEHOLDER: ...` no código-fonte apontando o que falta confirmar:

- **Contadores do hero** — "+20 anos", "14 equipamentos", "180+ obras", "2140h/ano operadas":
  números do mock, não medidos. Não usar as contagens do ERP legado (326 OS, 1.066 clientes) como
  substituto — são dados sujos/duplicados (ver `docs/db/GUIA-BANCO-GERENCIAL-ANTONELLO.md`, regras
  2 e 4), não representam o negócio atual.
- **Seção "Frota própria"** — os 3 cards de máquina (Escavadeira CAT 320, Retroescavadeira JCB 3CX,
  Pá Carregadeira XCMG) com suas especificações são conteúdo de exemplo do mock, não o inventário
  real de equipamentos do sistema (`src/mocks/equipamentos.ts` / futura tabela Supabase). Manter
  como está por ora; revisar com o cliente numa rodada futura.
- **Fotos** (hero + 3 máquinas da frota) — sem arquivo real disponível ainda. Renderizar via
  componente `FotoPlaceholder` (bloco com gradiente + ícone do tipo de equipamento + rótulo do que
  deveria estar ali), fácil de trocar por `<img>` depois.

## Arquitetura

### Rota

`src/routes/index.tsx` deixa de fazer `redirect({ to: "/login" })` e passa a renderizar
`LandingPage` (padrão idêntico ao de `src/routes/login.tsx`: rota fina delegando a um componente de
feature, com `head()` próprio para SEO/meta tags substituindo o `og:url`/`canonical` atuais que
apontam para `/login` como home implícita).

`/login` não muda.

### Feature folder — `src/features/site/`

Site institucional é um domínio novo, que deve crescer (blog, outras páginas do design system).
Segue o padrão feature-based do projeto:

```
src/features/site/
├── components/
│   ├── landing-page.tsx        # monta as seções, na ordem do mock
│   ├── site-header.tsx         # nav sticky + logo + CTA
│   ├── hero-section.tsx        # eyebrow, h1, cta row, chips, foto+floats
│   ├── marquee-servicos.tsx    # ticker CSS-only
│   ├── contadores-section.tsx  # 4 contadores animados
│   ├── servicos-section.tsx    # grid 6 cards de serviço
│   ├── frota-section.tsx       # grid 3 cards de máquina
│   ├── processo-section.tsx    # 4 passos numerados
│   ├── contato-band.tsx        # CTA final + telefone
│   ├── site-footer.tsx         # nav + contato + legal (CNPJ)
│   └── foto-placeholder.tsx    # bloco placeholder de imagem
├── hooks/
│   ├── use-reveal-on-scroll.ts # IntersectionObserver, respeita prefers-reduced-motion
│   └── use-count-up.ts         # animação de contagem, respeita prefers-reduced-motion
└── lib/
    └── contato.ts              # constantes: telefone, wa.me links, CNPJ, cidade/UF
```

Cada componente de seção recebe `id` de âncora idêntico ao mock (`#servicos`, `#frota`,
`#processo`, `#contato`) para a navegação do header funcionar.

## Theming

Nenhum token novo. Reaproveitar 1:1 os tokens já existentes em `src/styles.css`
(`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`,
`bg-primary`, `text-primary`, `bg-secondary`, `bg-sidebar`, `font-display`/`font-sans`/`font-mono`
via `font-display`/`font-mono` classes do Tailwind). A landing reage ao mesmo toggle claro/escuro
global do resto do produto (`useTheme`/`ThemeToggle` já existentes em `src/shared/`) — sem tema
fixo, sem `.theme-light`/força de escuro.

Mapeamento direto dos principais tokens do mock (`tokens/colors.css`) para os já existentes no
projeto:

| Token do mock | Token do projeto |
|---|---|
| `--bg` | `background` |
| `--surface` | `card` |
| `--fg` | `foreground` |
| `--muted` | `muted-foreground` |
| `--amarelo` | `primary` |
| `--border` | `border` |
| `--sidebar` | `sidebar` |

## Interatividade

- **Reveal on scroll:** hook `useRevealOnScroll` — cada seção/elemento chamador recebe um `ref` e
  uma classe `opacity-0 translate-y-5` que vira `opacity-100 translate-y-0` quando entra no
  viewport (via `IntersectionObserver`, threshold 0.12, unobserve após revelar). Se
  `prefers-reduced-motion: reduce`, aplica a classe final imediatamente, sem observer.
- **Contadores:** hook `useCountUp(target: number, durationMs = 1500)` — anima de 0 até `target`
  com easing cúbico, disparado quando a seção de contadores entra no viewport. Reduced motion:
  mostra o valor final direto.
- **Marquee:** CSS puro — track com o conteúdo duplicado (`<span>` repetido) + `@keyframes` de
  translateX -50%, sem JS.
- **Ícones:** `@iconify/react`, prefixo `lucide:`, substituindo os SVGs inline do mock (mesmo ícone,
  mesmo desenho — só troca o mecanismo de renderização, conforme convenção do `CLAUDE.md`).
- **Botões:** reaproveitam `Button` de `src/components/ui/button.tsx` (shadcn) com `className` para
  variantes visuais extras (ex. botão WhatsApp em verde), no mesmo padrão já usado nas páginas de
  detalhe mergeadas nesta sessão (`className="gap-1.5 bg-primary text-primary-foreground ..."`).

## CTAs — WhatsApp

Não existe formulário de lead nem integração de captura nesta rodada (n8n/WhatsApp seguem mockados
no restante do projeto). Os CTAs "Pedir orçamento" e "Falar no WhatsApp" são links diretos
`https://wa.me/5555999242409` com mensagem pré-preenchida diferente por botão (`?text=...`):

- "Pedir orçamento" → texto pré-preenchido pedindo orçamento.
- "Falar no WhatsApp" → texto pré-preenchido genérico de contato.

O botão "Pedir orçamento" da banda final de contato (`#contato`) usa o mesmo link de orçamento —
diferente do mock original, que apontava de volta para `#top` (comportamento circular sem
utilidade real, corrigido aqui).

**Sem ambiguidade sobre qual CTA faz o quê:** todo botão rotulado "Pedir orçamento" (no header,
no hero e na banda final) é o link `wa.me` de orçamento — nenhum deles faz scroll interno. Só os
links de texto do menu (Serviços / Frota / Como trabalhamos / Contato, no header e no footer)
continuam sendo âncoras de scroll (`#servicos`, `#frota`, `#processo`, `#contato`).

## Testes

Vitest + Testing Library, cobrindo:

- `landing-page.test.tsx`: renderiza todas as seções (header, hero, marquee, contadores, serviços,
  frota, processo, contato, footer) sem erros; contadores chegam ao valor final (usar
  `vi.useFakeTimers()`/act ou renderizar direto o valor final se reduced-motion mockado);
  links de WhatsApp/CTA apontam para as URLs `wa.me` esperadas com o texto certo.
- `use-count-up.test.ts` / `use-reveal-on-scroll.test.ts`: comportamento isolado dos hooks,
  incluindo o caminho `prefers-reduced-motion`.
- `__root.test.tsx` (ou teste focado só no JSON-LD, se já existir suíte para `__root`): confirma
  `areaServed: "BR-RS"`.

## Fora de escopo

- Outras páginas do design system (serão spec/plano à parte).
- Formulário de lead / captura de contato real.
- Fotos reais (usuário vai fornecer depois).
- Números reais de contadores e inventário real de frota na seção "Frota própria".
- Alternador de idioma, blog (já existe uma página de blog solta, não integrada a esta landing —
  fora de escopo mexer nela aqui).
