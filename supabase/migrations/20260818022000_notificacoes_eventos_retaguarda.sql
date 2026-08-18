-- Eventos que alimentam a central da retaguarda (Onda 19).
--
-- O PRD-020 só produzia notificação de campo. As categorias Financeiro,
-- Comercial e metade de Frota do UI kit não tinham nenhum produtor — os filtros
-- existiriam vazios. Aqui nascem: dois por gatilho imediato (trigger numa
-- tabela) e o resto por varredura diária, porque "vencer" é passar do tempo, e
-- tempo não dispara trigger.
--
-- Dedup: todo evento carrega `origem_id` (a conta, o orçamento, o registro de
-- manutenção). O índice único abaixo é o que impede a varredura de repetir o
-- mesmo aviso todo dia — a segunda tentativa cai no `on conflict do nothing`.

create unique index if not exists idx_notificacoes_origem_unica_retaguarda
  on public.notificacoes (usuario_id, tipo, origem_id)
  where usuario_id is not null and origem_id is not null;

-- Fan-out para o escritório: uma linha por pessoa da retaguarda, porque
-- `lida_em` é da linha — caixa compartilhada faria o primeiro a ler apagar o
-- aviso dos outros.
create or replace function public.criar_notificacao_retaguarda(
  p_tipo text,
  p_categoria text,
  p_titulo text,
  p_mensagem text,
  p_prioridade text default 'normal',
  p_os_id uuid default null,
  p_origem_id uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
begin
  insert into public.notificacoes
    (usuario_id, tipo, categoria, prioridade, titulo, mensagem, os_id, origem_id)
  select u.id, p_tipo, p_categoria, p_prioridade, p_titulo, p_mensagem, p_os_id, p_origem_id
    from public.usuarios_retaguarda u
  on conflict do nothing;

  get diagnostics v_total = row_count;
  return v_total;
end;
$$;

revoke execute on function public.criar_notificacao_retaguarda(text, text, text, text, text, uuid, uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Comercial — gatilho imediato na mudança de status do orçamento
-- ---------------------------------------------------------------------------
create or replace function public.tg_notificar_orcamento_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  select nome into v_cliente from public.clientes where id = new.cliente_id;

  if new.status = 'aprovado' then
    perform public.criar_notificacao_retaguarda(
      'orcamento_aprovado', 'comercial',
      'Orçamento aprovado',
      new.numero || coalesce(' · ' || v_cliente, '') || ' — aceite do cliente',
      'normal', null, new.id
    );
  elsif new.status = 'recusado' then
    perform public.criar_notificacao_retaguarda(
      'orcamento_perdido', 'comercial',
      'Orçamento perdido',
      new.numero || coalesce(' · ' || v_cliente, ''),
      'normal', null, new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orcamentos_notificar_status on public.orcamentos;
create trigger trg_orcamentos_notificar_status
  after update of status on public.orcamentos
  for each row execute function public.tg_notificar_orcamento_status();

-- ---------------------------------------------------------------------------
-- Financeiro — gatilho imediato na baixa de uma conta a receber
-- ---------------------------------------------------------------------------
create or replace function public.tg_notificar_comprovante_recebido()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente text;
begin
  if new.status is not distinct from old.status or new.status <> 'liquidada' then
    return new;
  end if;

  -- contas_receber não tem descrição própria: o título se identifica pelo
  -- cliente e pelo valor.
  select nome into v_cliente from public.clientes where id = new.cliente_id;

  perform public.criar_notificacao_retaguarda(
    'comprovante_recebido', 'financeiro',
    'Recebimento confirmado',
    coalesce(v_cliente, 'Cliente') || ' — ' || to_char(new.valor, 'FM"R$" 999G999G990D00'),
    'normal', null, new.id
  );

  return new;
end;
$$;

drop trigger if exists trg_contas_receber_notificar_baixa on public.contas_receber;
create trigger trg_contas_receber_notificar_baixa
  after update of status on public.contas_receber
  for each row execute function public.tg_notificar_comprovante_recebido();

-- ---------------------------------------------------------------------------
-- Varredura diária — o que "vence" não dispara trigger
-- ---------------------------------------------------------------------------
create or replace function public.gerar_notificacoes_retaguarda()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer := 0;
  v_prazo integer;
  r record;
begin
  -- Título vencido (crítico) e a vencer em 3 dias.
  for r in
    select c.id, cl.nome as cliente, c.valor, c.vencimento,
           (c.vencimento < current_date) as vencida
      from public.contas_receber c
      left join public.clientes cl on cl.id = c.cliente_id
     where c.status = 'aberta'
       and c.vencimento <= current_date + 3
  loop
    v_total := v_total + public.criar_notificacao_retaguarda(
      case when r.vencida then 'titulo_vencido' else 'titulo_a_vencer' end,
      'financeiro',
      case when r.vencida then 'Título vencido' else 'Título a vencer' end,
      coalesce(r.cliente, 'Cliente') || ' — ' || to_char(r.valor, 'FM"R$" 999G999G990D00')
        || ' · vence ' || to_char(r.vencimento, 'DD/MM'),
      case when r.vencida then 'critico' else 'normal' end,
      null, r.id
    );
  end loop;

  -- Orçamento a vencer: validade em 5 dias.
  for r in
    select o.id, o.numero, o.validade, cl.nome as cliente
      from public.orcamentos o
      left join public.clientes cl on cl.id = o.cliente_id
     where o.status = 'enviado'
       and o.validade is not null
       and o.validade between current_date and current_date + 5
  loop
    v_total := v_total + public.criar_notificacao_retaguarda(
      'orcamento_a_vencer', 'comercial',
      'Orçamento a vencer',
      r.numero || coalesce(' · ' || r.cliente, '') || ' · validade ' || to_char(r.validade, 'DD/MM'),
      'normal', null, r.id
    );
  end loop;

  -- Plano de manutenção vencido (crítico). O status é derivado do horímetro —
  -- mesma regra de calcularStatusManutencao em src/features/manutencao.
  select coalesce(alerta_manutencao_horas, 20) into v_prazo
    from public.parametros limit 1;

  for r in
    select rm.id, e.nome as equipamento, p.descricao as plano,
           (rm.horimetro_previsto - e.horimetro_atual) as restantes
      from public.registros_manutencao rm
      join public.equipamentos e on e.id = rm.equipamento_id
      join public.planos_manutencao p on p.id = rm.plano_id
     where rm.status = 'prevista'
       and rm.horimetro_previsto is not null
       and e.ativo
       and (rm.horimetro_previsto - e.horimetro_atual) <= coalesce(v_prazo, 20)
  loop
    v_total := v_total + public.criar_notificacao_retaguarda(
      case when r.restantes <= 0 then 'manutencao_vencida' else 'manutencao_agendada' end,
      'frota',
      case when r.restantes <= 0 then 'Plano de manutenção vencido' else 'Plano a vencer' end,
      r.equipamento || ' · ' || r.plano || ' · '
        || case when r.restantes <= 0
                then to_char(abs(r.restantes), 'FM999G990D0') || ' h além da marca'
                else 'faltam ' || to_char(r.restantes, 'FM999G990D0') || ' h'
           end,
      case when r.restantes <= 0 then 'critico' else 'normal' end,
      null, r.id
    );
  end loop;

  -- OS aberta sem nenhum apontamento há mais de 2 dias.
  for r in
    select os.id, os.numero, os.obra_nome
      from public.ordens_servico os
     where os.status in ('aberta', 'em_andamento')
       and os.aberta_em < now() - interval '2 days'
       and not exists (select 1 from public.apontamentos a where a.os_id = os.id)
  loop
    v_total := v_total + public.criar_notificacao_retaguarda(
      'os_sem_apontamento', 'operacao',
      'OS sem apontamento',
      r.numero || ' · ' || r.obra_nome || ' — nenhum apontamento em 2 dias',
      'normal', r.id, r.id
    );
  end loop;

  return v_total;
end;
$$;

revoke execute on function public.gerar_notificacoes_retaguarda() from public, anon, authenticated;

-- 07:00 em Brasília = 10:00 UTC. O kit rotula "varredura diária às 07:00".
select cron.schedule(
  'notificacoes-varredura-retaguarda',
  '0 10 * * *',
  $cron$select public.gerar_notificacoes_retaguarda()$cron$
);
