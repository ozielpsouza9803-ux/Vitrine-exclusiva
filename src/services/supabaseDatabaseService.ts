/**
 * @file src/services/supabaseDatabaseService.ts
 * @description Implementação concreta do contrato IDatabaseService utilizando o Supabase real.
 * Elimina a dependência de dados fictícios quando a conexão com o banco estiver disponível.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IDatabaseService } from './contracts';
import {
  Brand,
  FragranceProduct,
  InventoryMovement,
  Order,
  CustomerProfile,
} from '../types';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../config/constants';

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface BannerRecord {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  imageUrl: string;
  active: boolean;
  displayOrder: number;
}

export interface StorefrontSettingsRecord {
  id: string;
  storeName: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  announcement?: string;
  freeShippingThreshold?: number;
  maintenanceMode: boolean;
  updatedAt?: string;
}

export class SupabaseDatabaseService implements IDatabaseService {
  private lastErrors: Record<string, string> = {};

  getLastError(table: string): string | undefined {
    return this.lastErrors[table];
  }

  getAllLastErrors(): Record<string, string> {
    return { ...this.lastErrors };
  }

  // ==========================================
  // 1. Catálogo de Marcas e Vitrines Oficiais
  // ==========================================
  async getBrands(options?: { includeInactive?: boolean }): Promise<Brand[]> {
    if (!isSupabaseConfigured) {
      return INITIAL_BRANDS;
    }

    let query = supabase
      .from('brands')
      .select('*')
      .order('featured_order', { ascending: true });

    if (!options?.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      this.lastErrors['brands'] = error.message;
      console.warn('[SupabaseDatabaseService] Erro ao consultar brands:', error.message);
      return [];
    }

    delete this.lastErrors['brands'];
    if (!data) return [];

    return data.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      tagline: b.tagline || '',
      countryOfOrigin: b.country_of_origin,
      foundedYear: b.founded_year,
      description: b.description || '',
      isActive: b.is_active,
      featuredOrder: b.featured_order,
      logoSymbol: b.logo_symbol || undefined,
      bannerImageUrl: b.banner_url || undefined,
    }));
  }

  async getBrandById(id: string): Promise<Brand | null> {
    const brands = await this.getBrands({ includeInactive: true });
    return brands.find((b) => b.id === id) || null;
  }

  async saveBrand(brand: Brand): Promise<Brand> {
    if (!isSupabaseConfigured) return brand;

    const payload: Record<string, any> = {
      name: brand.name,
      slug: brand.slug || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: brand.tagline || null,
      country_of_origin: brand.countryOfOrigin || 'França',
      founded_year: brand.foundedYear || new Date().getFullYear(),
      description: brand.description || null,
      is_active: brand.isActive ?? true,
      featured_order: brand.featuredOrder ?? 0,
      logo_symbol: brand.logoSymbol || null,
      banner_url: brand.bannerImageUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (brand.id && !brand.id.startsWith('temp-')) {
      payload.id = brand.id;
    }

    const { data, error } = await supabase
      .from('brands')
      .upsert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Falha ao salvar marca: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      tagline: data.tagline || '',
      countryOfOrigin: data.country_of_origin,
      foundedYear: data.founded_year,
      description: data.description || '',
      isActive: data.is_active,
      featuredOrder: data.featured_order,
      logoSymbol: data.logo_symbol || undefined,
      bannerImageUrl: data.banner_url || undefined,
    };
  }

  async toggleBrandActive(id: string, isActive: boolean): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('brands')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Falha ao alterar status da marca: ${error.message}`);
    }
  }

  // ==========================================
  // 2. Categorias de Perfumes
  // ==========================================
  async getCategories(options?: { includeInactive?: boolean }): Promise<CategoryRecord[]> {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!options?.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      this.lastErrors['categories'] = error.message;
      console.warn('[SupabaseDatabaseService] Erro ao consultar categories:', error.message);
      return [];
    }

    delete this.lastErrors['categories'];
    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || undefined,
      isActive: c.is_active,
      displayOrder: c.display_order,
    }));
  }

  async getCategoryById(id: string): Promise<CategoryRecord | null> {
    const categories = await this.getCategories({ includeInactive: true });
    return categories.find((c) => c.id === id) || null;
  }

  async saveCategory(category: CategoryRecord): Promise<CategoryRecord> {
    if (!isSupabaseConfigured) return category;

    const payload: Record<string, any> = {
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: category.description || null,
      is_active: category.isActive ?? true,
      display_order: category.displayOrder ?? 0,
    };

    if (category.id && !category.id.startsWith('temp-')) {
      payload.id = category.id;
    }

    const { data, error } = await supabase
      .from('categories')
      .upsert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Falha ao salvar categoria: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      isActive: data.is_active,
      displayOrder: data.display_order,
    };
  }

  async toggleCategoryActive(id: string, isActive: boolean): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      throw new Error(`Falha ao alterar status da categoria: ${error.message}`);
    }
  }

  // ==========================================
  // 3. Catálogo de Produtos e Fragrâncias Reais
  // ==========================================
  async getProducts(filters?: {
    brandId?: string;
    olfactoryFamily?: string;
    search?: string;
    includeInactive?: boolean;
    status?: string;
  }): Promise<FragranceProduct[]> {
    if (!isSupabaseConfigured) {
      return this.filterInitialProducts(filters);
    }

    let query = supabase
      .from('products')
      .select(`
        *,
        brands ( name ),
        inventory_stock (
          current_quantity,
          minimum_threshold,
          shelf_location,
          reserved_online
        ),
        product_images (
          image_url,
          alt_text,
          display_order,
          is_primary
        )
      `)
      .order('created_at', { ascending: false });

    if (!filters?.includeInactive) {
      query = query.eq('status', 'active');
    } else if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.brandId && filters.brandId !== 'all') {
      query = query.eq('brand_id', filters.brandId);
    }

    if (filters?.olfactoryFamily && filters.olfactoryFamily !== 'all') {
      query = query.eq('olfactory_family', filters.olfactoryFamily);
    }

    const { data, error } = await query;

    if (error) {
      this.lastErrors['products'] = error.message;
      console.warn('[SupabaseDatabaseService] Erro ao consultar products:', error.message);
      return [];
    }

    delete this.lastErrors['products'];

    if (!data) return [];

    return data.map((item) => {
      const stock = Array.isArray(item.inventory_stock)
        ? item.inventory_stock[0]
        : item.inventory_stock;

      const galleryImages = (item.product_images || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.image_url);

      return {
        id: item.id,
        brandId: item.brand_id,
        brandName: item.brands?.name || 'Casa de Nicho',
        categoryId: item.category_id || undefined,
        name: item.name,
        slug: item.slug,
        concentration: item.concentration,
        olfactoryFamily: item.olfactory_family,
        olfactoryPyramid: {
          topNotes: item.top_notes || [],
          heartNotes: item.heart_notes || [],
          baseNotes: item.base_notes || [],
        },
        volumeMl: item.volume_ml,
        price: Number(item.price),
        promotionalPrice: item.promotional_price ? Number(item.promotional_price) : undefined,
        sku: item.sku,
        barcodeEan: item.barcode_ean || undefined,
        physicalStock: {
          currentQuantity: stock?.current_quantity ?? 0,
          minimumThreshold: stock?.minimum_threshold ?? 2,
          shelfLocation: stock?.shelf_location ?? 'Depósito Geral',
          reservedOnline: stock?.reserved_online ?? 0,
        },
        status: item.status,
        isFeatured: item.is_featured,
        isNewArrival: item.is_new_arrival,
        images: {
          primary: item.primary_image_url || '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
          gallery: galleryImages.length > 0 ? galleryImages : undefined,
          alt: item.primary_image_alt || item.name,
        },
      };
    });
  }

  private filterInitialProducts(filters?: {
    brandId?: string;
    olfactoryFamily?: string;
    search?: string;
  }): FragranceProduct[] {
    return INITIAL_PRODUCTS.filter((p) => {
      const matchBrand = !filters?.brandId || filters.brandId === 'all' || p.brandId === filters.brandId;
      const matchFamily =
        !filters?.olfactoryFamily || filters.olfactoryFamily === 'all' || p.olfactoryFamily === filters.olfactoryFamily;
      const matchSearch =
        !filters?.search ||
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.brandName.toLowerCase().includes(filters.search.toLowerCase());
      return matchBrand && matchFamily && matchSearch;
    });
  }

  async getProductById(id: string): Promise<FragranceProduct | null> {
    const products = await this.getProducts({ includeInactive: true });
    return products.find((p) => p.id === id) || null;
  }

  async saveProduct(product: FragranceProduct): Promise<FragranceProduct> {
    if (!isSupabaseConfigured) return product;

    const payload: Record<string, any> = {
      brand_id: product.brandId,
      category_id: product.categoryId || null,
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      concentration: product.concentration,
      olfactory_family: product.olfactoryFamily,
      top_notes: product.olfactoryPyramid.topNotes || [],
      heart_notes: product.olfactoryPyramid.heartNotes || [],
      base_notes: product.olfactoryPyramid.baseNotes || [],
      volume_ml: Number(product.volumeMl) || 50,
      price: Number(product.price) || 0,
      promotional_price: product.promotionalPrice ? Number(product.promotionalPrice) : null,
      sku: product.sku || `AURA-${Date.now().toString(36).toUpperCase()}`,
      barcode_ean: product.barcodeEan || null,
      status: product.status || 'active',
      is_featured: product.isFeatured ?? false,
      is_new_arrival: product.isNewArrival ?? false,
      primary_image_url: product.images.primary || '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
      primary_image_alt: product.images.alt || product.name,
      updated_at: new Date().toISOString(),
    };

    if (product.id && !product.id.startsWith('temp-')) {
      payload.id = product.id;
    }

    const { data: savedProduct, error } = await supabase
      .from('products')
      .upsert(payload)
      .select('*')
      .single();

    if (error || !savedProduct) {
      throw new Error(`Falha ao salvar produto: ${error?.message || 'Erro desconhecido'}`);
    }

    const productId = savedProduct.id;

    // Save/Update Inventory Stock
    const stockPayload = {
      product_id: productId,
      current_quantity: Number(product.physicalStock?.currentQuantity) || 0,
      minimum_threshold: Number(product.physicalStock?.minimumThreshold) || 2,
      shelf_location: product.physicalStock?.shelfLocation || 'Depósito Geral',
      reserved_online: Number(product.physicalStock?.reservedOnline) || 0,
      updated_at: new Date().toISOString(),
    };

    const { error: stockError } = await supabase
      .from('inventory_stock')
      .upsert(stockPayload, { onConflict: 'product_id' });

    if (stockError) {
      console.warn('[SupabaseDatabaseService] Aviso ao atualizar estoque físico:', stockError.message);
    }

    // Save product images gallery if provided
    if (product.images.gallery && product.images.gallery.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', productId);

      const imagesPayload = product.images.gallery.map((url, index) => ({
        product_id: productId,
        image_url: url,
        alt_text: `${product.name} - Imagem ${index + 1}`,
        display_order: index + 1,
        is_primary: false,
      }));

      await supabase.from('product_images').insert(imagesPayload);
    }

    // Record stock movement audit entry
    try {
      await supabase.from('inventory_movements').insert({
        product_id: productId,
        movement_type: product.id ? 'AJUSTE_BALANCO' : 'ENTRADA',
        quantity_delta: Number(product.physicalStock?.currentQuantity) || 0,
        previous_quantity: 0,
        new_quantity: Number(product.physicalStock?.currentQuantity) || 0,
        performed_by: 'Painel Admin AURA',
        reason: product.id ? 'Atualização de produto/estoque via Painel Admin' : 'Cadastro inicial de fragrância',
      });
    } catch {
      // Non-blocking
    }

    return {
      ...product,
      id: productId,
    };
  }

  async toggleProductStatus(id: string, status: FragranceProduct['status']): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Falha ao alterar status da fragrância: ${error.message}`);
    }
  }

  // ==========================================
  // 4. Banners de Campanha
  // ==========================================
  async getBanners(): Promise<BannerRecord[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error) {
      this.lastErrors['banners'] = error.message;
      console.warn('[SupabaseDatabaseService] Erro ao consultar banners:', error.message);
      return [];
    }

    delete this.lastErrors['banners'];
    return (data || []).map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || undefined,
      ctaLabel: b.cta_label || undefined,
      ctaLink: b.cta_link || undefined,
      imageUrl: b.image_url,
      active: b.active,
      displayOrder: b.display_order,
    }));
  }

  // ==========================================
  // 5. Configurações Públicas da Loja (storefront_settings)
  // ==========================================
  async getStorefrontSettings(): Promise<StorefrontSettingsRecord | null> {
    if (!isSupabaseConfigured) return null;

    // Fonte oficial pública: storefront_settings
    const { data: sfData, error: sfError } = await supabase
      .from('storefront_settings')
      .select('*')
      .eq('id', 'public')
      .maybeSingle();

    if (!sfError && sfData) {
      delete this.lastErrors['storefront_settings'];
      return {
        id: sfData.id,
        storeName: sfData.store_name || 'AURA Parfums',
        tagline: sfData.tagline || undefined,
        contactEmail: sfData.contact_email || undefined,
        contactPhone: sfData.contact_phone || undefined,
        logoUrl: sfData.logo_url || undefined,
        announcement: sfData.announcement || undefined,
        freeShippingThreshold: sfData.free_shipping_threshold ? Number(sfData.free_shipping_threshold) : undefined,
        maintenanceMode: Boolean(sfData.maintenance_mode),
        updatedAt: sfData.updated_at,
      };
    }

    if (sfError) {
      this.lastErrors['storefront_settings'] = sfError.message;
    }

    // Preservar compatibilidade com a tabela settings caso storefront_settings não esteja povoada
    const { data: stData, error: stError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'store_config')
      .maybeSingle();

    if (!stError && stData) {
      delete this.lastErrors['settings'];
      return {
        id: stData.id,
        storeName: stData.store_name || 'AURA Parfums',
        tagline: stData.tagline || undefined,
        contactEmail: stData.contact_email || undefined,
        contactPhone: stData.contact_phone || undefined,
        freeShippingThreshold: stData.free_shipping_threshold ? Number(stData.free_shipping_threshold) : undefined,
        maintenanceMode: Boolean(stData.maintenance_mode),
        updatedAt: stData.updated_at,
      };
    }

    return null;
  }

  // ==========================================
  // 6. Perfis de Clientes e Assinatura Olfativa
  // ==========================================
  async getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name || '',
      email: data.email,
      phone: data.phone || '',
      cpf: data.cpf || undefined,
      favoriteFamilies: data.favorite_families || [],
      favoriteBrands: data.favorite_brand_ids || [],
      signatureNotes: data.signature_notes || [],
      savedAddresses: data.saved_addresses || [],
    };
  }

  async saveCustomerProfile(profile: CustomerProfile): Promise<void> {
    if (!isSupabaseConfigured || !profile.id) return;

    const { error } = await supabase.from('customer_profiles').upsert({
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      phone: profile.phone || null,
      cpf: profile.cpf || null,
      favorite_families: profile.favoriteFamilies || [],
      favorite_brand_ids: profile.favoriteBrands || [],
      signature_notes: profile.signatureNotes || [],
      saved_addresses: profile.savedAddresses || [],
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Falha ao salvar perfil de cliente: ${error.message}`);
    }
  }

  // ==========================================
  // 7. Estoque Físico e Auditoria
  // ==========================================
  async getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase
        .from('inventory_movements')
        .select(`*, products ( name, brands ( name ) )`)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((m) => ({
        id: m.id,
        productId: m.product_id,
        productName: m.products?.name || 'Perfume',
        brandName: m.products?.brands?.name || 'Casa',
        type: m.movement_type,
        quantityDelta: m.quantity_delta,
        previousQuantity: m.previous_quantity,
        newQuantity: m.new_quantity,
        performedBy: m.performed_by || 'Admin',
        reason: m.reason || '',
        timestamp: m.created_at,
      }));
    } catch {
      return [];
    }
  }

  async recordStockMovement(movement: Omit<InventoryMovement, 'id' | 'timestamp'>): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('inventory_movements').insert({
      product_id: movement.productId,
      movement_type: movement.type,
      quantity_delta: movement.quantityDelta,
      previous_quantity: movement.previousQuantity,
      new_quantity: movement.newQuantity,
      performed_by: movement.performedBy,
      reason: movement.reason,
    });

    if (error) {
      throw new Error(`Falha ao registrar movimentação de estoque: ${error.message}`);
    }
  }

  // ==========================================
  // 6. Pedidos e Vendas Online
  // ==========================================
  async getOrders(customerProfileId?: string): Promise<Order[]> {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .order('created_at', { ascending: false });

      if (customerProfileId) {
        query = query.eq('customer_id', customerProfileId);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        customerProfileId: o.customer_id || '',
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone || '',
        items: (o.order_items || []).map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          brandName: item.brand_name,
          concentration: item.concentration,
          volumeMl: item.volume_ml,
          unitPrice: Number(item.unit_price),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
        })),
        subtotal: Number(o.subtotal),
        shippingFee: Number(o.shipping_fee),
        total: Number(o.total),
        status: o.status,
        paymentMethod: 'PIX',
        shippingAddress: o.shipping_address || {},
        trackingCode: o.tracking_code || undefined,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      }));
    } catch {
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id) || null;
  }

  async createOrder(order: Order): Promise<string> {
    if (!isSupabaseConfigured) return order.id;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: order.orderNumber,
        customer_id: order.customerProfileId || null,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee,
        total: order.total,
        status: order.status,
        payment_method: 'PIX',
        shipping_address: order.shippingAddress,
      })
      .select('id')
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message || 'Falha ao gravar pedido');
    }

    if (order.items && order.items.length > 0) {
      await supabase.from('order_items').insert(
        order.items.map((i) => ({
          order_id: orderData.id,
          product_id: i.productId,
          product_name: i.productName,
          brand_name: i.brandName,
          concentration: i.concentration,
          volume_ml: i.volumeMl,
          unit_price: i.unitPrice,
          quantity: i.quantity,
          subtotal: i.subtotal,
        }))
      );
    }

    return orderData.id;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (!isSupabaseConfigured) return;

    await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
  }
}

export const supabaseDatabaseService = new SupabaseDatabaseService();
