ALTER TABLE public.avisos_whatsapp DROP CONSTRAINT avisos_whatsapp_provedor_check;
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_provedor_check
  CHECK (provedor = ANY (ARRAY['evolution_api', 'evolution_go', 'meta_cloud_api', 'openwa', 'waha']::text[]));

ALTER TABLE public.avisos_whatsapp DROP CONSTRAINT avisos_whatsapp_status_check;
ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_status_check
  CHECK (status = ANY (ARRAY['enviado', 'falha_telefone_invalido', 'falha_sessao_desconectada', 'falha_envio']::text[]));

ALTER TABLE public.avisos_whatsapp ADD CONSTRAINT avisos_whatsapp_os_id_key UNIQUE (os_id);
