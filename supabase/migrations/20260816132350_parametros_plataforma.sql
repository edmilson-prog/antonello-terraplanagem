-- Parâmetros da plataforma — linha única (singleton) com as configurações que
-- hoje viviam como constante espalhada pelo código, mais os campos de cadastro
-- desenhados no UI kit (Parametros.jsx / Configuracoes.jsx).
--
-- Defaults: quando o mock do kit e o comportamento real do sistema divergem,
-- o default segue o REAL, para que criar esta tabela não mude silenciosamente
-- o comportamento de nada. Divergências marcadas com "kit:" abaixo.

create table public.parametros (
  id uuid primary key default gen_random_uuid(),

  -- Empresa (identificação usada em NF, orçamentos e comprovantes)
  razao_social text not null default '',
  nome_fantasia text not null default '',
  cnpj text not null default '',
  inscricao_estadual text not null default '',
  telefone text not null default '',
  email text not null default '',
  sede text not null default '',

  -- Operação
  jornada_horas numeric(4,1) not null default 8.0,
  tolerancia_horimetro numeric(4,2) not null default 0.2,
  alerta_manutencao_horas numeric(6,1) not null default 20, -- kit: 50; real: ANTECEDENCIA_HORAS_PADRAO
  fechamento_dia time not null default '20:00',
  aprovacao_apontamento text not null default 'supervisor'
    check (aprovacao_apontamento in ('supervisor','encarregado','automatica')),
  dias_uteis text not null default 'seg_sex'
    check (dias_uteis in ('seg_sex','seg_sab','personalizado')),
  apontamento_via_app boolean not null default true,
  foto_obrigatoria boolean not null default false, -- kit: true; real: a foto é opcional
  registrar_gps boolean not null default false,

  -- Custos & preços
  depreciacao_anual_pct numeric(5,2) not null default 10,
  custo_operador_hora numeric(10,2) not null default 62,
  margem_minima_pct numeric(5,2) not null default 30, -- real: MARGEM_MINIMA_PADRAO
  horas_mes_referencia numeric(6,1) not null default 160, -- real: custoEstimadoHoraEquipamento
  diesel_preco_litro numeric(10,4) not null default 5.84,
  arredondamento_preco text not null default 'nenhum'
    check (arredondamento_preco in ('nenhum','1','5','10')),
  reajuste_automatico_precos boolean not null default false,
  alertar_margem_baixa boolean not null default true,

  -- Faturamento
  vencimento_dias integer not null default 30, -- kit: 15; real: contrato de ContaReceber
  juros_mes_pct numeric(5,2) not null default 1,
  multa_atraso_pct numeric(5,2) not null default 2,
  nf_serie text not null default '1',
  nf_proxima_numeracao text not null default '000001',
  regime_tributario text not null default 'lucro_presumido'
    check (regime_tributario in ('simples_nacional','lucro_presumido','lucro_real')),
  recebimento_padrao text not null default 'pix'
    check (recebimento_padrao in ('pix','boleto','transferencia','dinheiro')),
  chave_pix text not null default '',
  nf_numeracao_automatica boolean not null default true,
  nf_envio_email boolean not null default true,

  -- Integrações
  whatsapp_numero text not null default '',
  email_remetente text not null default '',
  sincronizacao_app text not null default '5min'
    check (sincronizacao_app in ('tempo_real','5min','15min')),
  webhook_url text not null default '',
  canal_whatsapp_ativo boolean not null default false,
  backup_diario boolean not null default false, -- kit: true; real: não há rotina de backup própria

  -- Acesso & segurança
  sessao_expira_min integer not null default 30,
  retencao_logs_dias integer not null default 365,
  politica_senha text not null default 'padrao' -- kit: forte; real: mínimo de 6 caracteres
    check (politica_senha in ('padrao','forte')),
  perfil_padrao_novo_usuario text not null default 'operador'
    check (perfil_padrao_novo_usuario in ('operador','recepcao','proprietario')),
  dupla_verificacao boolean not null default false,
  particionamento_financeiro boolean not null default true,

  -- Registro (card "Registro" da tela de Configurações)
  versao integer not null default 1,
  atualizado_por uuid references public.usuarios_retaguarda (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Singleton: a plataforma tem um único conjunto de parâmetros.
create unique index idx_parametros_singleton on public.parametros ((true));

-- Histórico: alimentado por trigger, nunca pelo cliente — assim nenhuma
-- alteração escapa do registro, venha ela da UI ou de um update manual.
create table public.parametros_historico (
  id uuid primary key default gen_random_uuid(),
  campo text not null,
  valor_anterior text,
  valor_novo text,
  versao integer not null,
  alterado_por uuid references public.usuarios_retaguarda (id),
  alterado_em timestamptz not null default now()
);

create index idx_parametros_historico_alterado_em on public.parametros_historico (alterado_em desc);

-- Campos de controle: fora do histórico e fora da comparação "mudou algo?".
create or replace function public.parametros_campos_de_negocio(registro public.parametros)
returns jsonb
language sql
immutable
as $$
  select to_jsonb(registro) - array['id','versao','atualizado_por','created_at','updated_at'];
$$;

-- Carimba versão e autor a cada alteração real dos parâmetros.
create or replace function public.parametros_antes_update()
returns trigger
language plpgsql
as $$
begin
  if public.parametros_campos_de_negocio(new)
     is distinct from public.parametros_campos_de_negocio(old) then
    new.versao := old.versao + 1;
    new.atualizado_por := auth.uid();
  end if;
  return new;
end;
$$;

create trigger trg_parametros_versao
  before update on public.parametros
  for each row execute function public.parametros_antes_update();

create trigger trg_parametros_updated_at
  before update on public.parametros
  for each row execute function public.set_updated_at();

-- Uma linha de histórico por campo alterado.
create or replace function public.parametros_registrar_historico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  antes jsonb := public.parametros_campos_de_negocio(old);
  depois jsonb := public.parametros_campos_de_negocio(new);
  chave text;
begin
  for chave in select jsonb_object_keys(depois) loop
    if antes -> chave is distinct from depois -> chave then
      insert into public.parametros_historico
        (campo, valor_anterior, valor_novo, versao, alterado_por)
      values
        (chave, antes ->> chave, depois ->> chave, new.versao, new.atualizado_por);
    end if;
  end loop;
  return null;
end;
$$;

create trigger trg_parametros_historico
  after update on public.parametros
  for each row execute function public.parametros_registrar_historico();

alter table public.parametros enable row level security;
alter table public.parametros_historico enable row level security;

-- Ler: qualquer perfil da retaguarda. Alterar: idem — o particionamento por
-- perfil não existe hoje em nenhuma policy do projeto (is_retaguarda() não
-- olha perfil), então esta tabela não inventa uma regra que o resto não segue.
create policy "parametros_retaguarda_all" on public.parametros
  for all to authenticated
  using (public.is_retaguarda()) with check (public.is_retaguarda());

-- Histórico é somente leitura: as linhas vêm do trigger SECURITY DEFINER.
create policy "parametros_historico_retaguarda_select" on public.parametros_historico
  for select to authenticated
  using (public.is_retaguarda());

-- Linha única, com os dados institucionais que já existiam na landing
-- (src/features/site/lib/contato.ts).
insert into public.parametros (razao_social, nome_fantasia, cnpj, telefone, sede)
values (
  'Antonello Terraplanagem Ltda.',
  'Antonello Terraplanagem',
  '36.508.280/0001-90',
  '(55) 99924-2409',
  'Frederico Westphalen — RS'
);
