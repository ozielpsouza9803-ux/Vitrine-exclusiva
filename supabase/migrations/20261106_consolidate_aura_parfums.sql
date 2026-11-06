-- ==============================================================================
-- CONSOLIDAÇÃO E ÍNDICES DE COBERTURA — AURA PARFUMS
-- Projeto Supabase: AURA-PARFUMS (zfuqmqhirgbdxjlwhdqe)
-- Data: 2026-11-06
-- Alterações estritamente incrementais e idempotentes. NENHUM DROP ou DELETE.
-- ==============================================================================

-- 1. Índices de cobertura em chaves estrangeiras relacionais ausentes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_order ON public.inventory_movements(reference_order_id);
