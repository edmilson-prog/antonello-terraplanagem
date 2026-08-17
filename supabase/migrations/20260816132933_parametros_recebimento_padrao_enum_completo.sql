-- O check aceitava só 4 dos 6 valores de FormaRecebimento (shared/types), o que
-- deixaria o TS permitindo 'cheque'/'outro' e o banco rejeitando.
alter table public.parametros drop constraint parametros_recebimento_padrao_check;
alter table public.parametros add constraint parametros_recebimento_padrao_check
  check (recebimento_padrao in ('dinheiro','pix','transferencia','boleto','cheque','outro'));
