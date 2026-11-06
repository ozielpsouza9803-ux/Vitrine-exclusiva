/**
 * @file src/services/contracts.ts
 * @description Contratos e interfaces abstratas para desacoplamento de infraestrutura futura:
 * Banco de Dados, Autenticação, Armazenamento de Imagens, Pagamentos Pix e Chatbot Concierge.
 * Nenhuma implementação mock ou armazenamento local falso é utilizada como substituto do banco.
 */

import {
  Brand,
  CategoryRecord,
  FragranceProduct,
  InventoryMovement,
  Order,
  CustomerProfile,
  PixPaymentPayload
} from '../types';

/**
 * Contrato para futuro provedor de Banco de Dados (PostgreSQL, Firestore ou API própria)
 */
export interface IDatabaseService {
  // Catálogo de Marcas
  getBrands(options?: { includeInactive?: boolean }): Promise<Brand[]>;
  getBrandById(id: string): Promise<Brand | null>;
  saveBrand(brand: Brand): Promise<Brand>;
  toggleBrandActive(id: string, isActive: boolean): Promise<void>;

  // Categorias de Perfumes
  getCategories(options?: { includeInactive?: boolean }): Promise<CategoryRecord[]>;
  getCategoryById(id: string): Promise<CategoryRecord | null>;
  saveCategory(category: CategoryRecord): Promise<CategoryRecord>;
  toggleCategoryActive(id: string, isActive: boolean): Promise<void>;
  
  // Catálogo de Fragrâncias
  getProducts(filters?: { brandId?: string; olfactoryFamily?: string; search?: string; includeInactive?: boolean; status?: string }): Promise<FragranceProduct[]>;
  getProductById(id: string): Promise<FragranceProduct | null>;
  saveProduct(product: FragranceProduct): Promise<FragranceProduct | void>;
  toggleProductStatus(id: string, status: FragranceProduct['status']): Promise<void>;
  
  // Estoque Físico
  getInventoryMovements(productId?: string): Promise<InventoryMovement[]>;
  recordStockMovement(movement: Omit<InventoryMovement, 'id' | 'timestamp'>): Promise<void>;
  
  // Pedidos e Vendas
  getOrders(customerProfileId?: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(order: Order): Promise<string>;
  updateOrderStatus(orderId: string, status: Order['status']): Promise<void>;
}

/**
 * Contrato para futuro provedor de Autenticação (OAuth, JWT ou Auth Provider)
 */
export interface IAuthService {
  getCurrentUser(): Promise<{ id: string; email: string; role: 'customer' | 'admin' } | null>;
  loginCustomer(email: string, code?: string): Promise<void>;
  loginAdmin(credentials: { email: string; token: string }): Promise<boolean>;
  logout(): Promise<void>;
}

/**
 * Contrato para futuro provedor de Armazenamento de Mídia (Cloud Storage / S3 / CDN)
 */
export interface IStorageService {
  uploadProductImage(file: Blob, path: string): Promise<{ downloadUrl: string }>;
  uploadBrandAsset(file: Blob, path: string): Promise<{ downloadUrl: string }>;
}

/**
 * Contrato para futuro Gateway de Pagamentos Pix (Banco Central / API Bancária)
 */
export interface IPixPaymentService {
  generatePixCharge(orderId: string, amount: number): Promise<PixPaymentPayload>;
  verifyPaymentStatus(transactionId: string): Promise<'PENDING' | 'APPROVED' | 'EXPIRED'>;
}

/**
 * Contrato para futuro Concierge Olfativo / Chatbot Inteligente (Gemini AI API)
 */
export interface IChatbotService {
  getFragranceRecommendation(prompt: string, customerPreferences?: Partial<CustomerProfile>): Promise<{
    recommendedProductIds: string[];
    explanation: string;
    suggestedNotes: string[];
  }>;
}
