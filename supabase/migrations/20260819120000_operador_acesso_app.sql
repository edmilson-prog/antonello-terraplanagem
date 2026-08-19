-- Acesso ao app (retaguarda) — o card "Acesso ao app" do detalhe do operador.
--
-- Até aqui ele exibia dispositivo, versão e último acesso sorteados de um pool
-- de exemplos: o escritório lia "Android · Redmi 12, hoje 07:32" para um
-- operador que talvez nunca tivesse aberto o app. Pior que não ter o dado.
--
-- `operador_sessoes` já é a fonte de verdade de quem entrou — só não guardava
-- de onde nem quando foi o último uso. Três colunas resolvem, e a sessão já é
-- criada no login, então não há tabela nova nem evento novo a inventar.
--
-- LGPD: `dispositivo` é rótulo grosso ("Android · Redmi 12"), montado no
-- cliente a partir do que o navegador já expõe. Nada de user-agent inteiro,
-- IMEI, IP ou qualquer coisa que identifique o aparelho — o objetivo é o
-- escritório saber que o operador aponta pelo celular dele, não rastreá-lo.

alter table public.operador_sessoes
  add column if not exists dispositivo text,
  add column if not exists app_versao text,
  add column if not exists ultimo_uso_em timestamptz;

comment on column public.operador_sessoes.dispositivo is
  'Rótulo grosso do aparelho (ex.: "Android · Redmi 12"). Sem identificador único — LGPD.';
comment on column public.operador_sessoes.app_versao is
  'VERSAO_SISTEMA do bundle que criou/usou a sessão.';
comment on column public.operador_sessoes.ultimo_uso_em is
  'Último toque da sessão. Null = nunca usada depois do login (vale criado_em).';

-- A consulta do card é sempre "a sessão mais recente deste operador".
create index if not exists idx_operador_sessoes_operador_recente
  on public.operador_sessoes (operador_id, criado_em desc);

-- `create or replace` casa por nome E lista de tipos: acrescentar parâmetros
-- criaria um segundo overload e deixaria o de 2 argumentos órfão, ainda com
-- grant para anon. Some primeiro.
drop function if exists public.login_operador(uuid, text);

create or replace function public.login_operador(
  p_operador_id uuid,
  p_pin text,
  p_dispositivo text default null,
  p_app_versao text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_operador record;
  v_token uuid;
begin
  select id, nome, ativo, pin_hash, tentativas_falhas, bloqueado_ate
    into v_operador
    from public.operadores
    where id = p_operador_id
    for update;

  if not found or not v_operador.ativo then
    return jsonb_build_object('erro', 'Operador não encontrado ou inativo');
  end if;

  if v_operador.bloqueado_ate is not null and v_operador.bloqueado_ate > now() then
    return jsonb_build_object('erro', 'Muitas tentativas — tente novamente mais tarde');
  end if;

  if extensions.crypt(p_pin, v_operador.pin_hash) <> v_operador.pin_hash then
    update public.operadores
      set tentativas_falhas = tentativas_falhas + 1,
          bloqueado_ate = case
            when tentativas_falhas + 1 >= 5 then now() + interval '15 minutes'
            else bloqueado_ate
          end
      where id = p_operador_id;
    return jsonb_build_object('erro', 'PIN incorreto');
  end if;

  update public.operadores
    set tentativas_falhas = 0, bloqueado_ate = null
    where id = p_operador_id;

  -- Rótulos são truncados aqui, não no cliente: o cliente não é a fronteira.
  insert into public.operador_sessoes (
    operador_id, expira_em, dispositivo, app_versao, ultimo_uso_em
  )
  values (
    p_operador_id,
    now() + interval '180 days',
    nullif(left(trim(coalesce(p_dispositivo, '')), 60), ''),
    nullif(left(trim(coalesce(p_app_versao, '')), 30), ''),
    now()
  )
  returning token into v_token;

  return jsonb_build_object(
    'token', v_token,
    'operador', jsonb_build_object('id', v_operador.id, 'nome', v_operador.nome)
  );
end;
$$;

revoke all on function public.login_operador(uuid, text, text, text) from public;
grant execute on function public.login_operador(uuid, text, text, text) to anon;

-- Toque de sessão: o app avisa que está vivo ao abrir. Sem isso, "último
-- acesso" congelaria na data do login — e um operador que aponta todo dia há
-- seis meses apareceria como se tivesse sumido no dia em que entrou.
--
-- Não estende `expira_em`: a validade da sessão é decisão do login, não algo
-- que o próprio uso renova indefinidamente.
create or replace function public.tocar_sessao_operador(
  p_token uuid,
  p_dispositivo text default null,
  p_app_versao text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.operador_sessoes
     set ultimo_uso_em = now(),
         dispositivo = coalesce(
           nullif(left(trim(coalesce(p_dispositivo, '')), 60), ''), dispositivo
         ),
         app_versao = coalesce(
           nullif(left(trim(coalesce(p_app_versao, '')), 30), ''), app_versao
         )
   where token = p_token
     and not revogado
     and expira_em > now();
end;
$$;

revoke all on function public.tocar_sessao_operador(uuid, text, text) from public;
grant execute on function public.tocar_sessao_operador(uuid, text, text) to anon;

-- Leitura do card, pela retaguarda. `operador_sessoes` não tem policy nenhuma
-- (de propósito — token de sessão não se lê por RLS), então a única porta é
-- esta função, que checa `is_retaguarda()` e devolve só o que o card mostra.
-- O TOKEN NUNCA SAI DAQUI.
create or replace function public.acesso_app_operador(p_operador_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_sessao record;
  v_ativo boolean;
begin
  if not public.is_retaguarda() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  select s.criado_em, s.expira_em, s.revogado, s.dispositivo, s.app_versao, s.ultimo_uso_em
    into v_sessao
    from public.operador_sessoes s
   where s.operador_id = p_operador_id
   order by s.criado_em desc
   limit 1;

  if not found then
    -- Nunca entrou. O card diz isso — não inventa um "último acesso".
    return jsonb_build_object(
      'nunca_acessou', true,
      'liberado', false,
      'ultimo_acesso', null,
      'dispositivo', null,
      'app_versao', null
    );
  end if;

  v_ativo := not v_sessao.revogado and v_sessao.expira_em > now();

  return jsonb_build_object(
    'nunca_acessou', false,
    'liberado', v_ativo,
    'ultimo_acesso', coalesce(v_sessao.ultimo_uso_em, v_sessao.criado_em),
    'dispositivo', v_sessao.dispositivo,
    'app_versao', v_sessao.app_versao
  );
end;
$$;

revoke all on function public.acesso_app_operador(uuid) from public;
grant execute on function public.acesso_app_operador(uuid) to authenticated;

-- Mesma leitura, para a LISTA de operadores. A coluna "Acesso ao app" da
-- tabela precisa do estado de todos de uma vez; chamar a função de um só por
-- linha seria N+1 de rede numa tela que abre com a lista inteira.
--
-- DISTINCT ON pega a sessão mais recente de cada operador em uma varredura,
-- apoiada no índice (operador_id, criado_em desc) criado acima.
create or replace function public.acesso_app_operadores()
returns table (
  operador_id uuid,
  liberado boolean,
  ultimo_acesso timestamptz,
  dispositivo text,
  app_versao text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_retaguarda() then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;

  return query
  select r.operador_id,
         (not r.revogado and r.expira_em > now()) as liberado,
         coalesce(r.ultimo_uso_em, r.criado_em) as ultimo_acesso,
         r.dispositivo,
         r.app_versao
    from (
      select distinct on (s.operador_id)
             s.operador_id, s.revogado, s.expira_em, s.criado_em,
             s.ultimo_uso_em, s.dispositivo, s.app_versao
        from public.operador_sessoes s
       order by s.operador_id, s.criado_em desc
    ) r;
end;
$$;

revoke all on function public.acesso_app_operadores() from public;
grant execute on function public.acesso_app_operadores() to authenticated;

-- Sessões que já existem não têm de onde tirar dispositivo/versão — ficam
-- null e o card mostra "não informado". O primeiro toque do app preenche.
update public.operador_sessoes
   set ultimo_uso_em = criado_em
 where ultimo_uso_em is null;
