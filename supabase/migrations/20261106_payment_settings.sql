/**
 * @file /supabase/migrations/20261106_payment_settings.sql
 * @description Tabela idempotente para central de configuração de formas de pagamento (Pix Manual, Mercado Pago, InfinitePay).
 */

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'gateway_config',
  manual_pix_enabled BOOLEAN NOT NULL DEFAULT true,
  pix_key_type TEXT DEFAULT 'CNPJ',
  pix_key DEFAULT '48.293.109/0001-92',
  pix_holder_name TEXT DEFAULT 'AURA PARFUMS HAUTE PARFUMERIE LTDA',
  pix_bank_name TEXT DEFAULT 'Itaú Unibanco',
  pix_instructions TEXT DEFAULT 'Escaneie o QR Code ou copie e cole a chave Pix. O pedido será processado após confirmação manual do comprovante.',
  mercadopago_enabled BOOLEAN NOT NULL DEFAULT false,
  mercadopago_status TEXT DEFAULT 'awaiting_config',
  mercadopago_client_id TEXT,
  mercadopago_client_secret TEXT,
  infinitepay_enabled BOOLEAN NOT NULL DEFAULT false,
  infinitepay_status TEXT DEFAULT 'awaiting_config',
  infinitepay_api_key TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY IF NOT EXISTS "Configuracoes de pagamento publicas para leitura"
  ON public.payment_settings FOR SELECT
  TO PUBLIC USING (true);

CREATE POLICY IF NOT EXISTS "Apenas admins podem gerenciar configuracoes de pagamento"
  ON public.payment_settings FOR ALL
  USING (public.is_admin());

INSERT INTO public.payment_settings (id, manual_pix_enabled, pix_key_type, pix_key, pix_holder_name, pix_bank_name)
VALUES ('gateway_config', true, 'CNPJ', '48.293.109/0001-92', 'AURA PARFUMS HAUTE PARFUMERIE LTDA', 'Itaú Unibanco')
ON CONFLICT (id) DO NOTHING;
