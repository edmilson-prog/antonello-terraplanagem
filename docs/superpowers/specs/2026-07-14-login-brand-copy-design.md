# Login — reintrodução do texto de marca no painel de logo

**Data:** 2026-07-14
**Área:** `src/features/auth/login-page.tsx` (único arquivo alterado)

## Contexto

O redesign "Login v2" (já mergeado em `main`, PR #6) reformulou o painel de marca da tela
`/login`: logo full-bleed cobrindo o painel inteiro, gradiente escuro sobreposto (mais forte
embaixo, quase transparente no topo) e um rodapé fixo (`mt-auto`) com `HazardStripe`, o indicador
"Sistemas operacionais" e a versão do sistema (`v0.21.0 · Ledger`). Esse redesign removeu o texto
de proposta de valor que existia na versão anterior do painel: um parágrafo de destaque ("Horas
de máquina, ordens de serviço e faturamento em um só lugar — com a rentabilidade de cada
equipamento e cada obra sempre à vista.") e uma linha em mono/uppercase ("Gestão de
Terraplanagem"). Hoje o painel de marca não tem nenhum texto de conteúdo, só o rodapé técnico.

## Objetivo

Reintroduzir esse texto de marca no painel redesenhado, sem competir visualmente com o rodapé
técnico já existente e sem perder o efeito full-bleed da foto que o redesign conquistou.

## Decisões de design

1. **Posição: topo do painel.** O texto de marca fica no topo, o rodapé técnico continua embaixo
   — cada bloco ocupa uma ponta do painel, sem concorrência. A foto continua visível e
   protagonista na região central.
2. **Vinheta nas duas pontas (mudança no gradiente).** O gradiente atual
   (`from-asphalt/10 via-asphalt/5 to-asphalt/75`) só escurece a base do painel — insuficiente
   para sustentar contraste de texto no topo. Novo gradiente:
   `bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85`. Escurece o topo (suporta o
   texto novo), mantém o meio mais claro (a foto respira, preservando o full-bleed) e mantém (ou
   melhora ligeiramente) o contraste já existente na base, onde vive o rodapé.
3. **Ordem do conteúdo: tagline mono primeiro, parágrafo depois.** "GESTÃO DE TERRAPLANAGEM"
   funciona como um rótulo de categoria pequeno que introduz o contexto; o parágrafo de destaque
   vem em seguida como a frase de maior impacto. Padrão comum em heroes (label pequeno → frase de
   impacto), aprovado pelo usuário sobre a ordem original (que tinha o parágrafo primeiro).
4. **Conteúdo textual inalterado.** Mesma redação da versão antiga, só reposicionada e
   restilizada — nenhuma mudança de texto:
   - Tagline: `Gestão de Terraplanagem`
   - Parágrafo: `Horas de máquina, ordens de serviço e faturamento em um só lugar — com a
     rentabilidade de cada equipamento e cada obra sempre à vista.`
5. **Hierarquia tipográfica:**
   - Tagline: `font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary` —
     mesma família mono e mesmo tamanho (`text-[11px]`) do rodapé técnico, criando uma rima
     tipográfica entre topo e base do painel. Cor `text-primary` (âmbar), ecoando o ponto âmbar
     já usado no rodapé (`bg-primary`).
   - Parágrafo: `font-sans text-base leading-relaxed text-balance max-w-sm text-sidebar-foreground/90`
     — fonte de corpo (IBM Plex Sans via `font-sans`), não display — é uma frase de apoio, não um
     título. `text-balance` e `max-w-sm` controlam o comprimento de linha para leitura confortável
     em uma coluna estreita (metade da tela). Cor `text-sidebar-foreground/90`, levemente mais
     transparente que o texto do rodapé (`text-sidebar-foreground` sem opacidade) para reforçar
     que o rodapé é o elemento "âncora" fixo e o texto de marca é conteúdo editorial por cima da
     foto.
6. **Espaçamento:** o bloco novo usa o mesmo padding lateral do rodapé (`p-10`) e `space-y-3` entre
   tagline e parágrafo, para alinhar visualmente com a margem já estabelecida pelo rodapé.
7. **Sem lógica condicional de tema.** O painel de marca já é sempre escuro (só a posição
   esquerda/direita muda com o tema, decisão do ADR do redesign anterior) — o texto novo segue a
   mesma regra, sempre no tom claro-sobre-escuro, sem variação por `theme`.
8. **Só desktop.** O painel de marca já é `hidden md:flex` — o texto novo vive dentro dele, então
   herda a mesma regra: não aparece no mobile (que já usa só o cabeçalho compacto com a logo).

## Implementação (visão geral do arquivo único)

`src/features/auth/login-page.tsx`:
- Gradiente do `<aside>`: troca o valor de
  `bg-gradient-to-b from-asphalt/10 via-asphalt/5 to-asphalt/75` para
  `bg-gradient-to-b from-asphalt/75 via-asphalt/10 to-asphalt/85`.
- Novo bloco JSX inserido dentro do `<aside>`, **antes** do `<div className="relative mt-auto ...">`
  do rodapé (o `<aside>` já é `flex flex-col`; como a imagem e o gradiente são `absolute`, não
  ocupam espaço no fluxo — o bloco novo se torna o primeiro item flex e o rodapé com `mt-auto`
  continua empurrado para baixo, sem precisar de nenhum posicionamento absoluto adicional):

```tsx
<div className="relative space-y-3 p-10">
  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
    Gestão de Terraplanagem
  </p>
  <p className="max-w-sm text-balance text-base leading-relaxed text-sidebar-foreground/90">
    Horas de máquina, ordens de serviço e faturamento em um só lugar — com a rentabilidade de
    cada equipamento e cada obra sempre à vista.
  </p>
</div>
```

Nenhum arquivo novo, nenhum token novo, nenhuma lib nova.

## Testes

Estende `src/features/auth/login-page.test.tsx` (já existe):
- O painel de marca renderiza a tagline "Gestão de Terraplanagem".
- O painel de marca renderiza o parágrafo de destaque (buscar por trecho do texto, ex.
  `"Horas de máquina, ordens de serviço"`).
- Os testes já existentes (rodapé de versão, troca de tema, troca de lado, logo mobile) continuam
  passando sem alteração — nenhum deles depende do conteúdo do topo do painel.

## Fora de escopo

- Qualquer alteração no rodapé técnico (`HazardStripe`, "Sistemas operacionais", versão) — ele
  permanece exatamente como está.
- Qualquer alteração em `/admin` ou outras telas.
- Mudança de redação do texto de marca — reaproveita a redação já existente da versão antiga.
