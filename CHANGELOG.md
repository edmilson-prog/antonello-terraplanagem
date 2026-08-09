# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.23.0] - 2026-08-09 - Watchtower

### Added
- Painel Operacional (aba "Operacional" do dashboard) refeito conforme o design system oficial (`ui_kits/retaguarda/DashboardOperacional`): grid de duas colunas — mapa do canteiro e manutenção preditiva à esquerda; ordens/horas, financeiro, contas a receber e atalhos à direita.
- Faixa de condições sobre o mapa com o clima da base da operação (Santo Ângelo/RS), consultado em runtime na Open-Meteo — API pública, sem chave, que recebe apenas coordenadas fixas. Falha de rede não derruba o mapa: a faixa só omite a parte de clima.
- Contagem de operadores em campo (apontamentos em andamento) na faixa do mapa.
- Coluna "Saúde" na manutenção preditiva: barra do percentual do intervalo do plano já consumido, colorida por status. A tabela agora lista também os planos **em dia**, não só os alertas — é a leitura de frota que o kit propõe.
- Faixas de vencimento em "Contas a receber por cliente": vencida, 0–15 dias, 16–30 dias e +30 dias (esta última não existe no mock, mas o dado real produz), com legenda que só mostra as faixas presentes.
- Atalhos completos do kit: Nova O.S., Novo orçamento, Novo cliente, Registrar abastecimento e Gerar relatório.
- Novas derivações puras (`manutencaoPreditiva`, `percentualCiclo`, `contasReceberPorClienteFaixas`) e o serviço de clima, com 17 testes novos.

### Changed
- Os cards de OS e horas viraram três tiles no formato do kit: **Abertas** (com as novas OS dos últimos 7 dias em barras), **Em andamento** (com a quebra em andamento/abertas/concluídas no mês) e **Horas apontadas** (com os apontamentos do último dia com movimento, por OS e operador).
- Cards financeiros (Executado, Faturado, Recebido) adotaram o mesmo tile, com a variação percentual ao lado do rótulo de comparação.
- O selo do mapa diz **"Posições ilustrativas"** em vez do "Ao vivo" do mock: as coordenadas dos equipamentos são fictícias (PRD-019 RF-003) e o selo original prometeria um rastreamento por GPS que o produto não tem.
- As barras de "novas OS por dia" passaram a usar a série real em vez da série decorativa — barras discretas rotuladas por dia devem bater com o dado; os sparklines financeiros seguem decorativos, como decidido no PRD-016.

### Removed
- `CardOsAbertas` e `CardHorasApontadas`, substituídos pelos três tiles de "Ordens e horas".

## [0.22.0] - 2026-08-09 - Lookout

### Added
- Dashboard da retaguarda (aba "Visão geral") refeito conforme o design system oficial (`ui_kits/retaguarda/screen-dashboard`): 4 KPIs-herói (Faturamento, Horas apontadas, OS em andamento, Saldo a receber) com variação vs. período anterior e sparkline, sobre um grid de dois blocos.
- Cards novos no dashboard, todos com dado real: **OS em andamento** (número, obra, cliente, horas acumuladas, data de abertura e status), **Apontamentos do dia** (operador, equipamento, horímetro inicial → final, horas e OS), **Frota** (situação operacional dos equipamentos ativos), **Vencimentos próximos** (contas a receber em aberto, vencidas no topo) e **Horas por semana** (barras das últimas 8 janelas de 7 dias, com média e pico).
- Faixa compacta de indicadores logo abaixo dos KPIs, preservando os números que o dashboard já mostrava e que não existem no novo desenho: Executado, Recebido, OS abertas, Fechadas no período, Contas vencidas/a vencer e Alertas de manutenção.
- Atalhos "Nova OS" e "Novo orçamento" promovidos para o cabeçalho da página.
- Novas derivações puras em `features/dashboard/derivacoes.ts` (`intervaloAnterior`, `serieEmBuckets`, `serieSemanalHoras`, `osAtivas`, `apontamentosDoDiaMaisRecente`, `vencimentosProximos`, `saldoAReceber`, entre outras), com 16 testes novos.

### Changed
- O filtro de período (hoje/semana/mês) saiu do corpo da página para o cabeçalho, no lugar da pílula estática do mock, e passou a alimentar também a variação percentual dos KPIs (comparando com a janela imediatamente anterior, de mesma duração).
- Blocos que não seguem o filtro de período (apontamentos do dia e horas por semana) são ancorados no apontamento finalizado mais recente, e rotulam a data exibida — evita card vazio quando a base não tem movimento recente.

### Removed
- Widgets antigos do dashboard (`WidgetOsPorStatus`, `WidgetHorasPeriodo`, `WidgetPipelineFinanceiro`, `WidgetContas`, `WidgetAlertasManutencao`, `WidgetAtalhos`), substituídos pelos KPIs e pela faixa de indicadores. Nenhum indicador foi perdido.

## [0.21.0] - 2026-07-10 - Ledger

### Added
- Importação completa dos 1066 clientes reais extraídos do ERP legado (FarolTI/`Gerencial.fdb`) para o Supabase, incluindo o histórico comercial (LTV, ticket médio, frequência de OS, curva ABC, primeira/última OS, recência) em novas colunas `legado_*` de `clientes` — snapshot congelado do legado, não recalculado ao vivo.
- Página de detalhe do cliente (`/admin/clientes/:id`), acessível clicando no nome na listagem: dados básicos, histórico do ERP legado (quando existir) e edição inline (sem modal).
- Paginação na listagem de Clientes, com seletor de itens por página (20/50/100).
- Logout na retaguarda: dropdown no badge do usuário (canto superior direito) com nome/perfil reais e opção "Sair".
- Tela de login em split-screen, com as duas variações do logo (fundo escuro/claro) e painel do formulário sempre no tema claro.

### Changed
- Store de `clientes` migrada de mock para Supabase real (mesmo padrão já aplicado a `equipamentos`), incluindo leitura anônima restrita a `id, nome` para o app do operador exibir o cliente na OS.
- Nomes de clientes, equipamentos e operadores normalizados para uppercase — no banco (dado existente) e ao digitar nos formulários de cadastro.
- Sidebar da retaguarda fixa (não rola mais junto com o conteúdo da página) e sem barra de rolagem visível.

### Security
- Nova policy `clientes_anon_select_ativos` + grant de coluna restrito a `id, nome` para o papel `anon` em `clientes` (mesma defesa em profundidade já usada em `operadores`) — CPF/CNPJ e telefone continuam fora do alcance do app do operador.

## [0.20.0] - 2026-07-08 - Ignition

### Added
- Backend real no Supabase: schema completo (23 tabelas) espelhando `src/shared/types/index.ts`, com RLS habilitada em todas.
- Autenticação da retaguarda (recepção/proprietário) via Supabase Auth (e-mail+senha), com perfil em `usuarios_retaguarda` e guarda de rota em `/admin/*`.
- Autenticação do operador por PIN (4 primeiros dígitos do CPF), sem passar pelo Supabase Auth — token opaco validado por função Postgres `SECURITY DEFINER` (`login_operador`/`logout_operador`), com guarda de rota dedicada em `/app/entrar`.
- Script `scripts/mocks-to-seed.ts` que gera `supabase/seed.sql` a partir dos mocks existentes — os dados mockados agora também populam o banco real.

### Changed
- `OPERADOR_LOGADO_ID` (placeholder hardcoded desde a Fase 2) substituído pela sessão real do operador em 7 arquivos.
- `CLAUDE.md`: fase do projeto sai de "Frontend First (mockado)" para Fase 4 (backend real).

### Security
- Migration `20260708100009_security_hardening.sql`: revoga o grant padrão de `SELECT` de `anon` nas 22 tabelas de `public` que não são `operadores` (defesa-em-profundidade — a RLS já bloqueava a leitura) e adiciona `alter default privileges` para blindar tabelas futuras contra o mesmo grant.

### Removed
- `src/shared/hooks/use-mock-session.ts` e o tipo `SessaoMock` — substituídos pela sessão real (Supabase Auth para retaguarda, token opaco para operador).

## [0.19.0] - 2026-07-07 - Copilot

### Added
- Suíte de IA Embarcada (PRD-019): camada de IA plugável (`src/features/ia/`) com providers mockados e determinísticos, cobrindo as 12 features do PRD em 4 grupos
- Captura inteligente em campo: OCR do horímetro consolidado na camada de IA (A1), detecção de anomalias em apontamentos com badge e confirmação na retaguarda (A2), apontamento por voz no fluxo de iniciar/finalizar (A3), OCR de cupom de abastecimento respeitando a barreira financeira (A4)
- Inteligência analítica: card de insight em linguagem natural no painel gerencial (B5), alerta de manutenção preditiva por anomalia de consumo de diesel (B6), barra "Perguntar à IA" no header da retaguarda com 9 perguntas de exemplo (B7), previsão de caixa 30/60/90 dias e risco de inadimplência por cliente em Financeiro e Gerencial (B8)
- Inteligência comercial: sugestão de itens de orçamento com IA a partir de obras semelhantes do histórico (C9), redação automática de observações de OS/faturamento e revisão do resumo do comprovante antes de gerar (C10)
- Atendimento e operação: página de configuração e simulador de conversa do chatbot WhatsApp para clientes (D11), copiloto de alocação de frota como aba de sugestão na abertura de nova OS (D12)
- Tudo mockado (fase Frontend First) — nenhuma chamada de rede real, nenhum provider de IA real; toda saída numérica deriva de funções/stores já existentes (RF-002)

## [0.18.0] - 2026-07-07 - Beacon

### Added
- Painel Operacional (PRD-019): segunda aba no Dashboard (`/admin`), ao lado da "Visão geral" existente (inalterada) — visão "comando central" com mapa real (Leaflet + OpenStreetMap, coordenadas fictícias dos equipamentos, cor por status), cards de OS abertas/horas apontadas/executado/faturado/recebido com mini-gráfico de tendência dos últimos 7 dias, gráfico de contas a receber por cliente (vencida × a vencer) e tabela de manutenção preditiva (horas restantes por horímetro)
- Atalhos rápidos na aba Operacional: Nova O.S., Novo cliente, Gerar relatório de rentabilidade
- Badge de variação % (vs mês anterior) nos 3 cards financeiros, reaproveitando `variacaoPercentual` (PRD-016)
- Traçado decorativo (mais "movimento") nas mini-tendências dos cards financeiros/horas e no gráfico de OS abertas — pedido explícito do usuário para uma visualização mais rica; isolado numa função pura e determinística que nunca altera os números reais exibidos
- Tudo derivado das funções já existentes (002/004/007/010/015) — nenhuma regra de custo, margem ou faturamento nova

### Changed
- `/admin` (Dashboard) reorganizado em abas ("Visão geral" / "Operacional"); comportamento e visual da Visão geral permanecem idênticos ao PRD-015

## [0.17.0] - 2026-07-06 - Radar

### Added
- Dashboard Gerencial (PRD-016): painel retaguarda-only em `/admin/gerencial` que consolida evolução de faturamento (com meta mensal de referência), receita × custo × margem, horas e utilização/consumo por equipamento, rankings de margem (equipamentos e obras, com prejuízo destacado) e pipeline executado → faturado → recebido, tudo derivado dos services existentes (004/007/012/013/014), sem nenhuma regra de custo/margem nova
- Filtro de período (mês / trimestre / ano / personalizado), com últimos 12 meses como padrão de abertura, e comparativo de variação % contra o período anterior
- Dois KPIs de topo comparados contra o período anterior: "Faturado no período" e "Margem no período (hora-máquina)", ambos com variação %
- Meta mensal de faturamento configurável (mockada via `localStorage`), exibida como linha de referência no gráfico de evolução
- Item "Painel Gerencial" na sidebar da retaguarda, no grupo Financeiro

### Changed
- Sidebar da retaguarda reorganizada em grupos (Operação, Cadastros, Comercial, Financeiro, Frota), conforme sempre previsto no `CLAUDE.md` — antes era uma lista plana de 15 itens
- Mocks de ordens de serviço, apontamentos e faturamentos enriquecidos com histórico de Jan a Mai/2026 (eq-001 e eq-002), necessário para o gráfico de evolução mensal

## [0.16.0] - 2026-07-05 - Messenger

### Added
- Aviso ao Cliente por WhatsApp (PRD-009): MVP mockado, multi-provedor (Evolution API, Evolution GO, WhatsApp Cloud API/Meta, OpenWA) — dispara um aviso simulado ao cliente quando uma Ordem de Serviço é fechada na retaguarda
- Nova entidade `AvisoWhatsApp` (lateral, não altera `OrdemServico`/`Cliente`), idempotente: no máximo um aviso por OS, validação de telefone do cliente antes do disparo
- Nova seção na tela de detalhe da OS (retaguarda) exibindo o status do aviso (enviado / falha por telefone inválido), provedor usado e preview da mensagem
- Nova seção "WhatsApp" na página "Integrações" (`/admin/integracoes`) com seletor de provedor padrão (persistido em `localStorage`), ao lado da seção de Gateway de Cobrança (PRD-008)
- Tudo mockado (fase Frontend First) — nenhuma chamada de rede real, nenhuma credencial; spec documenta o formato real de cada provedor como referência para a Fase 4

## [0.15.0] - 2026-07-05 - Gateway

### Added
- Gateway de Cobrança (PRD-008): MVP mockado, multi-provedor (Mercado Pago + Asaas) — emissão simulada de cobrança (boleto/PIX) a partir de uma Conta a Receber (PRD-007) e simulação do webhook de pagamento, com baixa automática reaproveitando `contasReceberStore.darBaixaReceber`
- Nova entidade `CobrancaGateway` (lateral, não altera `ContaReceber`), idempotente: sem duas cobranças pendentes simultâneas por conta, sem repagamento de cobrança já paga/cancelada
- Nova aba "Cobrança" em Financeiro → A Receber: badge de status + provedor, botão "Emitir Cobrança" (sem cobrança ainda) ou "Simular Pagamento" (cobrança pendente)
- Nova página "Integrações" (`/admin/integracoes`) com seletor de provedor padrão de gateway (persistido em `localStorage`), preparada para receber a configuração de WhatsApp do PRD-009
- Item "Integrações" na sidebar da retaguarda, após "Rentabilidade"
- Tudo mockado (fase Frontend First) — nenhuma chamada de rede real, nenhuma credencial; spec documenta o formato real de cada provedor como referência para a Fase 4

## [0.14.0] - 2026-07-03 - Compass

### Added
- Rentabilidade por Equipamento e Obra (PRD-014): painel retaguarda-only em `/admin/rentabilidade` — o topo da pirâmide analítica, cruza receita (Faturamento, PRD-004) com custo (custo/hora, PRD-013) em dois recortes
- Recorte **por equipamento**: receita atribuída via itens `hora_maquina` do faturamento (por equipamento), custo via `custoHoraEquipamento` (PRD-013), margem em R$ e %, ranking por margem, gráfico de barras e diálogo de detalhamento (composição de receita e custo)
- Recorte **por obra/OS**: receita = valor total do(s) faturamento(s) da OS, custo = soma do custo de cada equipamento usado na obra (custo/hora da companhia × horas específicas daquela OS), margem em R$ e %, ranking com destaque de prejuízo, gráfico e diálogo de detalhamento
- Navegador de mês de competência (reaproveitado do PRD-013), sinalização de "custo incompleto" (equipamento sem componente de custo ativo, propagada à obra) e "prejuízo" (margem negativa), estados vazios distintos por período sem faturamento
- Item "Rentabilidade" na sidebar da retaguarda, após "Custo da Hora" — último item do roadmap numerado (PRD-000 a PRD-014)

### Changed
- Seletor de mês (`SeletorMes`, `periodo-mensal.ts`) movido de `src/features/custo-hora/` para `src/shared/` — agora reaproveitado por `custo-hora` e `rentabilidade`

## [0.13.0] - 2026-07-02 - Meter

### Added
- Custo Real da Hora-Máquina (PRD-013): painel retaguarda-only em `/admin/custo-hora` que calcula o custo por hora de cada equipamento — fixos mensais (parcela FINAME, seguro) + variáveis por hora (material rodante, operador) + diesel (PRD-012) + manutenção (PRD-010), tudo dividido pelas horas trabalhadas no mês
- Detalhamento do custo por componente (sempre as 4 categorias, mesmo com valor zero) e comparação com o preço praticado (PRD-005), com a margem em R$ por hora
- Configuração de componentes de custo por equipamento (fixo mensal ou variável por hora), com CRUD completo (cadastrar, editar, inativar, reativar)
- Navegador de mês de competência (‹ Mês Ano ›), limitado a não ultrapassar o mês atual
- Sinalização de "configuração incompleta" (nenhum componente ativo) e "sem horas no período" (evita divisão por zero) — condições independentes, exibidas separadamente
- Item "Custo da Hora" na sidebar da retaguarda, após "Financeiro"

## [0.12.0] - 2026-07-02 - Cockpit

### Added
- Dashboard da retaguarda (`/admin`, PRD-015): widgets de OS por status (com navegação filtrada), horas apontadas no período, pipeline financeiro (executado → faturado → recebido, em R$), contas a vencer/vencidas, alertas de manutenção e atalhos (nova OS, novo orçamento)
- Filtro de período no dashboard (Hoje / Semana / Mês) — aplica-se aos widgets de OS, horas e pipeline financeiro; contas e alertas de manutenção são sempre a situação atual
- Início do operador (`/app`): apontamento em andamento em destaque (retomar/finalizar) ou CTA "Iniciar apontamento", lista de OS ativas, indicador agregado de itens pendentes de sincronização, atalho para registrar abastecimento — sem nenhum valor financeiro
- `apontamentoEmAndamentoDoOperador` deriva o apontamento em andamento de um operador a partir da lista de apontamentos, espelhando o padrão de `apontamentosDoOperador`

### Changed
- Ambas as home screens (`/admin` e `/app`) deixam de ser placeholders "em construção" — todos os dados são derivados dos services já existentes (PRD-002/003/004/007/010/012), sem contrato persistido novo

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
