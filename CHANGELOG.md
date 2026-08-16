# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.27.0] - 2026-08-16 - Levers

### Added
- **Parâmetros da plataforma, as duas telas do UI kit.** `/admin/parametros` mostra os parâmetros em cards de leitura; `/admin/parametros/editar` edita, com navegação por seção, contador de campos alterados por seção, diff "antes → depois" antes de salvar e card de registro (última alteração, autor, versão). Fecham as linhas 33–34 do roadmap do UI kit.
- Tabela `parametros` (linha única, garantida por índice) com as 6 seções do kit: Empresa, Operação, Custos & preços, Faturamento, Integrações e Acesso & segurança. Os defaults seguem o comportamento real do sistema, não os valores ilustrativos do mock — criar a tabela não muda o comportamento de nada.
- Histórico de alterações (`parametros_historico` + diálogo agrupado por versão): quem mudou o quê, de qual valor para qual. As linhas são gravadas por trigger no banco, então nenhuma alteração escapa do registro — inclusive as feitas fora da tela.
- Selo **"só cadastro"** nos parâmetros que o kit desenha mas o produto ainda não consulta. Mesma postura do selo "Posições ilustrativas" do Painel Operacional (0.23.0): quando o mock promete um controle que não existe, a tela diz isso em vez de copiar o rótulo.

### Changed
- **Quatro parâmetros deixaram de ser constante hardcodada e passaram a valer de verdade:** antecedência do alerta de manutenção (era `ANTECEDENCIA_HORAS_PADRAO = 20`), margem mínima e o alerta de margem baixa em Preços (era `MARGEM_MINIMA_PADRAO = 0.3`), horas/mês de referência do rateio de custo fixo (era o `160` embutido em `custoEstimadoHoraEquipamento`) e a forma de recebimento padrão do diálogo de baixa. Cada leitura mantém a constante antiga como fallback, para o intervalo antes da store carregar.
- **`/admin/integracoes` foi absorvida pela seção Integrações de Parâmetros** e saiu da sidebar, que ganhou "Parâmetros" no lugar. Os provedores de gateway e de WhatsApp e o painel de conexão WAHA continuam funcionando como antes — mudou o lugar onde aparecem, não a lógica.
- `DataRow` (linha ícone + rótulo + valor dos cards de leitura) foi para `shared/components`, em vez de mais uma cópia local por feature.

### Security
- As três funções novas do banco nascem com `search_path` fixo e sem `EXECUTE` para `anon`/`authenticated` — revogado também de `PUBLIC`, que é o que faltava nas trigger functions de versões anteriores. Auditado com `has_function_privilege` antes e depois.
- `parametros_historico` é somente leitura para a retaguarda: as linhas vêm do trigger `SECURITY DEFINER`, nunca do cliente.

### Notas
- `jornada_horas` fica marcada como "só cadastro": ela só é usada no app do operador (pré-preenche o horímetro final), e o app não enxerga a tabela `parametros` — a RLS é de retaguarda. Ligá-la exige expor o valor por uma RPC de operador.
- A "Chave de API" do mock não virou campo: sem uma API real para autenticar, o input só serviria para alguém colar um segredo em texto claro numa tabela que toda a retaguarda lê.

## [0.26.0] - 2026-08-12 - Handshake

### Added
- **O App de Campo passa a enxergar e gravar dados reais.** Quatro RPCs `SECURITY DEFINER` que recebem o token da sessão por PIN — `listar_ordens_operador`, `listar_apontamentos_operador`, `iniciar_apontamento` e `finalizar_apontamento` — no mesmo contrato já usado pelo login e pelas notificações (PRD-020). Nenhuma policy de escrita foi aberta para `anon` em tabela de negócio.
- Índices `idx_apontamentos_operador_id`, `idx_apontamentos_os_id` e `idx_ordens_servico_responsavel_id`, que sustentam os filtros dessas funções.
- Idempotência de apontamento conforme o ADR-001: o id é gerado no cliente e serve de `opId`. Reenviar a abertura não duplica horas; refechar com o mesmo horímetro é no-op bem-sucedido, e com horímetro diferente é recusado como conflito de leitura.

### Changed
- **`apontamentos` deixa de ser mock e passa a viver no banco** — foi o último store do fluxo de campo ainda alimentado por `src/mocks/`. O store ganhou dois caminhos por trás da mesma API: a retaguarda lê a tabela sob a sessão do Supabase Auth; o app de campo lê e escreve pelas RPCs por token. `ordensStore` seguiu o mesmo desenho na leitura.
- Abrir e encerrar apontamento agora são operações assíncronas contra o servidor, com estado de "Encerrando…" no botão e erro na tela em vez de sucesso presumido.
- `pendente_sync` passa a dizer a verdade: o que o servidor aceitou volta marcado como sincronizado.
- Entrar e sair recarregam OS e apontamentos. O aparelho é compartilhado — ao sair, o cache esvazia, e o operador seguinte não herda as OS de quem usou antes.

### Fixed
- **O operador via zero OS em produção.** `ordens_servico` e `apontamentos` só tinham policy para `authenticated`; como o app roda com a anon key e RLS sem policy que case devolve lista vazia em vez de erro, as telas de campo apareciam vazias sem nenhum sinal de erro.
- A metragem executada e as fotos do apontamento, que antes só existiam em memória, agora persistem.
- **"permission denied for table ordens_servico" ao trocar de tela, que só sumia com F5.** Os stores disparavam a carga no import do módulo, e o bundle não tem code-splitting: todos rodavam no boot de qualquer rota — inclusive a landing pública, a tela de login e o app de campo, onde não há sessão da retaguarda. Sem sessão, o supabase-js manda a anon key, e as tabelas de negócio só têm GRANT SELECT para `authenticated`: 42501, que o PostgREST devolve como 401. Como nenhum login recarrega a página, o erro ficava congelado na tela até o usuário recarregar. A carga passa a ser condicionada à credencial e refeita quando ela muda (`src/lib/credencial.ts`).
- A landing pública deixa de disparar seis consultas a tabelas de negócio a cada visita.

### Security
- **As funções internas do banco não estavam protegidas de verdade.** As migrations usavam `revoke all on function ... from public`, que no Supabase não tem efeito: o projeto vem com `alter default privileges ... grant all on functions to anon, authenticated`, então toda função em `public` nasce com EXECUTE concedido explicitamente a essas roles, e revogar de PUBLIC não mexe nisso. Na prática, qualquer visitante com a anon key podia chamar `criar_operador` (criar operador com CPF, sem autenticação), `criar_notificacao_interna` (notificar qualquer operador, pulando a checagem de `criar_notificacao`) e as rotinas agendadas. Revogado explicitamente de `anon` e `authenticated`.
- A superfície que a role `anon` alcança passa a ser exatamente a API do app de campo: 11 funções, das quais 10 exigem e validam o token da sessão, mais `login_operador` (que exige operador e PIN). Verificado executando como `anon`: as RPCs públicas respondem, as internas devolvem `permission denied`.

### Notes
- As telas da retaguarda que somam horas (Dashboard, Rentabilidade, Faturamento, Painel Gerencial, Custo da Hora) passam a refletir a tabela real, hoje vazia — os ~30 apontamentos que apareciam ali eram do mock e referenciavam equipamentos e OS que não existem no banco. Os números voltam a crescer conforme os operadores apontam.

## [0.25.0] - 2026-08-11 - Toolbelt

### Added
- **App de Campo (`/app/*`) inteiro portado para o UI kit oficial** (`ui_kits/app-campo` do Claude Design, lido via DesignSync): as 23 telas do protótipo, em três ondas. A tela de login saiu antes, sozinha, pelo PR #19.
- Primitivas do kit como componentes tipados em `features/operador/components/kit` (superfície, ações, formulário e estados de tela) — as classes `ac-*`/`atp-*` do protótipo deixam de ser copiadas tela a tela.
- Telas novas: **Sincronização**, **Minha escala**, **Espelho de horas**, **Ficha do equipamento**, **Mapa da obra**, **Segurança**, **Checklist de pré-uso**, **Diário de obra (RDO)**, **Paralisação**, **Viagens de basculante**, **Mobilização / prancha**, **Solicitar manutenção** (lado operador) e **Assinatura da medição** em campo.
- Alertas de segurança derivados de risco real: máquina em manutenção alocada a uma OS ativa do operador, plano de manutenção vencido/próximo e checklist de pré-uso reprovado. A ciência de cada alerta fica registrada.
- Fila local dos registros de campo (`features/registros-campo`), primeiro estágio do ADR-001: cada registro nasce com `op_id` e `pendente_sync`, sobrevive a fechar o app e aparece na tela de Sincronização.
- Novas derivações puras com teste: `features/apontamento/resumo-horas.ts` (horas por dia/mês/OS/semana), `features/operador/notificacoes.ts`, `features/operador/alertas-seguranca.ts` e `features/registros-campo/derivacoes.ts`.
- Tokens `surface-2`, `border-soft`, `primary-deep`, `primary-dim`, `success` e `info` nos três escopos de tema.

### Changed
- **Notificações (PRD-020, 0.23.0) ganham a roupa do kit sem trocar de motor:** a tela e o store continuam sendo os do PRD-020 (tabela `notificacoes` + RPCs por token + Web Push). O que mudou é onde o sino mora — agora no cabeçalho da aba "Hoje", como no protótipo. O ciclo de vida (service worker, reinscrição de push, reconsulta periódica) foi extraído para `useCicloNotificacoes` e montado no shell, para continuar vivo em todas as telas mesmo com o sino fora do cabeçalho global.
- **Bottom nav do app do operador passa a seguir o kit:** `Hoje · Minhas OS · Abastecer · Perfil` (era `Início · Apontamento · Minhas OS · Perfil`). A barra some nas sub-telas, que ocupam a tela inteira e voltam pelo cabeçalho — como no protótipo.
- Cabeçalho global do app sai do shell: cada tela desenha o seu (`ac-head` nas abas, `ac-form-head` nas sub-telas). O toggle de tema, obrigatório pelo CLAUDE.md, passa a viver no Perfil.
- Apontamento vira o fechamento do turno no padrão do kit (stepper de 0,5 h partindo de +8 h), com leitura do horímetro por foto ao lado do stepper. A observação escrita no fechamento agora é realmente gravada.
- Progresso da OS no app é `minhas horas x horas da equipe` — a OS não tem previsão de horas no schema, e essa leitura é a que faz sentido numa OS colaborativa.
- Abastecer vira aba, com o equipamento do apontamento em andamento pré-selecionado; o diálogo com OCR de cupom continua acessível de dentro do apontamento.

### Removed
- Aba "Apontamento" e a lista `ApontamentosPage`: `/app/apontamento` redireciona para o Histórico, que passou a mostrar também o apontamento em aberto. Nada de funcionalidade foi perdido.

### Notes
- Os oito registros de campo ainda **não têm tabela no Supabase**. O app do operador roda como `anon`, que hoje não enxerga nem `ordens_servico` — o acesso do operador depende de RPCs por token (padrão de `login_operador` / `operador_do_token`), ainda não escritas para leitura de OS nem para escrita de registros. Até lá os registros ficam no aparelho, e o contrato em `features/registros-campo/tipos.ts` é o que as tabelas vão implementar.
- Onde o kit depende de dado que o sistema não tem, a tela mostra o limite em vez de inventar: o mapa da obra cai no fallback previsto pelo próprio kit (sem lat/lon na OS) mas abre a rota no GPS pelo endereço; as viagens não exibem trajeto/jazida; e o DDS aparece com estado vazio, explicando que a retaguarda ainda não publica o tema do dia.
## [0.24.0] - 2026-08-09 - Watchtower

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

## [0.23.0] - 2026-08-09 - Klaxon

### Added
- **Central de notificações no app de campo** (`/app/notificacoes`, PRD-020), fiel ao kit `ui_kits/app-campo` (tela `notif`): sino com badge no cabeçalho, lista agrupada por Hoje / Ontem / data, ícone-tile por tipo de aviso, ponto de não lida, "Marcar lidas" e deep link para a OS quando houver.
- **Web Push**: o celular do operador avisa mesmo com o app fechado. Tabela `push_subscriptions` (uma linha por aparelho), trigger em `notificacoes` que chama a Edge Function `enviar-push` via `pg_net`, e assinatura VAPID na função — que ainda remove inscrições mortas (404/410).
- **PWA do app de campo**: `manifest.webmanifest`, service worker estático em `public/sw.js` (só push e clique na notificação — não intercepta `fetch`) e ícones gerados por `scripts/gerar-icones-pwa.js`. Feito sem `vite-plugin-pwa`, porque o `vite.config.ts` proíbe plugins manuais.
- Tabela `notificacoes` com RLS ligada e **sem policy para `anon`**: o acesso do operador passa por RPCs `SECURITY DEFINER` que recebem o token da sessão como parâmetro (`listar_notificacoes`, `marcar_notificacoes_lidas`, `registrar_push_subscription`, `remover_push_subscription`), no mesmo contrato de `login_operador`.
- Cinco produtores de aviso ligados a fluxos reais: **nova OS atribuída** (trigger em `ordens_servico.responsavel_id`), **apontamento aprovado** (ao fechar a OS na retaguarda, um aviso por operador com o total de horas dele), **abastecimento registrado** (diálogo do operador), **manutenção agendada** (cadastro de plano, avisa quem opera o equipamento) e **lembrete de apontamento** (job `pg_cron` diário às 17h).
- Leitura offline: a lista abre sem sinal com o que já havia chegado, e o "marcar lidas" feito offline entra numa fila local que sobe ao reconectar — sem a notificação "voltar a ser nova" no meio do caminho.
- Controle de avisos no Perfil, com atalho para a central e instrução específica para iPhone (no iOS, Web Push exige instalar o app na tela inicial).

### Changed
- Sair do app agora remove a inscrição de push e apaga o cache local de notificações — aparelho de campo é compartilhado, e o próximo operador não pode receber aviso nem ver histórico do anterior.

### Security
- `registrar_notificacao_propria` deriva o destinatário do token e restringe o tipo a `abastecimento_registrado`: sem isso, a chave `anon` (que é pública) permitiria disparar notificação arbitrária para qualquer operador.

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
