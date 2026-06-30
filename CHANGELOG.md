# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.6.0] - 2026-06-29 - Quote

### Added
- Orçamentos na retaguarda (`/admin/orcamentos`, PRD-006): CRUD mockado de orçamentos montados a partir das tabelas de preço (PRD-005) — hora-máquina (operada/seca), por metro (estaca) e mobilização.
- Editor de rascunho: adicionar/remover itens, ajustar quantidade estimada e valor unitário (override de negociação), desconto e observação; cálculo do total em R$.
- Ciclo de status `rascunho → enviado → aprovado/recusado` com guardas (envio bloqueado em orçamento vazio; decisão só a partir de enviado) e validade (default +30 dias, sinalização de vencida).
- Handoff: orçamento aprovado gera uma OS pré-preenchida (cliente, obra, modelo de cobrança, diâmetro/metragem) e vincula `os_id` (PRD-003).
- `types` `Orcamento`, `OrcamentoItem`, `StatusOrcamento`, `TipoItemOrcamento`; mocks com edge cases (rascunho vazio, sem-preço, validade vencida, vinculado a OS).
- Item "Orçamentos" no menu da retaguarda (entre Preços e Faturamento).

## [0.5.0] - 2026-06-29 - Invoice

### Added
- Faturamento ao fechar OS (PRD-004): geração de fatura em rascunho a partir de OS fechada, aplicando preços (hora-máquina operada/seca e por metro) às horas/metros apontados.
- Aba **Faturas** em `/admin/faturamento`: pipeline executado → faturado → recebido*, lista "Aguardando faturamento" com geração e lista de faturas com filtros.
- Editor de rascunho: ajuste de itens (quantidade, valor, seca/operada), inclusão de mobilização, desconto e observação; confirmação `rascunho → faturado` com aviso de pendência.
- Detalhe da fatura em `/admin/faturamento/$faturamentoId`.
- Sinalização de item "sem preço" (tarifa inativa/ausente) sem bloquear o restante do rascunho.
- `types` `Faturamento`, `FaturamentoItem`, `StatusFaturamento`, `TipoItemFaturamento`; mocks coerentes com OS/apontamentos/preços.

### Changed
- `/admin/faturamento` reorganizado em abas: **Faturas** (operacional) e **Análise** (o dashboard de gráficos, agora aba).

\* "recebido" é estágio futuro (PRD-007).

## [0.4.0] - 2026-06-29 - Worksite

### Added
- Ordem de Serviço colaborativa nos dois ambientes: lista + detalhe do operador
  ("Minhas OS", apontamentos dos colegas, "Apontar nesta OS") e retaguarda (lista,
  criar, detalhar, fechar, editar).
- Total de horas e status efetivo derivados dos apontamentos; numeração automática
  `OS-AAAA-NNNN`; modelo de cobrança hora-máquina/por-metro.
- Regra de fechamento: exclusivo da retaguarda, bloqueado com apontamento em andamento.

### Changed
- Modelo de OS migrado de `OrdemServicoOperador` (turno único por operador) para
  `OrdemServico` colaborativa; apontamentos (PRD-002) passam a vincular às novas OS,
  e o seletor de OS do apontamento aceita pré-preenchimento via `?os=`.

### Removed
- Modelo de OS legado (`OrdemServicoOperador`, store e mock do operador) e fluxo de
  "Iniciar turno / Finalizar OS" com horímetro direto na OS.

## [0.3.0] - 2026-06-28 - Tariff

### Added
- Tabela de preços na retaguarda (`/admin/precos`) com três abas: hora-máquina
  (valor seca/operada, vínculo por equipamento ou por tipo), por metro (fundação,
  por diâmetro de broca) e mobilização/transporte.
- Tipos de contrato `PrecoHoraMaquina`, `PrecoFundacao`, `PrecoMobilizacao`.
- Componente de entrada monetária `CurrencyInput` (máscara R$, 2 casas) e
  formatador `formatBRL`/`brlExato`.
- CRUD em memória com soft-delete (inativar/reativar) e validação de valores
  positivos.

### Security
- Barreira financeira: nada de `features/precos` é importado pelo ambiente do
  operador (`/app/*`); valores de preço nunca são carregados no app de campo.

## [0.2.0] - 2026-06-28 - Tally

### Added
- Apontamento de horímetro no app do operador (`/app/apontamento`): iniciar
  (seleção de equipamento + horímetro inicial), finalizar (horímetro final com
  cálculo automático de horas) e lista "Meus apontamentos" (em andamento +
  recentes) — PRD-002.
- Captura de horímetro compartilhada (`HorimetroCapture`) com digitação manual
  e leitura por foto via camada de OCR simulada, isolada e plugável.
- Indicador visual "pendente de sincronização" (afford. de offline; engine real
  fica para o PRD-000/003).
- Store dedicado de apontamentos em memória e validações (zod) da captura.
- Testes unitários (vitest): cálculo de horas, transições do store, schemas,
  OCR simulado e sanidade dos mocks.

### Changed
- Contrato de `types` estendido com `Apontamento` e `StatusApontamento`.
- Formatador compartilhado `formatDataHora` adicionado.

## [0.1.0] - 2026-06-28 - Registry

### Added
- Cadastro de Equipamentos com busca, filtros por tipo e status operacional,
  criação/edição e inativação (soft-delete) — PRD-001.
- Cadastro de Operadores com busca e inativação.
- Cadastro de Clientes com validação de CPF/CNPJ e busca por nome/documento.
- Kit de CRUD compartilhado: store em memória genérico, lista responsiva
  (tabela ↔ cards), diálogos de formulário e confirmação, e envelope de
  estados (loading/empty/error/success).
- Testes unitários (vitest) para a lógica pura: store, validadores e formatadores.
- Ícones de aplicação via Iconify e toasts via sonner.

### Changed
- Contrato de `types` estendido (Equipamento/Operador/Cliente) com status de
  ciclo de vida (`ativo`) separado do status operacional, documento, telefone
  e timestamps de auditoria. Mocks atualizados com edge cases.

### Fixed
- Links de "voltar" do app do operador passam os parâmetros de busca exigidos
  pela rota (type-check).
