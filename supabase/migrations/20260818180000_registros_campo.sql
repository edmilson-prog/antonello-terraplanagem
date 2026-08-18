-- Registros de campo (Onda 22): os oito fatos que o operador anota na obra.
--
-- Até aqui eles viviam SÓ no localStorage do aparelho. O comentário no topo de
-- `tipos.ts` era honesto sobre isso ("NENHUM deles tem tabela no Supabase
-- ainda"), mas o efeito prático era grave: checklist de pré-uso, diário de
-- obra, paralisação, viagens, transporte de prancha, solicitação de manutenção,
-- medição assinada pelo cliente e ciência de segurança nunca chegavam ao
-- escritório. Limpar os dados do navegador ou trocar de aparelho apagava tudo,
-- inclusive a assinatura do cliente.
--
-- MODELO: uma tabela com `tipo` + `dados jsonb`, espelhando a união
-- discriminada de `DadosRegistroCampo`. Oito tabelas seriam mais rígidas e bem
-- mais peso para o valor — o CHECK abaixo recupera a validação que o jsonb
-- perderia, exigindo por tipo as mesmas chaves que o TypeScript exige.
--
-- `op_id` é a chave de idempotência do ADR-001: o flush pode reenviar o mesmo
-- registro à vontade depois de reconectar, que o UNIQUE recusa a duplicata.

create table if not exists public.registros_campo (
  id uuid primary key,
  -- Dedup do flush offline (ADR-001). Separado do `id` de propósito: o
  -- contrato do app já nomeia os dois, e um id de linha e uma chave de
  -- operação são coisas diferentes mesmo quando nascem juntas.
  op_id uuid not null unique,
  tipo text not null check (tipo in (
    'checklist', 'diario_obra', 'paralisacao', 'viagens',
    'mobilizacao', 'solicitacao_manutencao', 'medicao_assinada',
    'ciencia_seguranca'
  )),
  operador_id uuid not null references public.operadores (id) on delete restrict,
  os_id uuid references public.ordens_servico (id) on delete set null,
  equipamento_id uuid references public.equipamentos (id) on delete set null,
  dados jsonb not null,
  -- A assinatura do cliente fica FORA do jsonb por duas razões. É dado pessoal
  -- (LGPD) e merece coluna própria para que uma política de retenção futura
  -- possa apagá-la sem tocar no resto do registro; e é um data URL de canvas
  -- com dezenas de KB, que numa coluna separada não é arrastado por toda
  -- listagem que só quer saber quem assinou e quando.
  assinatura text,
  registrado_em timestamptz not null default now(),
  created_at timestamptz not null default now(),

  -- Só a medição carrega assinatura, e ela não existe sem assinatura.
  constraint registros_campo_assinatura_check check (
    (tipo = 'medicao_assinada' and assinatura is not null)
    or (tipo <> 'medicao_assinada' and assinatura is null)
  ),

  -- As mesmas chaves que cada variante de `DadosRegistroCampo` exige no
  -- TypeScript. `jsonb_exists` em vez do operador `?` para não depender de
  -- como cada cliente SQL trata a interrogação.
  constraint registros_campo_dados_check check (
    case tipo
      when 'checklist' then
        jsonb_exists(dados, 'itens') and jsonb_exists(dados, 'nao_conformes')
      when 'diario_obra' then
        jsonb_exists(dados, 'clima_manha') and jsonb_exists(dados, 'clima_tarde')
        and jsonb_exists(dados, 'equipe') and jsonb_exists(dados, 'atividades')
      when 'paralisacao' then
        jsonb_exists(dados, 'motivo') and jsonb_exists(dados, 'duracao_horas')
      when 'viagens' then
        jsonb_exists(dados, 'material') and jsonb_exists(dados, 'viagens')
        and jsonb_exists(dados, 'capacidade_m3')
      when 'mobilizacao' then
        jsonb_exists(dados, 'tipo') and jsonb_exists(dados, 'km')
        and jsonb_exists(dados, 'trajeto')
      when 'solicitacao_manutencao' then
        jsonb_exists(dados, 'problema') and jsonb_exists(dados, 'urgencia')
      when 'medicao_assinada' then
        jsonb_exists(dados, 'responsavel') and jsonb_exists(dados, 'horas_periodo')
      when 'ciencia_seguranca' then
        jsonb_exists(dados, 'alerta_id') and jsonb_exists(dados, 'titulo')
    end
  )
);

create index if not exists idx_registros_campo_os_id
  on public.registros_campo (os_id);
create index if not exists idx_registros_campo_operador_id
  on public.registros_campo (operador_id);
create index if not exists idx_registros_campo_equipamento_id
  on public.registros_campo (equipamento_id);
-- A retaguarda lista por tipo e por data (a solicitação de manutenção mais
-- recente é a que interessa na tela de Manutenção).
create index if not exists idx_registros_campo_tipo_registrado_em
  on public.registros_campo (tipo, registrado_em desc);

alter table public.registros_campo enable row level security;

-- Mesmo desenho de `abastecimentos` e `registros_manutencao`: a retaguarda lê
-- pela tabela; o operador roda como `anon` e NÃO alcança nada aqui — todo
-- acesso dele passa pelas RPCs com token da migration seguinte.
drop policy if exists registros_campo_retaguarda_all on public.registros_campo;
create policy registros_campo_retaguarda_all
  on public.registros_campo
  for all
  to authenticated
  using (public.is_retaguarda())
  with check (public.is_retaguarda());

comment on table public.registros_campo is
  'Registros feitos em campo pelo operador (checklist, diário de obra, paralisação, viagens, transporte, solicitação de manutenção, medição assinada, ciência de segurança). Escrita exclusiva por RPC com token de sessão; dedup por op_id (ADR-001).';
comment on column public.registros_campo.assinatura is
  'Data URL da assinatura do cliente na medição. Dado pessoal (LGPD): fora do jsonb para permitir retenção e anonimização isoladas.';
