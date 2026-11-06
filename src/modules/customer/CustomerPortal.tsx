import React, { useState } from 'react';
import { Package, User, Heart, MapPin, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoldButton } from '../../components/ui/GoldButton';
import { GoldBadge } from '../../components/ui/GoldBadge';
import { LuxuryCard } from '../../components/ui/LuxuryCard';
import { Order, CustomerProfile } from '../../types';

// Perfil fundacional estruturado para a área do cliente
const FOUNDATION_CUSTOMER: CustomerProfile = {
  id: 'cust-9921',
  fullName: 'Oziel Souza',
  email: 'ozielpsouza9803@gmail.com',
  phone: '(11) 98765-4321',
  cpf: '***.458.918-**',
  favoriteFamilies: ['Amadeirado', 'Oriental / Âmbar'],
  favoriteBrands: ['brand-mfk', 'brand-tom-ford'],
  signatureNotes: ['Oud', 'Âmbar Gris', 'Cardamomo'],
  savedAddresses: [
    {
      id: 'addr-01',
      label: 'Residencial Principal',
      street: 'Av. Brigadeiro Faria Lima',
      number: '3477',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04538-133',
      isDefault: true,
    },
  ],
};

// Pedido demonstrativo para validação estrutural do fluxo do cliente
const FOUNDATION_ORDERS: Order[] = [
  {
    id: 'ord-8831',
    orderNumber: 'AURA-2026-0884',
    customerProfileId: 'cust-9921',
    customerName: 'Oziel Souza',
    customerEmail: 'ozielpsouza9803@gmail.com',
    customerPhone: '(11) 98765-4321',
    items: [
      {
        productId: 'frag-001',
        productName: 'Baccarat Rouge 540 Extrait',
        brandName: 'Maison Francis Kurkdjian',
        concentration: 'Extrait de Parfum',
        volumeMl: 70,
        unitPrice: 3450.00,
        quantity: 1,
        subtotal: 3450.00,
      },
    ],
    subtotal: 3450.00,
    shippingFee: 0.00,
    total: 3450.00,
    status: 'SEPARACAO_ESTOQUE',
    paymentMethod: 'PIX',
    pixTransactionId: 'E23049102934891238491028',
    shippingAddress: {
      street: 'Av. Brigadeiro Faria Lima',
      number: '3477',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04538-133',
    },
    trackingCode: 'BR-AURA-884912SP',
    createdAt: '2026-11-06T10:15:00Z',
    updatedAt: '2026-11-06T10:35:00Z',
  },
];

export const CustomerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'preferences' | 'addresses'>('orders');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Customer Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#26241E]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1">
            <span>Área Exclusiva do Cliente</span>
            <span aria-hidden="true">·</span>
            <span>Ateliê AURA Privilège</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F7F7F6]">
            {FOUNDATION_CUSTOMER.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-editorial">
            {FOUNDATION_CUSTOMER.email} · Membro de Alta Perfumaria
          </p>
        </div>

        {/* Tab Navigation buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#141414] border border-[#26241E]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Meus Pedidos ({FOUNDATION_ORDERS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Preferências Olfativas</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Endereço de Entrega</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Cadastro</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mt-8">
        {/* 1. Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-luxury text-xl text-white">Histórico de Compras</h2>
              <span className="text-xs text-neutral-400">
                Baixas imediatas em estoque físico após liquidação Pix
              </span>
            </div>

            {FOUNDATION_ORDERS.map((order) => (
              <LuxuryCard key={order.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#26241E]">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif-luxury text-base text-[#ECC876] font-semibold tracking-wide">
                        {order.orderNumber}
                      </span>
                      <GoldBadge variant="gold-hairline">
                        {order.status === 'SEPARACAO_ESTOQUE'
                          ? 'Separação no Estoque Físico'
                          : order.status}
                      </GoldBadge>
                    </div>
                    <span className="text-xs text-neutral-400 mt-1 block">
                      Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block">Forma de Pagamento</span>
                      <span className="text-neutral-200 font-medium flex items-center gap-1.5 mt-0.5">
                        <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Pix Instantâneo (Confirmado)
                      </span>
                    </div>

                    <div className="border-l border-[#26241E] pl-4">
                      <span className="text-neutral-400 block">Total do Pedido</span>
                      <span className="font-serif-luxury text-base text-[#ECC876] font-semibold tabular-nums">
                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-4 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-400 uppercase tracking-wider block text-[10px]">
                          {item.brandName}
                        </span>
                        <span className="text-neutral-200 font-medium text-sm font-serif-luxury">
                          {item.productName} ({item.volumeMl}ml)
                        </span>
                        <span className="text-neutral-500 block text-[11px]">
                          Concentração: {item.concentration}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-300 tabular-nums">Qtd: {item.quantity}</span>
                        <span className="text-neutral-200 block font-medium tabular-nums mt-0.5">
                          R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking & Delivery Footer */}
                <div className="pt-4 border-t border-[#26241E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      Rastreamento: <strong className="text-neutral-200 font-mono">{order.trackingCode}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      Entrega em: {order.shippingAddress.street}, {order.shippingAddress.number} - {order.shippingAddress.city}/{order.shippingAddress.state}
                    </span>
                  </div>
                </div>
              </LuxuryCard>
            ))}
          </div>
        )}

        {/* 2. Olfactory Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">Perfil Olfativo Pessoal</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Suas preferências direcionam as vitrines recomendadas e o futuro Sommelier Olfativo de Inteligência Artificial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LuxuryCard className="p-6">
                <div className="flex items-center gap-2 text-xs font-serif-luxury text-[#ECC876] uppercase tracking-wider mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Famílias Olfativas Favoritas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FOUNDATION_CUSTOMER.favoriteFamilies.map((fam) => (
                    <span
                      key={fam}
                      className="px-3 py-1.5 text-xs bg-[#1C1A14] border border-[#D4AF37]/30 text-[#ECC876]"
                    >
                      {fam}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
                  Preferência por acordes ricos, madeiras preciosas, resinas orientais e projeção marcante de longa duração.
                </p>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-2 text-xs font-serif-luxury text-[#ECC876] uppercase tracking-wider mb-4">
                  <Heart className="w-4 h-4" />
                  <span>Notas de Assinatura</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FOUNDATION_CUSTOMER.signatureNotes.map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1.5 text-xs bg-[#1A1A1A] border border-neutral-800 text-neutral-300"
                    >
                      · {note}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
                  Notas de fundo com alta fixação que formam a sua identidade olfativa exclusiva.
                </p>
              </LuxuryCard>
            </div>
          </div>
        )}

        {/* 3. Address Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">Endereços Salvos</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Locais cadastrados para entrega segura e cálculo de frete imediato.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FOUNDATION_CUSTOMER.savedAddresses.map((addr) => (
                <LuxuryCard key={addr.id} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#ECC876] uppercase tracking-wider">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <GoldBadge variant="gold-hairline">Padrão</GoldBadge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed">
                    {addr.street}, {addr.number}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {addr.city} - {addr.state} · CEP: {addr.zipCode}
                  </p>
                </LuxuryCard>
              ))}
            </div>
          </div>
        )}

        {/* 4. Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">Dados Pessoais</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Informações para emissão de nota fiscal e conferência de segurança Pix.
              </p>
            </div>

            <LuxuryCard className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">
                    Nome Completo
                  </span>
                  <span className="text-neutral-200 text-sm font-medium mt-1 block">
                    {FOUNDATION_CUSTOMER.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">
                    E-mail
                  </span>
                  <span className="text-neutral-200 text-sm font-medium mt-1 block">
                    {FOUNDATION_CUSTOMER.email}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">
                    Telefone / WhatsApp
                  </span>
                  <span className="text-neutral-200 text-sm font-medium mt-1 block">
                    {FOUNDATION_CUSTOMER.phone}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block uppercase tracking-wider text-[10px]">
                    CPF (Auditado)
                  </span>
                  <span className="text-neutral-200 text-sm font-medium mt-1 block font-mono">
                    {FOUNDATION_CUSTOMER.cpf}
                  </span>
                </div>
              </div>
            </LuxuryCard>
          </div>
        )}
      </div>
    </div>
  );
};
