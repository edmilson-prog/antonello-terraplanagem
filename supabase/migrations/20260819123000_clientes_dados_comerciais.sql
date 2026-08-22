-- Dados comerciais e de contato do cliente.
--
-- O card "Dados cadastrais" exibia nome fantasia, segmento, e-mail, endereço e
-- contato responsável — todos sorteados de um pool por hash do id. O e-mail era
-- literalmente "contato@exemplo.com.br" para todo cliente da base. O escritório
-- não tinha como saber que aquilo era exemplo.
--
-- LGPD: `contato_nome`, `contato_papel` e `email` são dados pessoais de um
-- funcionário do cliente. Todos opcionais (minimização), sob a mesma RLS do
-- resto da tabela, e nunca expostos ao app de campo — `clientes_anon_select_ativos`
-- continua devolvendo só as colunas de identificação da OS.

alter table public.clientes
  add column if not exists nome_fantasia text,
  add column if not exists segmento text,
  add column if not exists email text,
  add column if not exists endereco text,
  add column if not exists cidade text,
  add column if not exists contato_nome text,
  add column if not exists contato_papel text,
  add column if not exists legado_importado_em date;

comment on column public.clientes.nome_fantasia is
  'Nome fantasia. `nome` é a razão social.';
comment on column public.clientes.contato_nome is
  'Pessoa de contato no cliente — dado pessoal, opcional (LGPD: minimização).';
comment on column public.clientes.contato_papel is
  'Papel do contato (ex.: "Engenheiro responsável").';
comment on column public.clientes.legado_importado_em is
  'Quando o snapshot do FarolTI foi importado. Null para cliente cadastrado direto na plataforma.';

-- Os clientes vindos do FarolTI têm `cli_codigo_legado`; a data da importação
-- não foi guardada na época. Em vez de inventar um mês, deriva do created_at
-- da linha — que é, de fato, quando o registro entrou nesta base.
update public.clientes
   set legado_importado_em = created_at::date
 where cli_codigo_legado is not null
   and legado_importado_em is null;
