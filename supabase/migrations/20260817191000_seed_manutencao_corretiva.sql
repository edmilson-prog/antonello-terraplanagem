-- Semente de demonstração da manutenção corretiva (Onda 18).
--
-- As 5 linhas que já existiam em `registros_manutencao` são todas preventivas de
-- plano, e as mais recentes são de junho — a tela de Manutenção abriria com
-- todos os KPIs zerados e sem nenhuma corretiva para olhar. Estas duas ordens
-- existem para o fluxo novo poder ser conferido; podem ser apagadas quando a
-- operação real começar a lançar as suas.
--
-- Mesmo espírito das outras sementes do projeto (que vieram de src/mocks/), e
-- idempotente: reaplicar não duplica.
--
-- Os equipamentos não são fixados por id — a migration escolhe pelo nome
-- registrado no cadastro, e não faz nada se ele não existir.

-- Ordem corretiva ainda aberta: alimenta o KPI "Em manutenção".
insert into public.registros_manutencao (
  equipamento_id, plano_id, tipo, descricao, prioridade, fornecedor,
  horimetro_previsto, horimetro_abertura, status, custo, aberta_em
)
select e.id, null, 'corretiva', 'Vazamento no comando hidráulico', 'alta', 'Oficina interna',
       null, e.horimetro_atual, 'em_andamento', 3400, timestamptz '2026-08-08 09:00:00-03'
  from public.equipamentos e
 where e.nome = 'CAMINHÃO CAÇAMBA BASCULANTE'
   and not exists (
         select 1 from public.registros_manutencao r
          where r.tipo = 'corretiva'
            and r.descricao = 'Vazamento no comando hidráulico'
       );

-- Ordem corretiva concluída no mês: alimenta o KPI "Custo de manutenção" e
-- entra no Custo da Hora do equipamento na competência de agosto.
insert into public.registros_manutencao (
  equipamento_id, plano_id, tipo, descricao, prioridade, fornecedor,
  horimetro_previsto, horimetro_abertura, horimetro_realizado, status, custo,
  aberta_em, realizada_em, observacao
)
select e.id, null, 'corretiva', 'Troca de embreagem', 'media', 'Mecânica Diesel Sul',
       null, e.horimetro_atual, e.horimetro_atual, 'realizada', 3850,
       timestamptz '2026-08-04 08:00:00-03', timestamptz '2026-08-06 17:00:00-03',
       'Disco e platô substituídos.'
  from public.equipamentos e
 where e.nome = 'CAMINHÃO CAÇAMBA MERCEDES-BENZ'
   and not exists (
         select 1 from public.registros_manutencao r
          where r.tipo = 'corretiva'
            and r.descricao = 'Troca de embreagem'
       );
