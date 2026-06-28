# Prompt de Kickoff — Lovable
## Plataforma de Gestão · Antonello Terraplanagem

> **Como usar:** cole o bloco abaixo (de `[CRÍTICO — LEIA PRIMEIRO]` até o fim) como **primeiro prompt** do projeto no **Builder Mode** do Lovable.
> Ele cria só a fundação navegável — design system, os dois ambientes de navegação, o login que roteia por perfil e telas-placeholder vazias. **As funcionalidades entram depois, uma por vez**, em prompts incrementais.

---

[CRÍTICO — LEIA PRIMEIRO]
Este é o prompt de fundação. NÃO conecte backend (nem Supabase, nem Lovable Cloud) nesta etapa — o projeto está em fase **Frontend First** com dados **mockados**. NÃO implemente regras de negócio nem features completas agora: apenas a estrutura navegável, o design system e telas-placeholder vazias.

[CONTEXTO]
Estamos construindo a **"Plataforma de Gestão Antonello Terraplanagem"**, um sistema de retaguarda + app de campo para uma empresa de terraplanagem (movimentação de terra, escavação, fundação/estaqueamento).

A dor central: hoje o controle de horas dos equipamentos, das ordens de serviço e da cobrança é feito **no papel**, o que atrasa o faturamento e impede enxergar a rentabilidade por máquina e por obra.

A plataforma tem **dois ambientes (surfaces)** no mesmo projeto, separados por rota e layout, mas compartilhando os mesmos `types` (o contrato de dados):

1. **App do Operador** (campo) — usado no **celular** pelos operadores de máquina. Mobile-first, toque grande, alta legibilidade sob sol. Serve para apontar horímetro e abrir/fechar ordens de serviço. **NUNCA exibe valores, preços ou dados financeiros.**
2. **Retaguarda** (escritório) — usada no **desktop** pela recepção e pelo proprietário. Web responsiva com sidebar e tabelas. Serve para completar os registros, gerenciar cadastros e faturar.

Três perfis de usuário: **operador** (campo), **recepção** (escritório) e **proprietário/admin** (tudo, inclusive financeiro).

[OBJETIVO]
Criar **APENAS** a fundação navegável do projeto:
- O **design system** (tokens de cor, tipografia, dark mode).
- A **estrutura de navegação** dos dois ambientes (shells/layouts).
- A **tela de entrada** (login) que direciona por perfil (mockado).
- **Telas-placeholder vazias** para cada área principal (sem features, só o esqueleto e um empty state).

[ESPECIFICAÇÃO]

**Stack**
- React + TypeScript + Tailwind CSS + shadcn/ui + React Router.
- **Sem backend** nesta etapa. Todo dado vem de mocks em `src/mocks/` (estrutura em `snake_case`, espelhando o schema futuro do banco).
- Organização de pastas feature-based: `src/features/`, `src/shared/`, `src/mocks/`.
- Idioma da interface: **português brasileiro**.

**Design System** (centralizar tudo em tokens — Tailwind config / CSS variables; nada de cor ou fonte hardcoded)
Identidade temática do mundo da obra: amarelo-máquina, terra escavada, aço e concreto.

Cores (modo claro como padrão):
- Amarelo-máquina (primária / ação): `#FFB300` · hover `#E09600`
- Terra (secundária / ocre): `#A2622F` · suave `#C07B43`
- Aço (neutro frio): `#717A82` · suave `#9AA1A8`
- Asfalto (escuros): `#16140F`, `#211D15`, `#2C2719`
- Concreto (fundos claros): `#E8E2D5`, `#F4EFE6` · linha `#D6CDBC`
- Tinta (texto): `#1B1912` · suave `#5A554A` · fraco `#8C8678`

Tipografia:
- Display / headings: **"Archivo"** (pesos 600–900)
- Corpo: **"IBM Plex Sans"** (pesos 400–700)
- Dados / números (horímetro, nº de OS, valores): **"IBM Plex Mono"** (pesos 400–600) — fonte mono para os números ficarem alinhados e legíveis

Dark mode: **obrigatório**, com toggle no header e persistência da preferência. No App do Operador, priorizar **alto contraste** (uso sob sol forte em campo).

Assinatura visual: uma **faixa de sinalização de canteiro** (listras diagonais amarelo/asfalto) como detalhe de marca no topo do cabeçalho.

Ícones: usar a biblioteca padrão de ícones de forma consistente em todo o app.

**Estrutura de rotas e navegação**

Entrada:
- `/login` — tela de acesso única. Por enquanto **mock**: ao "entrar", a escolha de um perfil (operador / recepção / proprietário) redireciona para o ambiente certo. Sem autenticação real.

Ambiente **Operador** (mobile-first, **bottom navigation**, alvos de toque ≥ 44px):
- `/app` — Início (resumo do dia)
- `/app/apontamento` — Apontamento (placeholder do check-in / horímetro)
- `/app/ordens` — Minhas OS
- `/app/perfil` — Perfil

Ambiente **Retaguarda** (desktop com **sidebar** + header com breadcrumbs; no mobile, menu hambúrguer):
- `/admin` — Dashboard (placeholder de visão geral)
- `/admin/ordens` — Ordens de Serviço
- `/admin/equipamentos` — Equipamentos
- `/admin/clientes` — Clientes
- `/admin/operadores` — Operadores
- `/admin/faturamento` — Faturamento

**Cada rota acima é só um placeholder** por enquanto: título da página + um empty state ("Em construção" — ilustração/ícone + texto). Nenhuma lógica de negócio, nenhum formulário funcional, nenhuma tabela com dados reais.

**Mocks iniciais** (apenas o suficiente para a navegação parecer viva — em `src/mocks/`, em `snake_case`):
- `equipamentos` — ~6: escavadeira 18t, escavadeira 10t, escavadeira 5t, carregadeira, caçamba, trator de esteira. Campos: `id`, `nome`, `tipo`, `capacidade`, `horimetro_atual`, `status`.
- `operadores` — ~4. Campos: `id`, `nome`, `ativo`.
- `clientes` — ~3. Campos: `id`, `nome`.
- Incluir edge cases: um nome longo, e prever que uma lista pode ficar vazia.

Definir os **types** (interfaces) antes dos mocks — eles são o contrato que o backend futuro vai implementar.

**Responsividade**
- Mobile-first em tudo. O Operador é prioritariamente mobile; a Retaguarda é prioritariamente desktop, mas precisa funcionar no mobile.
- Validar em 375px, 768px e 1280px.

[CONSTRAINTS — o que NÃO fazer]
- NÃO conectar Supabase nem Lovable Cloud. Frontend First, só mocks.
- NÃO implementar features reais (apontamento, CRUD, faturamento). Só shells + placeholders nesta etapa.
- **NUNCA exibir preço, valor ou qualquer dado financeiro no Ambiente Operador** — restrição comercial rígida.
- NÃO hardcodar cores nem fontes: tudo via tokens (Tailwind config / CSS variables).
- NÃO criar dezenas de componentes de uma vez — manter enxuto e organizado por feature.
- Interface 100% em português brasileiro.

[IMPORTANTE — LEMBRETE FINAL]
Reforçando: esta etapa entrega **só a fundação navegável** — o design system, os dois shells de navegação, o login que roteia por perfil e telas-placeholder vazias. Sem backend, sem features, sem dados financeiros no app do operador. As funcionalidades virão em prompts incrementais depois.
