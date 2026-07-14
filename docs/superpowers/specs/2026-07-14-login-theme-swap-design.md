# Login — troca de lado animada ao alternar tema

**Data:** 2026-07-14
**Área:** `src/features/auth/login-page.tsx` (único arquivo alterado)

## Contexto

A tela de login (`/login`) tem hoje um painel de marca (logo full-bleed, sempre escuro/asfalto,
sempre à esquerda no desktop) e um painel de formulário travado em tema claro (classe
`.theme-light`, que sobrescreve os tokens de cor independentemente do toggle de tema). Clicar no
`ThemeToggle` não muda nada visualmente nesta tela — só grava a preferência no `localStorage`
para quando o usuário entrar em `/admin`. Um teste manual do usuário mostrou que isso parece um
botão quebrado.

## Objetivo

Fazer o toggle de tema `de verdade` na tela de login: o painel do formulário passa a seguir o
tema real (claro/escuro, usando os tokens já existentes do projeto), e os dois painéis trocam de
lado com uma transição animada ao alternar — dando um resultado visual satisfatório em vez de um
clique sem efeito.

## Decisões de design

1. **O painel de marca mantém sua aparência (logo full-bleed sobre asfalto), só a posição
   muda.** Ele representa a identidade da marca, não precisa "ficar claro" — é sempre escuro,
   independentemente do tema. O que muda com o toggle é apenas de que lado (esquerda/direita)
   ele fica.
2. **O painel do formulário passa a seguir o tema real, removendo a classe `.theme-light`.**
   Como os tokens de cor (`--background`, `--foreground`, `--muted-foreground`, `--border`, etc.)
   já têm valores definidos tanto na raiz quanto em `.dark` (`src/styles.css`), bastar remover a
   classe fixa faz o painel herdar o tema real do `<html>` sem precisar de nenhum token novo.
3. **Uma única fonte de verdade decide o lado: o próprio valor do tema (`useTheme().theme`),
   não um estado de "invertido" separado.** Tema `light` → painel de marca à esquerda, formulário
   à direita (visual atual, default). Tema `dark` → painel de marca à direita, formulário à
   esquerda (e agora genuinamente escuro). Isso evita qualquer bug de dessincronia entre "qual
   lado está mostrando" e "qual tema está ativo" — são a mesma variável.
4. **Transição: `transform: translateX()` puro, sem nova lib.** Os dois painéis ficam
   absolutamente posicionados (um ancorado à esquerda, outro à direita) dentro de um contêiner
   `relative overflow-hidden`, e cada um desliza `translate-x-full`/`-translate-x-full` (100% da
   própria largura) para cruzar para o lado oposto. `transition-transform duration-500
   ease-in-out`. Só `transform` anima (nunca `left`/`width`) — evita repaint caro.
5. **Só desktop (`md:` e acima) tem o split-screen / troca de lado.** No mobile, o painel de
   marca já é `hidden` hoje (só existe o cabeçalho compacto com a logo). A troca de lado e a
   animação são exclusivamente classes `md:*`; no mobile o formulário continua em fluxo normal,
   full-width, sem posicionamento absoluto.
6. **Logo do cabeçalho compacto (mobile) passa a trocar com o tema.** Hoje é sempre
   `/logo-antonello-branco.png` (fundo claro embutido, pensado para o painel sempre-claro). Com o
   formulário seguindo o tema real, essa logo precisa virar `/logo-antonello-preto.png` (fundo
   escuro embutido, a mesma já usada no painel de marca) quando o tema for `dark` — senão vira um
   quadrado claro destoando do fundo escuro.
7. **`prefers-reduced-motion`: a troca é instantânea (sem deslizamento), tema e posição mudam
   direto.** Usa o utilitário Tailwind `motion-reduce:transition-none` nas classes de transição —
   não precisa de JS extra, o navegador já expõe essa media query via essa variante.
8. **Anúncio para leitor de tela:** uma região `aria-live="polite"` (visualmente oculta, `sr-only`)
   com o texto "Tema alterado para escuro"/"Tema alterado para claro", atualizada a cada troca de
   `theme`. Como a ordem do DOM não muda (só a posição via `transform`), leitores de tela não são
   afetados pela troca de lado em si — só precisam saber que o tema mudou.
9. **Foco permanece no botão do toggle** — nenhuma mudança de foco é necessária, já que nenhum
   modal ou navegação ocorre.
10. **Duração e easing:** `duration-500 ease-in-out` — mais longo que uma micro-interação comum
    (150-300ms) porque é uma reorganização estrutural do layout inteiro, mas dentro do teto
    geral de "nada acima de ~500ms para UI" das boas práticas consultadas.

## Implementação (visão geral do arquivo único)

`src/features/auth/login-page.tsx`:
- Novo import: `useTheme` de `@/shared/hooks/use-theme`, `cn` de `@/lib/utils`.
- `const { theme } = useTheme(); const invertido = theme === "dark";`
- `<main>`: hoje é `flex min-h-screen w-full bg-asphalt` (linha 58) — só adiciona `relative
  overflow-hidden` a essas classes existentes. Não precisa virar `flex-col` nem remover nada: no
  mobile o único filho visível é o painel do formulário (o `aside` já é `hidden` abaixo de
  `md:`), então o `flex` (linha, com um único item) continua se comportando igual a hoje; no
  desktop os dois filhos passam a ser `md:absolute`, o que os tira do fluxo flex de qualquer
  forma — o `display: flex` do pai fica irrelevante para o posicionamento deles a partir de
  `md:`.
- `<aside>` (painel de marca): adiciona
  `md:absolute md:inset-y-0 md:left-0 md:transition-transform md:duration-500 md:ease-in-out
  motion-reduce:md:transition-none` e `invertido ? "md:translate-x-full" : "md:translate-x-0"`
  às classes já existentes (`hidden w-1/2 flex-col overflow-hidden bg-asphalt md:flex`).
- `<div>` (painel do formulário): remove `theme-light`; adiciona
  `md:absolute md:inset-y-0 md:right-0 md:w-1/2 md:transition-transform md:duration-500
  md:ease-in-out motion-reduce:md:transition-none` e
  `invertido ? "md:-translate-x-full" : "md:translate-x-0"` às classes já existentes (`flex
  w-full flex-1 flex-col bg-background text-foreground`, tirando o `md:w-1/2` duplicado que já
  vem das novas classes).
- Logo do cabeçalho mobile: `src={invertido ? "/logo-antonello-preto.png" :
  "/logo-antonello-branco.png"}`.
- Nova região: `<div aria-live="polite" className="sr-only">{`Tema alterado para ${invertido ? "escuro" : "claro"}`}</div>`
  colocada uma vez dentro do `<main>` (fora dos dois painéis, para não ser afetada pelo
  `transform` de nenhum dos dois).

Nenhum arquivo novo, nenhum token novo, nenhuma lib nova. `EsqueciSenhaDialog`,
`CampoComIcone`, `HazardStripe`, `ThemeToggle`, `versao-sistema.ts`, `supabase-storage.ts` — todos
já existentes, sem alteração.

## Testes

Estende `src/features/auth/login-page.test.tsx` (já existe):
- Alternar o tema (via `ThemeToggle`, que já dispara `useTheme().toggle()`) troca a logo do
  cabeçalho mobile de `/logo-antonello-branco.png` para `/logo-antonello-preto.png` e vice-versa.
- A região `aria-live="polite"` reflete o texto correto ("Tema alterado para escuro"/"...claro")
  após o toggle.
- Classes de posição (`md:translate-x-full` no painel de marca / `md:-translate-x-full` no
  painel do formulário) refletem o estado após o toggle — teste via `container.querySelector`
  checando a presença da classe esperada.
- O teste já existente que verifica o rodapé de versão continua passando sem alteração (o
  rodapé de versão vive dentro do painel de marca, que não muda de conteúdo, só de posição).

## Fora de escopo

- Qualquer alteração em `/admin` ou nas outras telas — este ajuste é só na tela de login.
- Persistência de tema já existe (`useTheme`, `localStorage`) — não é tocada, só passa a ter
  efeito visual nesta tela também.
