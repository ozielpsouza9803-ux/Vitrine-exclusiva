-- ==============================================================================
-- CORREÇÃO DE PERMISSÕES DA FUNÇÃO is_admin() — AURA PARFUMS
-- Projeto Supabase: AURA-PARFUMS (zfuqmqhirgbdxjlwhdqe)
-- Data: 2026-11-06
-- Não recria tabelas, não apaga dados e preserva integralmente as regras de RLS.
-- ==============================================================================

-- 1. Redefinição defensiva da função is_admin() com retorno FALSE imediato para anônimos
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Se o usuário não está autenticado, retorna false de imediato sem consultar tabelas
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Concessão explícita de execução para os papéis de API do PostgREST
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 3. Concessão explícita de leitura no schema public para os papéis anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;

-- 4. Otimização das políticas SELECT para leitura pública transparente
-- Permite leitura de itens ativos para qualquer visitante (anon e authenticated),
-- e permite aos administradores visualizarem itens inativos ou rascunhos.
DROP POLICY IF EXISTS "Vitrines ativas sao publicas para leitura" ON public.brands;
CREATE POLICY "Vitrines ativas sao publicas para leitura"
  ON public.brands FOR SELECT
  USING (is_active = true OR (auth.uid() IS NOT NULL AND public.is_admin()));

DROP POLICY IF EXISTS "Categorias ativas sao publicas para leitura" ON public.categories;
CREATE POLICY "Categorias ativas sao publicas para leitura"
  ON public.categories FOR SELECT
  USING (is_active = true OR (auth.uid() IS NOT NULL AND public.is_admin()));

DROP POLICY IF EXISTS "Produtos ativos sao publicos para leitura" ON public.products;
CREATE POLICY "Produtos ativos sao publicos para leitura"
  ON public.products FOR SELECT
  USING (status = 'active' OR (auth.uid() IS NOT NULL AND public.is_admin()));

DROP POLICY IF EXISTS "Banners ativos sao publicos para leitura" ON public.banners;
CREATE POLICY "Banners ativos sao publicos para leitura"
  ON public.banners FOR SELECT
  USING (active = true OR (auth.uid() IS NOT NULL AND public.is_admin()));
