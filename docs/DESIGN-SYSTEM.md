# Antonello Terraplanagem — Design System

> Referenciado pelo `CLAUDE.md` — que continua enxuto e só aponta para cá, do mesmo jeito que os PRDs referenciam o `CLAUDE.md`. Fonte única de verdade para tokens visuais, aplicação em componentes e padrões de UI dos dois ambientes.
>
> **Ancoragem:** este documento não propõe uma identidade nova — documenta o que já está implantado em produção (`antonello-terraplanagem.vercel.app`), fecha as lacunas que restaram (estados de tela, aplicação em componentes, diferenciação por superfície) e registra divergências encontradas entre o que foi especificado e o que o Lovable de fato gerou.

## Sobre

Identidade temática do mundo da obra: amarelo-máquina, terra escavada, aço e concreto. Um único par de tokens (claro/escuro) serve os dois ambientes — o que muda entre eles é a aplicação, não a paleta.

| Ambiente | Onde roda | Perfil |
|---|---|---|
| App do Operador (`/app`) | Celular, campo | Operador |
| Retaguarda (`/admin`) | Desktop, escritório | Recepção, proprietário |

---

## Tokens de Cor

Camada semântica — a única que o código deve referenciar. Nunca hex direto em componente.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `background` | `#F4EFE6` | `#16140F` | Fundo da página |
| `surface` | `#E8E2D5` | `#211D15` | Fundo secundário, seções |
| `card` | `#FFFFFF` | `#211D15` | Cards, popovers |
| `foreground` | `#1B1912` | `#F4EFE6` | Texto principal |
| `muted-foreground` | `#5A554A` | `#C8C1B0` | Texto secundário |
| `foreground-faint` | `#8C8678` | `#9AA1A8` | Texto terciário, placeholder |
| `primary` — amarelo-máquina | `#FFB300` | `#FFB300` | Ação primária, foco, marca |
| `primary-hover` | `#E09600` | `#FFC233` | Hover do primary |
| `secondary` — terra | `#A2622F` | `#C07B43` | Ação secundária |
| `steel` — aço | `#717A82` | `#9AA1A8` | Neutro frio, ícone inativo |
| `border` / `input` | `#D6CDBC` | `#2C2719` | Bordas, divisores, campos |
| `destructive` | `#B0341B` | `#E0533A` | Erro, exclusão, alerta crítico |
| `ring` | `#FFB300` | `#FFB300` | Anel de foco (acessibilidade) |
| `sidebar` | `#211D15` | `#16140F` | Sidebar da retaguarda — **fica escura nos dois temas** |
| `sidebar-foreground` | `#E8E2D5` | `#E8E2D5` | Texto da sidebar |

Não existe token de **sucesso** (confirmação, "concluído") — ver Perguntas em Aberto.

### Referência técnica (CSS)

```css
:root {
  --radius: .625rem;
  --font-display: "Archivo", system-ui, sans-serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --background: #f4efe6;
  --surface: #e8e2d5;
  --card: #ffffff;
  --card-foreground: #1b1912;
  --popover: #ffffff;
  --popover-foreground: #1b1912;
  --foreground: #1b1912;
  --muted: #e8e2d5;
  --muted-foreground: #5a554a;
  --foreground-faint: #8c8678;
  --primary: #ffb300;
  --primary-foreground: #1b1912;
  --primary-hover: #e09600;
  --secondary: #a2622f;
  --secondary-foreground: #f4efe6;
  --secondary-soft: #c07b43;
  --steel: #717a82;
  --steel-soft: #9aa1a8;
  --asphalt: #16140f;
  --asphalt-soft: #2c2719;
  --accent: #f4efe6;
  --accent-foreground: #1b1912;
  --destructive: #b0341b;
  --destructive-foreground: #f4efe6;
  --border: #d6cdbc;
  --input: #d6cdbc;
  --ring: #ffb300;
  --sidebar: #211d15;
  --sidebar-foreground: #e8e2d5;
  --sidebar-primary: #ffb300;
  --sidebar-primary-foreground: #16140f;
  --sidebar-accent: #2c2719;
  --sidebar-accent-foreground: #f4efe6;
  --sidebar-border: #2c2719;
  --sidebar-ring: #ffb300;
}

.dark {
  --background: #16140f;
  --surface: #211d15;
  --card: #211d15;
  --card-foreground: #f4efe6;
  --popover: #211d15;
  --popover-foreground: #f4efe6;
  --foreground: #f4efe6;
  --muted: #2c2719;
  --muted-foreground: #c8c1b0;
  --foreground-faint: #9aa1a8;
  --primary: #ffb300;
  --primary-foreground: #16140f;
  --primary-hover: #ffc233;
  --secondary: #c07b43;
  --secondary-foreground: #16140f;
  --secondary-soft: #a2622f;
  --steel: #9aa1a8;
  --steel-soft: #717a82;
  --asphalt: #16140f;
  --asphalt-soft: #2c2719;
  --accent: #2c2719;
  --accent-foreground: #f4efe6;
  --destructive: #e0533a;
  --destructive-foreground: #16140f;
  --border: #2c2719;
  --input: #2c2719;
  --ring: #ffb300;
  --sidebar: #16140f;
  --sidebar-foreground: #e8e2d5;
  --sidebar-primary: #ffb300;
  --sidebar-primary-foreground: #16140f;
  --sidebar-accent: #2c2719;
  --sidebar-accent-foreground: #f4efe6;
  --sidebar-border: #2c2719;
  --sidebar-ring: #ffb300;
}
```

---

## Tipografia

| Papel | Fonte | Pesos carregados | Uso |
|---|---|---|---|
| Display / headings | Archivo | 600, 700, 800, 900 | Títulos, números de destaque |
| Corpo | IBM Plex Sans | 400, 500, 600, 700 | Texto geral, labels, botões |
| Dados / mono | IBM Plex Mono | 400, 500, 600 | Horímetro, nº de OS, valores — alinhamento numérico |

Escala de tamanho: `text-xs` (12px) a `text-7xl` (72px), padrão Tailwind — sem necessidade de escala customizada.

## Espaçamento & Raio

| Token | Valor | Escala derivada |
|---|---|---|
| Espaçamento base | 4px | Múltiplos de 4 (padrão Tailwind) |
| Raio base (`--radius`) | 10px | `rounded-sm` 6px · `rounded-md` 8px · `rounded-lg` 10px · `rounded-xl` 14px |

## Sombras

Escala padrão Tailwind (`shadow-xs` a `shadow-xl`), sem elevação customizada. `shadow-sm`/`shadow` para cards; `shadow-lg`/`shadow-xl` reservado para overlays (modais, dropdowns, popovers).

---

## Aplicação em Componentes (shadcn/ui)

Como os tokens semânticos estão corretamente conectados, a maioria dos componentes herda a identidade automaticamente — não é necessário customizar componente a componente. Confirmados em uso no bundle: `sidebar`, `card`, `button`, `input`, `label`, `table`, `calendar`, `command` (cmdk), `tabs`, `accordion`, `dropdown-menu`, `popover`, `dialog`/`sheet`, `toast`, `charts` (recharts).

**Elemento próprio do projeto:** `.hazard-stripe` — a faixa diagonal amarelo/asfalto (sinalização de canteiro), herdada do mapa de funcionalidades:

```css
.hazard-stripe {
  background-image: repeating-linear-gradient(-45deg, var(--primary) 0 14px, var(--asphalt) 14px 28px);
}
```

Usar como assinatura visual pontual — divisores de seção, cabeçalhos de destaque — não em elementos de uso frequente, para não cansar a leitura.

**Exemplo de spec por estado — Button (primary):**

| Estado | Fundo | Texto | Nota |
|---|---|---|---|
| Default | `primary` | `primary-foreground` | |
| Hover | `primary-hover` | `primary-foreground` | |
| Focus | `primary` | `primary-foreground` | anel `ring`, 2px |
| Disabled | `primary` a 50% opacidade | `primary-foreground` | |

## Ícones

**Pendente de decisão** — ver Divergências Encontradas.

---

## Estados de Tela

| Estado | Padrão | Como |
|---|---|---|
| **Loading** | Skeleton, nunca spinner de página inteira | `Skeleton` do shadcn, tom `surface`/`muted`. Spinner pequeno só em ação de botão ("Salvando...") |
| **Empty** | Ícone + frase curta + CTA quando acionável | Texto em `muted-foreground`. No app do operador, 1 linha só — legibilidade sob sol |
| **Error** | Banner inline, nunca modal bloqueante | `bg-destructive/10` + `border-destructive/30` + `text-destructive` (já existe como utilitário) + ação de retry. Modal reservado para falha crítica/bloqueante |
| **Success** | A definir — depende do token de sucesso | Ver Perguntas em Aberto |

## App × Retaguarda — Diferenciação

| Aspecto | App do Operador (`/app`) | Retaguarda (`/admin`) |
|---|---|---|
| Alvo de toque | ≥ 44px (já em uso: `min-h-11`) | Padrão desktop |
| Contraste | Alto — evitar `foreground-faint` em texto crítico | Hierarquia normal — `faint` liberado para metadados |
| Densidade | Baixa — cards, não tabelas densas | Alta — tabelas, múltiplas colunas |
| Números (horímetro, OS) | `IBM Plex Mono`, tamanho grande | `IBM Plex Mono`, tamanho padrão |
| Sidebar | Não tem | Sempre visível, sempre escura |
| Financeiro | **Nunca aparece** (barreira do CLAUDE.md) | Aparece conforme perfil |

---

## Divergências Encontradas

Comparação entre o que foi especificado no kickoff/CLAUDE.md e o que está de fato implantado em produção:

| Item | Especificado | Implantado | Ação sugerida |
|---|---|---|---|
| Router | React Router | TanStack Router/Start | Confirmar se foi intencional — se não, ajustar CLAUDE.md ou pedir troca ao Lovable |
| Ícones | Iconify (`@iconify/react`) | lucide-react (padrão do shadcn) | Decidir: manter lucide (já implantado) ou trocar por Iconify (conforme CLAUDE.md) |
| Backend | Nenhum nesta fase (Frontend First) | Cliente Supabase já no bundle | Provavelmente boilerplate do Lovable — confirmar que não há chamada real ainda |

## Perguntas em Aberto

- [ ] Ícones: manter lucide-react ou trocar por Iconify?
- [ ] Router: TanStack foi escolha intencional ou deve voltar a ser React Router?
- [ ] Cor de sucesso: não existe token hoje. Proposta a validar — um verde terroso, ex. `#4C7A3F`, que mantém a paleta sóbria sem colidir com o amarelo-máquina (já ocupado como cor de ação/marca)
- [ ] Supabase no bundle: confirmar que é só boilerplate do Lovable, sem chamada ativa nesta fase

---

## Status de Implementação

| Campo | Valor |
|-------|-------|
| **Status** | ✅ Fundação implantada · Documento formaliza o que existe |
| **Ancorado em** | `antonello-terraplanagem.vercel.app` (deploy de produção, verificado) |
| **Data** | 09/07/2026 |

## Histórico

| Data | Versão | Alteração |
|------|--------|-----------|
| 09/07/2026 | v1 | Criação — tokens extraídos do deploy real; estados de tela, aplicação em componentes e diferenciação /app × /admin documentados; divergências de router/ícones/backend registradas |

---

**AILA - Sistemas Inteligentes**
