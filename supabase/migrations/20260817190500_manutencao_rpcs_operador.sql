-- Acesso do operador aos dados de manutenção (Onda 18).
--
-- Mesmo problema que `listar_ordens_operador` resolveu para OS e apontamento:
-- `planos_manutencao` e `registros_manutencao` só têm policy para
-- `authenticated` com is_retaguarda(), e o App de Campo roda com a anon key.
-- Sem RPC, o operador enxergaria zero manutenção — silenciosamente, porque RLS
-- sem policy que case devolve lista vazia em vez de erro.
--
-- Quatro telas de /app dependem disso: ficha do equipamento (próxima manutenção
-- e as 4 últimas realizadas), segurança, alertas de segurança e a escolha de
-- equipamento ao iniciar apontamento (o selo de manutenção vencida).
--
-- REGRA FINANCEIRA: /app/* nunca exibe valor. `listar_registros_manutencao_operador`
-- não devolve `custo` — nem para o cliente descartar depois. `fornecedor` e
-- `observacao` também ficam de fora por minimização: nenhuma tela de campo usa.
-- No TypeScript o espelho disso é `RegistroManutencaoOperador`, que as derivações
-- de manutenção passaram a receber — assim o compilador garante que a cadeia
-- statusEquipamento → statusPlano nunca toque em dado financeiro.

-- Planos são catálogo puro (descrição e intervalo em horas), sem dado pessoal
-- nem financeiro. Devolvidos inteiros, inclusive os inativos: a ficha resolve o
-- nome de uma manutenção JÁ REALIZADA pelo plano de origem, e esconder plano
-- inativo apagaria o histórico.
create or replace function public.listar_planos_manutencao_operador(p_token uuid)
returns setof public.planos_manutencao
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  return query select p.* from public.planos_manutencao p order by p.descricao;
end;
$$;

revoke execute on function public.listar_planos_manutencao_operador(uuid)
  from public, anon, authenticated;
grant execute on function public.listar_planos_manutencao_operador(uuid) to anon;

-- Colunas listadas uma a uma de propósito: `select r.*` passaria a vazar
-- qualquer coluna financeira futura no dia em que ela fosse criada.
create or replace function public.listar_registros_manutencao_operador(p_token uuid)
returns table (
  id uuid,
  equipamento_id uuid,
  plano_id uuid,
  tipo text,
  descricao text,
  prioridade text,
  horimetro_previsto numeric,
  horimetro_realizado numeric,
  horimetro_abertura numeric,
  status text,
  aberta_em timestamptz,
  realizada_em timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_operador_id uuid;
begin
  v_operador_id := public.operador_do_token(p_token);
  if v_operador_id is null then
    raise exception 'Sessão inválida ou expirada' using errcode = '28000';
  end if;

  -- Sem filtro por operador: manutenção é da frota, não de uma pessoa. Qualquer
  -- operador precisa ver que a máquina que vai pegar está com plano vencido.
  return query
    select r.id, r.equipamento_id, r.plano_id, r.tipo, r.descricao, r.prioridade,
           r.horimetro_previsto, r.horimetro_realizado, r.horimetro_abertura,
           r.status, r.aberta_em, r.realizada_em, r.created_at, r.updated_at
      from public.registros_manutencao r
     order by r.aberta_em desc;
end;
$$;

revoke execute on function public.listar_registros_manutencao_operador(uuid)
  from public, anon, authenticated;
grant execute on function public.listar_registros_manutencao_operador(uuid) to anon;
