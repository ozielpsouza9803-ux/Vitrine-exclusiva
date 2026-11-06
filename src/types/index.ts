/**
 * @file src/types/index.ts
 * @description Definições tipadas centrais para a plataforma de Perfumaria Multimarcas AURA Parfums.
 * Estruturada para desacoplamento rigoroso entre Área Pública, Área do Cliente e Painel Administrativo.
 */

export type ConcentrationType =
  | 'Extrait de Parfum'
  | 'Eau de Parfum'
  | 'Parfum'
  | 'Eau de Toilette'
  | 'Eau de Cologne';

export type OlfactoryFamily =
  | 'Amadeirado'
  | 'Oriental / Âmbar'
  | 'Floral'
  | 'Cítrico'
  | 'Gourmand'
  | 'Couro'
  | 'Aromático Fougère'
  | 'Chipre';

export interface OlfactoryPyramid {
  topNotes: string[];    // Notas de Topo / Saída
  heartNotes: string[];  // Notas de Coração / Corpo
  baseNotes: string[];   // Notas de Fundo / Base
}

/**
 * Marca / Casa de Perfumaria Parceira
 * Permite vitrines exclusivas e customizadas para cada marca.
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  countryOfOrigin: string;
  foundedYear?: number;
  description: string;
  isActive: boolean;
  featuredOrder: number;
  bannerImageUrl?: string;
  logoSymbol?: string;
}

/**
 * Categoria de Perfumaria
 */
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

/**
 * Produto / Fragrância
 */
export interface FragranceProduct {
  id: string;
  brandId: string;
  brandName: string;
  categoryId?: string;
  name: string;
  slug: string;
  concentration: ConcentrationType;
  olfactoryFamily: OlfactoryFamily;
  olfactoryPyramid: OlfactoryPyramid;
  volumeMl: number;
  price: number;
  promotionalPrice?: number;
  sku: string;
  barcodeEan?: string;
  
  // Estoque Físico
  physicalStock: {
    currentQuantity: number;
    minimumThreshold: number; // Ponto de reposição
    shelfLocation: string;    // Prateleira / Galpão / Gaveta
    reservedOnline: number;   // Quantidade reservada aguardando confirmação Pix
  };
  
  status: 'active' | 'draft' | 'archived' | 'out_of_stock';
  isFeatured: boolean;
  isNewArrival: boolean;
  images: {
    primary: string;
    gallery?: string[];
    alt: string;
  };
}

/**
 * Movimentação e Auditoria de Estoque Físico
 */
export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  type: 'ENTRADA' | 'SAIDA_VENDA' | 'AJUSTE_BALANCO' | 'DEVOLUCAO';
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  performedBy: string;
  reason: string;
  timestamp: string;
}

/**
 * Pedidos e Vendas Online
 */
export type OrderStatus =
  | 'AGUARDANDO_PIX'
  | 'PAGO_CONFIRMADO'
  | 'SEPARACAO_ESTOQUE'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface OrderItem {
  productId: string;
  productName: string;
  brandName: string;
  concentration: ConcentrationType;
  volumeMl: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerProfileId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'PIX';
  pixTransactionId?: string;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Área do Cliente: Perfil e Preferências Olfativas
 */
export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf?: string;
  favoriteFamilies: OlfactoryFamily[];
  favoriteBrands: string[]; // Brand IDs
  signatureNotes: string[];
  savedAddresses: Array<{
    id: string;
    label: string;
    zipCode: string;
    street: string;
    number: string;
    city: string;
    state: string;
    isDefault: boolean;
  }>;
}

/**
 * Transação Pix para pagamento instantâneo
 */
export interface PixPaymentPayload {
  transactionId: string;
  orderId: string;
  amount: number;
  qrCodeBase64?: string;
  qrCodeCopyPaste: string;
  expiresAt: string;
  status: 'PENDING' | 'APPROVED' | 'EXPIRED';
}

/**
 * Configurações da Central de Pagamentos (Pix Manual, Mercado Pago, InfinitePay)
 */
export interface PaymentSettingsRecord {
  id: string;
  manualPixEnabled: boolean;
  pixKeyType: string;
  pixKey: string;
  pixHolderName: string;
  pixBankName: string;
  pixInstructions: string;
  mercadopagoEnabled: boolean;
  mercadopagoStatus: 'active' | 'disabled' | 'awaiting_config' | 'error' | 'validated';
  mercadopagoClientId?: string;
  mercadopagoClientSecret?: string;
  infinitepayEnabled: boolean;
  infinitepayStatus: 'active' | 'disabled' | 'awaiting_config' | 'error' | 'validated';
  infinitepayApiKey?: string;
}

/**
 * Identificador de Módulo da Aplicação
 */
export type AppModule = 'public' | 'customer' | 'admin';
