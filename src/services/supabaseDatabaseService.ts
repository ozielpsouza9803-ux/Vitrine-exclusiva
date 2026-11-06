/**
 * @file src/services/supabaseDatabaseService.ts
 * @description Implementação concreta do contrato IDatabaseService utilizando o Supabase.
 * Conecta as vitrines, catálogo, estoque físico e pedidos às tabelas reais do banco de dados.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { IDatabaseService } from './contracts';
import {
  Brand,
  FragranceProduct,
  InventoryMovement,
  Order,
} from '../types';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../config/constants';

export class SupabaseDatabaseService implements IDatabaseService {
  // ==========================================
  // Catálogo de Marcas e Vitrines
  // ==========================================
  async getBrands(): Promise<Brand[]> {
    if (!isSupabaseConfigured) {
      return INITIAL_BRANDS;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('featured_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return INITIAL_BRANDS;
      }

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
    } catch {
      return INITIAL_BRANDS;
    }
  }

  async getBrandById(id: string): Promise<Brand | null> {
    const brands = await this.getBrands();
    return brands.find((b) => b.id === id) || null;
  }

  async saveBrand(brand: Brand): Promise<void> {
    if (!isSupabaseConfigured) return;

    await supabase.from('brands').upsert({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      tagline: brand.tagline,
      country_of_origin: brand.countryOfOrigin,
      founded_year: brand.foundedYear,
      description: brand.description,
      is_active: brand.isActive,
      featured_order: brand.featuredOrder,
      logo_symbol: brand.logoSymbol,
      banner_url: brand.bannerImageUrl,
      updated_at: new Date().toISOString(),
    });
  }

  // ==========================================
  // Catálogo de Produtos e Fragrâncias
  // ==========================================
  async getProducts(filters?: {
    brandId?: string;
    olfactoryFamily?: string;
    search?: string;
  }): Promise<FragranceProduct[]> {
    if (!isSupabaseConfigured) {
      return this.filterInitialProducts(filters);
    }

    try {
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
          )
        `)
        .eq('status', 'active');

      if (filters?.brandId && filters.brandId !== 'all') {
        query = query.eq('brand_id', filters.brandId);
      }

      if (filters?.olfactoryFamily && filters.olfactoryFamily !== 'all') {
        query = query.eq('olfactory_family', filters.olfactoryFamily);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return this.filterInitialProducts(filters);
      }

      return data.map((item) => {
        const stock = Array.isArray(item.inventory_stock)
          ? item.inventory_stock[0]
          : item.inventory_stock;

        return {
          id: item.id,
          brandId: item.brand_id,
          brandName: item.brands?.name || 'Casa de Nicho',
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
            shelfLocation: stock?.shelf_location ?? 'Galpão Geral',
            reservedOnline: stock?.reserved_online ?? 0,
          },
          status: item.status,
          isFeatured: item.is_featured,
          isNewArrival: item.is_new_arrival,
          images: {
            primary: item.primary_image_url || '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
            alt: item.primary_image_alt || item.name,
          },
        };
      });
    } catch {
      return this.filterInitialProducts(filters);
    }
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
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  }

  async saveProduct(product: FragranceProduct): Promise<void> {
    if (!isSupabaseConfigured) return;

    await supabase.from('products').upsert({
      id: product.id,
      brand_id: product.brandId,
      name: product.name,
      slug: product.slug,
      concentration: product.concentration,
      olfactory_family: product.olfactoryFamily,
      top_notes: product.olfactoryPyramid.topNotes,
      heart_notes: product.olfactoryPyramid.heartNotes,
      base_notes: product.olfactoryPyramid.baseNotes,
      volume_ml: product.volumeMl,
      price: product.price,
      sku: product.sku,
      barcode_ean: product.barcodeEan,
      status: product.status,
      is_featured: product.isFeatured,
      is_new_arrival: product.isNewArrival,
      primary_image_url: product.images.primary,
      primary_image_alt: product.images.alt,
      updated_at: new Date().toISOString(),
    });
  }

  // ==========================================
  // Estoque Físico e Auditoria
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

    await supabase.from('inventory_movements').insert({
      product_id: movement.productId,
      movement_type: movement.type,
      quantity_delta: movement.quantityDelta,
      previous_quantity: movement.previousQuantity,
      new_quantity: movement.newQuantity,
      performed_by: movement.performedBy,
      reason: movement.reason,
    });
  }

  // ==========================================
  // Pedidos e Vendas Online
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

    // Inserir itens
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
