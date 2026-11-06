-- ==============================================================================
-- MIGRAÇÃO INICIAL IDEMPOTENTE — AURA PARFUMS (HAUTE PARFUMERIE MULTIMARCAS)
-- Projeto Supabase: AURA-PARFUMS (zfuqmqhirgbdxjlwhdqe)
-- Região: sa-east-1
-- Data de Criação: 2026-11-06
-- ==============================================================================

-- Habilita extensão pgcrypto para geração segura de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 0. TABELA DE CONTROLE DE ACESSO ADMINISTRATIVO (RBAC SEGURO)
-- Nunca confiar em user_metadata do cliente. Permissões verificadas na tabela interna.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'inventory_manager')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT admin_users_user_id_key UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- Função de apoio segura para checagem em políticas RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 1. BRANDS (Marcas e Vitrines Oficiais)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  country_of_origin TEXT NOT NULL,
  founded_year INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  featured_order INTEGER NOT NULL DEFAULT 0,
  logo_symbol TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active);

-- ==============================================================================
-- 2. CATEGORIES (Categorias de Fragrâncias e Famílias)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ==============================================================================
-- 3. PRODUCTS (Cadastro de Perfumes, Concentrações e Pirâmide Olfativa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  concentration TEXT NOT NULL CHECK (concentration IN ('Extrait de Parfum', 'Eau de Parfum', 'Parfum', 'Eau de Toilette', 'Eau de Cologne')),
  olfactory_family TEXT NOT NULL,
  top_notes TEXT[] NOT NULL DEFAULT '{}',
  heart_notes TEXT[] NOT NULL DEFAULT '{}',
  base_notes TEXT[] NOT NULL DEFAULT '{}',
  volume_ml INTEGER NOT NULL CHECK (volume_ml > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  promotional_price NUMERIC(10,2) CHECK (promotional_price >= 0),
  sku TEXT NOT NULL UNIQUE,
  barcode_ean TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  primary_image_url TEXT,
  primary_image_alt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- ==============================================================================
-- 4. PRODUCT_IMAGES (Galeria de Fotos por Produto)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- ==============================================================================
-- 5. INVENTORY_STOCK (Estoque Físico Próprio, Localização no Galpão e Limiares)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  current_quantity INTEGER NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
  minimum_threshold INTEGER NOT NULL DEFAULT 2 CHECK (minimum_threshold >= 0),
  shelf_location TEXT NOT NULL DEFAULT 'Depósito Geral',
  reserved_online INTEGER NOT NULL DEFAULT 0 CHECK (reserved_online >= 0),
  last_counted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT inventory_stock_product_id_key UNIQUE (product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_stock_product ON public.inventory_stock(product_id);

-- ==============================================================================
-- 6. INVENTORY_MOVEMENTS (Auditoria de Entradas, Saídas e Ajustes Físicos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('ENTRADA', 'SAIDA_VENDA', 'AJUSTE_BALANCO', 'DEVOLUCAO', 'RESERVA_PIX')),
  quantity_delta INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  performed_by TEXT,
  reason TEXT,
  reference_order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON public.inventory_movements(created_at DESC);

-- ==============================================================================
-- 7. CUSTOMER_PROFILES (Perfis de Clientes e Preferências Olfativas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  cpf TEXT,
  favorite_families TEXT[] NOT NULL DEFAULT '{}',
  favorite_brand_ids UUID[] NOT NULL DEFAULT '{}',
  signature_notes TEXT[] NOT NULL DEFAULT '{}',
  saved_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.customer_profiles(email);

-- ==============================================================================
-- 8. ORDERS (Pedidos Online e Vendas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (shipping_fee >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'AGUARDANDO_PIX' CHECK (status IN ('AGUARDANDO_PIX', 'PAGO_CONFIRMADO', 'SEPARACAO_ESTOQUE', 'ENVIADO', 'ENTREGUE', 'CANCELADO')),
  payment_method TEXT NOT NULL DEFAULT 'PIX',
  shipping_address JSONB NOT NULL,
  tracking_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-- ==============================================================================
-- 9. ORDER_ITEMS (Itens dos Pedidos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  concentration TEXT NOT NULL,
  volume_ml INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ==============================================================================
-- 10. PIX_PAYMENTS (Chave Pix, QR Code Dinâmico e Conciliação)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pix_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  qr_code_base64 TEXT,
  qr_code_copy_paste TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'EXPIRED')),
  receipt_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pix_payments_order ON public.pix_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pix_payments_transaction ON public.pix_payments(transaction_id);

-- ==============================================================================
-- 11. BANNERS (Banners e Carrosséis de Alta Perfumaria)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_label TEXT,
  cta_link TEXT,
  image_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(active);

-- ==============================================================================
-- 12. SETTINGS (Configurações Gerais da Loja)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'store_config',
  store_name TEXT NOT NULL DEFAULT 'AURA Parfums',
  tagline TEXT DEFAULT 'Haute Parfumerie & Niche Fragrances',
  contact_email TEXT DEFAULT 'contato@auraparfums.com.br',
  contact_phone TEXT DEFAULT '(11) 98765-4321',
  pix_key_type TEXT DEFAULT 'CNPJ',
  pix_key TEXT DEFAULT '48.***.***/0001-92',
  free_shipping_threshold NUMERIC(10,2) DEFAULT 1500.00,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==============================================================================

-- 1. admin_users
CREATE POLICY "Superadmins e admins podem visualizar tabela de admin"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- 2. brands
CREATE POLICY "Vitrines ativas sao publicas para leitura"
  ON public.brands FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Apenas admins podem inserir, atualizar e excluir marcas"
  ON public.brands FOR ALL
  USING (public.is_admin());

-- 3. categories
CREATE POLICY "Categorias ativas sao publicas para leitura"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Apenas admins podem gerenciar categorias"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- 4. products
CREATE POLICY "Produtos ativos sao publicos para leitura"
  ON public.products FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "Apenas admins podem inserir, atualizar e arquivar produtos"
  ON public.products FOR ALL
  USING (public.is_admin());

-- 5. product_images
CREATE POLICY "Imagens de produtos sao publicas para leitura"
  ON public.product_images FOR SELECT
  TO PUBLIC USING (true);

CREATE POLICY "Apenas admins podem gerenciar galeria de fotos"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- 6. inventory_stock (Estoque Físico Protegido)
CREATE POLICY "Leitura de estoque restrita a administradores"
  ON public.inventory_stock FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Modificacao de estoque restrita a administradores"
  ON public.inventory_stock FOR ALL
  USING (public.is_admin());

-- 7. inventory_movements (Auditoria)
CREATE POLICY "Movimentacoes de estoque visiveis apenas para administradores"
  ON public.inventory_movements FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Insercao de movimentacao restrita a administradores"
  ON public.inventory_movements FOR INSERT
  WITH CHECK (public.is_admin());

-- 8. customer_profiles
CREATE POLICY "Clientes podem visualizar apenas seu proprio perfil"
  ON public.customer_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Clientes podem atualizar apenas seu proprio perfil"
  ON public.customer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Clientes podem criar seu proprio perfil ao cadastrar"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 9. orders
CREATE POLICY "Clientes podem visualizar apenas seus proprios pedidos"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id OR public.is_admin());

CREATE POLICY "Clientes podem criar pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

CREATE POLICY "Apenas admins podem alterar status de pedidos"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- 10. order_items
CREATE POLICY "Clientes podem ver itens dos seus proprios pedidos"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Insercao de itens associada ao pedido do cliente"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL OR public.is_admin())
    )
  );

-- 11. pix_payments
CREATE POLICY "Clientes podem ver comprovante Pix de seus proprios pedidos"
  ON public.pix_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = pix_payments.order_id
      AND (orders.customer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Apenas sistema ou admins podem conciliar Pix"
  ON public.pix_payments FOR ALL
  USING (public.is_admin());

-- 12. banners
CREATE POLICY "Banners ativos sao publicos para leitura"
  ON public.banners FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Apenas admins podem gerenciar banners"
  ON public.banners FOR ALL
  USING (public.is_admin());

-- 13. settings
CREATE POLICY "Configuracoes publicas da loja sao legiveis por todos"
  ON public.settings FOR SELECT
  TO PUBLIC USING (true);

CREATE POLICY "Apenas admins podem atualizar configuracoes"
  ON public.settings FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- CARGA INICIAL DE MARCAS E PRODUTOS (IDEMPOTENTE COM ON CONFLICT DO NOTHING)
-- ==============================================================================
INSERT INTO public.settings (id, store_name, tagline, contact_email)
VALUES ('store_config', 'AURA Parfums', 'Haute Parfumerie & Niche Fragrances', 'contato@auraparfums.com.br')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brands (id, name, slug, tagline, country_of_origin, founded_year, description, is_active, featured_order, logo_symbol)
VALUES
  ('c42f0a12-8874-4b52-944a-101100000001', 'Tom Ford Private Blend', 'tom-ford-private-blend', 'Ousadia arquitetônica e matérias-primas raras', 'Estados Unidos', 2006, 'Coleção pessoal de aromas exclusivos do designer, formulados com os extratos mais nobres da perfumaria mundial.', true, 1, 'TF'),
  ('c42f0a12-8874-4b52-944a-101100000002', 'House of Creed', 'house-of-creed', 'Sete gerações de perfumaria artesanal real', 'França', 1760, 'Criadores de fragrâncias icônicas para a realeza europeia desde o século XVIII, utilizando o método tradicional de infusão.', true, 2, 'CR'),
  ('c42f0a12-8874-4b52-944a-101100000003', 'Maison Francis Kurkdjian', 'maison-francis-kurkdjian', 'Precisão parisiense e luminosidade olfativa', 'França', 2009, 'A expressão da alta perfumaria contemporânea, combinando sofisticação arquitetural e fascínio magnético.', true, 3, 'MFK'),
  ('c42f0a12-8874-4b52-944a-101100000004', 'Amouage', 'amouage', 'O presente dos reis — Perfumaria de nicho do Omã', 'Omã', 1983, 'Composições opulentas e resinas preciosas como o mais puro incenso de Dhofar e rosas da montanha de Jebel Akhdar.', true, 4, 'AM')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (id, brand_id, name, slug, concentration, olfactory_family, top_notes, heart_notes, base_notes, volume_ml, price, sku, barcode_ean, status, is_featured, is_new_arrival, primary_image_url, primary_image_alt)
VALUES
  (
    'e71a0b34-9988-4e12-811c-202200000001',
    'c42f0a12-8874-4b52-944a-101100000003',
    'Baccarat Rouge 540 Extrait',
    'baccarat-rouge-540-extrait',
    'Extrait de Parfum',
    'Oriental / Âmbar',
    ARRAY['Amêndoa Amarga de Marrocos', 'Açafrão de Caxemira'],
    ARRAY['Jasmim Grandiflorum do Egito', 'Cedro da Virgínia'],
    ARRAY['Âmbar Cinzento Natural', 'Almíscar Amadeirado'],
    70,
    3450.00,
    'MFK-BR540-EXT-70',
    '3700559604123',
    'active',
    true,
    false,
    '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
    'Frasco de luxo Baccarat Rouge 540 com detalhes dourados lapidados'
  ),
  (
    'e71a0b34-9988-4e12-811c-202200000002',
    'c42f0a12-8874-4b52-944a-101100000002',
    'Aventus Haute Parfumerie',
    'aventus-haute-parfumerie',
    'Eau de Parfum',
    'Chipre',
    ARRAY['Abacaxi Real', 'Groselha Negra da Córsega', 'Bergamota Italiana'],
    ARRAY['Bétula Seca', 'Patchouli Intenso', 'Rosa de Marrocos'],
    ARRAY['Musgo de Carvalho', 'Âmbar Gris', 'Baunilha de Bourbon'],
    100,
    2890.00,
    'CR-AVT-EDP-100',
    '3508441001114',
    'active',
    true,
    false,
    '/src/assets/images/fragrance_flacon_gold_1793996141741.jpg',
    'Flacon Aventus Creed com acabamento preto e dourado sobre pedra basáltica'
  ),
  (
    'e71a0b34-9988-4e12-811c-202200000003',
    'c42f0a12-8874-4b52-944a-101100000001',
    'Oud Wood Intense Reserve',
    'oud-wood-intense-reserve',
    'Parfum',
    'Amadeirado',
    ARRAY['Cardamomo Selvagem', 'Pimenta de Sichuan'],
    ARRAY['Madeira de Oud Escura', 'Sândalo Cremoso', 'Pau-Rosa'],
    ARRAY['Vetiver Fumado', 'Fava Tonka Dourada', 'Âmbar Cristalino'],
    50,
    2420.00,
    'TF-OUD-INT-50',
    '888066060129',
    'active',
    true,
    true,
    '/src/assets/images/fragrance_niche_noir_1793996141909.jpg',
    'Tom Ford Oud Wood Reserva com placa de metal dourada escovada'
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.inventory_stock (product_id, current_quantity, minimum_threshold, shelf_location, reserved_online)
VALUES
  ('e71a0b34-9988-4e12-811c-202200000001', 8, 3, 'Cofre A - Prateleira 02', 1),
  ('e71a0b34-9988-4e12-811c-202200000002', 14, 5, 'Armário B - Gaveta 01', 2),
  ('e71a0b34-9988-4e12-811c-202200000003', 5, 2, 'Armário A - Gaveta 04', 0)
ON CONFLICT (product_id) DO NOTHING;
