# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.11.0] - 2026-07-02 - Retrofit

### Added
- `Apontamento` ganha `modalidade` ("seca" | "operada"), capturada ao iniciar o apontamento quando a OS vinculada não é `por_metro`, e `metros_executados`, capturado (obrigatório) ao finalizar quando a OS vinculada é `por_metro`
- `totalMetragemOS` deriva a metragem executada de uma OS a partir dos apontamentos finalizados vinculados, espelhando `totalHorasOS`

### Changed
- `OrdemServico.metragem_executada` deixa de ser um campo armazenado no cabeçalho — passa a ser **derivado** (soma de `apontamentos.metros_executados`), evitando o conflito multi-operador de um campo de header mutável
- Faturamento (`gerarItens`) agrupa horas de uma OS `hora_maquina` por **equipamento + modalidade** (lendo `modalidade` do apontamento) em vez de assumir sempre "operada"; um mesmo equipamento pode gerar dois itens (seca e operada) quando ambos ocorreram na mesma OS
- Geração de OS a partir de um orçamento não copia mais a metragem estimada para o cabeçalho da nova OS (o campo não existe mais); a estimativa continua visível no orçamento de origem

### Fixed
- Consolida os deltas pós-implementação registrados nos patches dos PRD-002, PRD-003 e PRD-004

## [0.10.0] - 2026-07-02 - Fuel

### Added
- Gestão de Diesel e Utilização (PRD-012): registro de abastecimentos (equipamento, litros, horímetro) com custo opcional (R$/litro ou total) — retaguarda-only
- Indicadores derivados de consumo médio (litros/hora) e utilização (horas trabalhadas no período) por equipamento, cruzando abastecimentos com apontamentos
- Nova rota `/admin/diesel` com KPIs, gráfico de consumo por equipamento e histórico de abastecimentos; item "Diesel" na sidebar da retaguarda, logo após "Manutenção"
- Ação secundária "Registrar abastecimento" na tela de detalhe do apontamento (`/app/apontamento/$id`) — apenas litros e horímetro, sem nenhum valor financeiro; sem novo item na bottom nav (permanece com 4 itens)
- `types` `Abastecimento`; mocks com 8 registros cobrindo litros alto, custo só por total (sem preço/litro), e equipamentos sem nenhum abastecimento

## [0.9.0] - 2026-07-01 - Seal

### Added
- Comprovante Assinado pelo Cliente (PRD-011): geração de comprovante a partir de uma OS fechada, com resumo do serviço (obra, período, equipamentos, horas ou metragem) — sem valores
- Captura de assinatura do cliente em tela (canvas, mouse/toque/caneta) com nome do assinante, ou registro de recusa com motivo
- Ciclo de status `pendente → assinado / recusado`; no máximo um comprovante por OS
- `types` `Comprovante`, `StatusComprovante`; mocks com edge cases (pendente, assinado, recusado com motivo, OS por metro)
- Nova rota `/admin/comprovantes` (lista + detalhe/assinatura); item "Comprovantes" na sidebar da retaguarda, logo após "Ordens de Serviço"
- Botão "Gerar comprovante" / link "Ver comprovante" na tela de detalhe da OS, quando fechada

## [0.8.0] - 2026-07-01 - Wrench

### Added
- Manutenção Preventiva por Horímetro (PRD-010): planos de manutenção por equipamento ou por tipo, com intervalo em horas
- Cálculo de status derivado do horímetro atual (`em_dia` / `proxima` / `vencida`), com antecedência de 20h para "próxima"
- Painel de alertas em `/admin/manutencao` listando equipamentos com manutenção próxima ou vencida
- Registro de manutenção realizada (horímetro do momento + custo/observação opcionais), reiniciando o ciclo do plano
- Indicador de manutenção visível no app do operador (seletor de equipamento e card de apontamento) — sem custo/valor
- `types` `PlanoManutencao`, `RegistroManutencao`, `StatusManutencao`; mocks com equipamento vencido, próximo e em dia
- Nova rota `/admin/manutencao` com abas Alertas e Planos; item "Manutenção" na sidebar da retaguarda

## [0.7.0] - 2026-06-30 - Cashflow

### Added
- Contas a Receber: geradas a partir dos faturamentos confirmados; dar baixa com data e forma de recebimento
- Contas a Pagar: registro manual com descrição, fornecedor, categoria, valor e vencimento; dar baixa com data
- Visão de Caixa: resumo de total a receber × total a pagar × saldo previsto
- Destaque de contas vencidas (em aberto com vencimento passado) nas listas
- Nova rota `/admin/financeiro` com abas A Receber, A Pagar e Caixa
- Coluna "Recebido" do pipeline de faturamento exibe dados reais de recebimentos liquidados

### Changed
- Pipeline executado → faturado → **recebido** completo com dados ao vivo
- Sidebar da retaguarda: novo item "Financeiro" após "Faturamento"

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
