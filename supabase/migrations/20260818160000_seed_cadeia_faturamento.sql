-- Semente da cadeia Executado → Faturado → Recebido (Onda 21).
--
-- `faturamentos`, `faturamento_itens`, `contas_receber` e `comprovantes` têm
-- tabela desde o PRD-017 e ZERO linhas — o front inteiro lia src/mocks/. Sem
-- semente, migrar as stores deixaria cinco telas em branco.
--
-- Duas decisões moldam o que está aqui:
--
-- 1. NÃO semeamos apontamentos. `apontamentos.operador_id` é obrigatório, e os
--    15 operadores do banco são funcionários reais da Antonello. Criar jornada
--    de trabalho inventada no nome de gente de verdade é pior do que uma tela
--    vazia — decisão do usuário. `apontamentos` fica vazio até o primeiro
--    operador usar o app de campo.
--
-- 2. Por consequência, os faturamentos aqui são compostos só de MOBILIZAÇÃO.
--    Item de hora-máquina teria quantidade em horas, e hora vem de apontamento;
--    faturar 18 h sem nenhum apontamento por trás seria um número inventado
--    dentro de uma tela financeira. Mobilização é preço fechado por transporte,
--    não depende de horas — então é o único item que dá para semear sem mentir.
--    Quando o operador começar a apontar, o "Gerar faturamento" monta os itens
--    de hora normalmente, com a lógica que já existe e é testada.
--
-- Nada é fixado por id: OS, cliente e preço são resolvidos pelo número/nome.

-- OS-2026-0002 e OS-2026-0005 passam a fechadas — é o que habilita faturar.
-- A 0005 fica DE PROPÓSITO sem faturamento, para exercitar o card
-- "Aguardando faturamento" com dado real.
update public.ordens_servico
   set status = 'fechada', fechada_em = timestamptz '2026-08-14 17:00:00-03'
 where numero = 'OS-2026-0002' and status <> 'fechada';

update public.ordens_servico
   set status = 'fechada', fechada_em = timestamptz '2026-08-15 16:30:00-03'
 where numero = 'OS-2026-0005' and status <> 'fechada';

-- ---------------------------------------------------------------------------
-- FAT-2026-0001 — OS-2026-0003, faturado em julho, título JÁ VENCIDO.
-- O vencimento no passado é intencional: é o que faz a varredura diária das
-- 07:00 (Onda 19) produzir a notificação "Título vencido" e a categoria
-- Financeiro da central deixar de ser um filtro vazio.
-- ---------------------------------------------------------------------------
insert into public.faturamentos
  (numero, os_id, cliente_id, modelo_cobranca, desconto, valor_total, observacao,
   status, gerado_em, faturado_em)
select 'FAT-2026-0001', os.id, os.cliente_id, 'hora_maquina', 0, p.valor,
       'Mobilização faturada à parte; horas serão faturadas conforme apontamento.',
       'faturado', timestamptz '2026-07-06 18:00:00-03', timestamptz '2026-07-06 18:30:00-03'
  from public.ordens_servico os
  cross join lateral (
    select valor from public.precos_mobilizacao
     where descricao like 'Mobilização e desmobilização%' and ativo limit 1
  ) p
 where os.numero = 'OS-2026-0003'
   and not exists (select 1 from public.faturamentos f where f.numero = 'FAT-2026-0001');

insert into public.faturamento_itens
  (faturamento_id, tipo, descricao, origem_id, hora_tipo, quantidade, valor_unitario, valor_total, sem_preco)
select f.id, 'mobilizacao', pm.descricao, pm.id, null, 1, pm.valor, pm.valor, false
  from public.faturamentos f
  cross join lateral (
    select id, descricao, valor from public.precos_mobilizacao
     where descricao like 'Mobilização e desmobilização%' and ativo limit 1
  ) pm
 where f.numero = 'FAT-2026-0001'
   and not exists (select 1 from public.faturamento_itens i where i.faturamento_id = f.id);

insert into public.contas_receber (faturamento_id, cliente_id, valor, vencimento, status)
select f.id, f.cliente_id, f.valor_total, date '2026-08-05', 'aberta'
  from public.faturamentos f
 where f.numero = 'FAT-2026-0001'
   and not exists (select 1 from public.contas_receber c where c.faturamento_id = f.id);

-- ---------------------------------------------------------------------------
-- FAT-2026-0002 — OS-2026-0002, faturado agora, título A VENCER.
-- Alimenta o outro lado do Financeiro: o que ainda vai vencer.
-- ---------------------------------------------------------------------------
insert into public.faturamentos
  (numero, os_id, cliente_id, modelo_cobranca, desconto, valor_total, observacao,
   status, gerado_em, faturado_em)
select 'FAT-2026-0002', os.id, os.cliente_id, 'por_metro', 0, p.valor, null,
       'faturado', timestamptz '2026-08-14 18:00:00-03', timestamptz '2026-08-14 18:20:00-03'
  from public.ordens_servico os
  cross join lateral (
    select valor from public.precos_mobilizacao
     where descricao like 'Transporte em prancha%' and ativo limit 1
  ) p
 where os.numero = 'OS-2026-0002'
   and not exists (select 1 from public.faturamentos f where f.numero = 'FAT-2026-0002');

insert into public.faturamento_itens
  (faturamento_id, tipo, descricao, origem_id, hora_tipo, quantidade, valor_unitario, valor_total, sem_preco)
select f.id, 'mobilizacao', pm.descricao, pm.id, null, 1, pm.valor, pm.valor, false
  from public.faturamentos f
  cross join lateral (
    select id, descricao, valor from public.precos_mobilizacao
     where descricao like 'Transporte em prancha%' and ativo limit 1
  ) pm
 where f.numero = 'FAT-2026-0002'
   and not exists (select 1 from public.faturamento_itens i where i.faturamento_id = f.id);

insert into public.contas_receber (faturamento_id, cliente_id, valor, vencimento, status)
select f.id, f.cliente_id, f.valor_total, date '2026-08-20', 'aberta'
  from public.faturamentos f
 where f.numero = 'FAT-2026-0002'
   and not exists (select 1 from public.contas_receber c where c.faturamento_id = f.id);

-- ---------------------------------------------------------------------------
-- Comprovantes — um assinado (OS-2026-0003) e um pendente (OS-2026-0005).
-- `assinatura_url` fica nula: a assinatura de verdade é capturada no app de
-- campo (PRD-011), e apontar para um arquivo que não existe seria pior.
-- ---------------------------------------------------------------------------
insert into public.comprovantes
  (numero, os_id, cliente_id, resumo_servico, assinante_nome, assinatura_url,
   status, motivo_recusa, gerado_em, assinado_em)
select 'CMP-2026-0001', os.id, os.cliente_id,
       'Limpeza e nivelamento de vias — mobilização de escavadeira',
       'Responsável da obra', null, 'assinado', null,
       timestamptz '2026-07-06 17:30:00-03', timestamptz '2026-07-06 17:45:00-03'
  from public.ordens_servico os
 where os.numero = 'OS-2026-0003'
   and not exists (select 1 from public.comprovantes c where c.numero = 'CMP-2026-0001');

insert into public.comprovantes
  (numero, os_id, cliente_id, resumo_servico, assinante_nome, assinatura_url,
   status, motivo_recusa, gerado_em, assinado_em)
select 'CMP-2026-0002', os.id, os.cliente_id,
       'Fundação — reservatório elevado', null, null, 'pendente', null,
       timestamptz '2026-08-15 16:45:00-03', null
  from public.ordens_servico os
 where os.numero = 'OS-2026-0005'
   and not exists (select 1 from public.comprovantes c where c.numero = 'CMP-2026-0002');
