-- Coordenadas das obras já cadastradas.
--
-- Sem isso o mapa do painel operacional continua correto porém vazio: ele só
-- planta a máquina onde a OS tem coordenada, e nenhuma OS anterior a esta onda
-- tem. Preenche as obras da base de demonstração com pontos reais na região de
-- atuação (Santo Ângelo e municípios vizinhos, RS), espalhados por município
-- para que o mapa mostre frentes distintas em vez de um amontoado.
--
-- Só toca OS que ainda não tem coordenada: rodar de novo não sobrescreve o que
-- a retaguarda tiver informado à mão.

with pontos as (
  select *
    from (values
      (0, -28.299200, -54.263100),  -- Santo Ângelo
      (1, -28.279000, -54.230000),  -- Santo Ângelo — leste
      (2, -27.359600, -53.396400),  -- Frederico Westphalen
      (3, -27.899500, -53.313700),  -- Palmeira das Missões
      (4, -28.451200, -54.006900),  -- Entre-Ijuís
      (5, -28.033700, -54.184500)   -- Catuípe
    ) as p (slot, lat, lng)
),
alvo as (
  select id, row_number() over (order by aberta_em) % 6 as slot
    from public.ordens_servico
   where local_lat is null
)
update public.ordens_servico os
   set local_lat = p.lat,
       local_lng = p.lng
  from alvo a
  join pontos p on p.slot = a.slot
 where os.id = a.id;
