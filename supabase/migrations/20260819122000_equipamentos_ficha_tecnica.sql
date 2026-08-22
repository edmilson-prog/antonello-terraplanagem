-- Ficha técnica do equipamento — as duas linhas que ainda eram sorteadas.
--
-- "Aquisição" exibia "FINAME/BNDES · 48x" e "Descrição" exibia "Uso geral em
-- terraplenagem" para toda máquina do cadastro, escolhidos de um pool por hash
-- do id. A forma de aquisição importa de verdade: a parcela do FINAME entra no
-- custo fixo mensal (PRD-013), então inventá-la contamina o custo-hora.
--
-- Nulo é resposta válida: máquina sem essa informação preenchida mostra "—".

alter table public.equipamentos
  add column if not exists aquisicao_forma text
    check (aquisicao_forma in ('recursos_proprios', 'finame', 'leasing', 'consorcio')),
  add column if not exists aquisicao_parcelas integer
    check (aquisicao_parcelas is null or aquisicao_parcelas > 0),
  add column if not exists descricao text;

comment on column public.equipamentos.aquisicao_forma is
  'Como a máquina foi adquirida. FINAME/leasing têm parcela mensal que entra no custo fixo (PRD-013).';
comment on column public.equipamentos.aquisicao_parcelas is
  'Número de parcelas do financiamento. Só faz sentido com aquisicao_forma financiada.';
comment on column public.equipamentos.descricao is
  'Observação livre sobre o uso da máquina (ex.: "Uso geral em terraplenagem").';

-- Parcela sem financiamento é dado incoerente: ou some junto, ou fica na base
-- alimentando um custo fixo que não existe.
alter table public.equipamentos
  drop constraint if exists chk_equipamentos_aquisicao_coerente;

alter table public.equipamentos
  add constraint chk_equipamentos_aquisicao_coerente check (
    aquisicao_parcelas is null
    or aquisicao_forma in ('finame', 'leasing', 'consorcio')
  );
