-- Manutenção corretiva (Onda 18).
--
-- Até aqui `registros_manutencao` só sabia representar manutenção PREVENTIVA:
-- todo registro nascia de um `plano_manutencao`, herdava dele a descrição e
-- tinha uma marca de horímetro previsto. A Onda 10 tinha descartado a corretiva
-- de propósito ("não existe no produto real"); o UI kit da tela de Manutenção
-- insiste nela — Tipo e Situação são 2 das 6 colunas da tabela de ordens e 2 dos
-- 4 KPIs — e o argumento de negócio confirmou: hoje o Custo da Hora só soma
-- preventiva, então vazamento hidráulico e troca de embreagem ficam de fora e o
-- custo/hora sai subestimado.
--
-- O que muda no contrato, garantido pelo check `registros_manutencao_forma_check`:
--   com plano  → é preventiva e tem marca de horímetro; a descrição vem do plano
--   sem plano  → precisa descrever a si mesma
-- A segunda forma cobre tanto a corretiva quanto a preventiva avulsa (aquela
-- engraxada fora de ciclo que ninguém cadastrou como plano). Corretiva vinda de
-- plano não cabe em nenhuma das duas e é rejeitada.

alter table public.registros_manutencao
  add column if not exists tipo text not null default 'preventiva',
  add column if not exists descricao text,
  add column if not exists prioridade text not null default 'media',
  add column if not exists fornecedor text,
  -- Leitura do horímetro no momento da abertura. Não é o mesmo que
  -- `horimetro_previsto` (a marca-alvo do plano) nem que `horimetro_realizado`
  -- (a leitura no fechamento) — cada coluna guarda um só significado.
  add column if not exists horimetro_abertura numeric,
  add column if not exists aberta_em timestamptz not null default now();

-- Corretiva não tem plano nem marca prevista.
alter table public.registros_manutencao alter column plano_id drop not null;
alter table public.registros_manutencao alter column horimetro_previsto drop not null;

-- As linhas que já existiam são todas preventivas e foram abertas quando o
-- registro foi criado.
update public.registros_manutencao set aberta_em = created_at where aberta_em <> created_at;

-- "em_andamento" é a situação que faltava: a máquina está parada na oficina,
-- entre a abertura e a conclusão. É ela que alimenta o KPI "Em manutenção".
alter table public.registros_manutencao drop constraint if exists registros_manutencao_status_check;
alter table public.registros_manutencao
  add constraint registros_manutencao_status_check
  check (status in ('prevista', 'em_andamento', 'realizada'));

alter table public.registros_manutencao
  add constraint registros_manutencao_tipo_check
  check (tipo in ('preventiva', 'corretiva'));

alter table public.registros_manutencao
  add constraint registros_manutencao_prioridade_check
  check (prioridade in ('alta', 'media', 'baixa'));

alter table public.registros_manutencao
  add constraint registros_manutencao_forma_check
  check (
    (plano_id is not null and tipo = 'preventiva' and horimetro_previsto is not null)
    or (plano_id is null and nullif(btrim(coalesce(descricao, '')), '') is not null)
  );

-- A tela agrupa por equipamento e filtra por situação em toda carga.
create index if not exists idx_registros_manutencao_equipamento_id
  on public.registros_manutencao (equipamento_id);
create index if not exists idx_registros_manutencao_status
  on public.registros_manutencao (status);
