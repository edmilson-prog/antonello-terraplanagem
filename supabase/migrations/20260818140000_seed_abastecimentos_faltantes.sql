-- Completa a semente de `abastecimentos` (Onda 20).
--
-- A tabela tinha 4 das 8 linhas de src/mocks/abastecimentos.ts — exatamente as
-- que têm `local` preenchido. As 4 que faltavam são as registradas pelo
-- operador em campo: sem local, sem preço e com `operador_id`.
--
-- Enquanto a store lia o mock isso não aparecia. Ao ligá-la no Supabase, a
-- página Diesel perderia metade dos abastecimentos — e o saldo do tanque, que
-- desde a Onda 17 já cruza compras REAIS com abastecimentos, ficaria errado
-- para o outro lado.
--
-- O equipamento é resolvido por NOME, não por id fixo: a semente original
-- derivou os UUIDs dos mocks por um caminho que não dá para reproduzir aqui, e
-- o nome é a chave estável entre os dois mundos.
--
-- `operador_id` fica NULO de propósito. No mock estes quatro apontam para
-- "JOSÉ CARLOS DA SILVA" e "ANTÔNIO PEREIRA", que são operadores fictícios; a
-- tabela real tem os 15 funcionários da Antonello importados do ERP. Amarrar um
-- abastecimento inventado a uma pessoa de verdade seria pior do que não saber
-- quem abasteceu — e a coluna é anulável justamente para esse caso.

insert into public.abastecimentos
  (equipamento_id, operador_id, litros, horimetro, preco_litro, custo_total, local, origem, abastecido_em)
select e.id, null, v.litros, v.horimetro, null, null, null, 'externo', v.abastecido_em
  from (values
    ('ESCAVADEIRA HIDRÁULICA CATERPILLAR 320D', 175.0, 8460.0, timestamptz '2026-06-17 07:45:00+00'),
    ('ESCAVADEIRA 10T',                         145.0, 5085.0, timestamptz '2026-06-16 08:00:00+00'),
    ('CAMINHÃO CAÇAMBA BASCULANTE',             310.0, 12870.0, timestamptz '2026-06-14 07:00:00+00'),
    ('TRATOR DE ESTEIRA D6',                    98.0,  4180.0, timestamptz '2026-06-15 07:15:00+00')
  ) as v(equipamento_nome, litros, horimetro, abastecido_em)
  join public.equipamentos e on e.nome = v.equipamento_nome
 where not exists (
   select 1 from public.abastecimentos a
    where a.equipamento_id = e.id
      and a.abastecido_em = v.abastecido_em
 );
