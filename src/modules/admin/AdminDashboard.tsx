import React, { useState } from 'react';
import {
  Boxes,
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertTriangle,
  QrCode,
  CheckCircle,
  Database,
  KeyRound,
  HardDrive,
  MessageSquareCode,
  Layers,
  Search
} from 'lucide-react';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../../config/constants';
import { FragranceProduct, Brand } from '../../types';
import { getIntegrationStatus } from '../../services/registry';
import { GoldButton } from '../../components/ui/GoldButton';
import { GoldBadge } from '../../components/ui/GoldBadge';
import { LuxuryCard } from '../../components/ui/LuxuryCard';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'brands' | 'orders' | 'integrations'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [productsList, setProductsList] = useState<FragranceProduct[]>(INITIAL_PRODUCTS);
  const [brandsList, setBrandsList] = useState<Brand[]>(INITIAL_BRANDS);

  // Quick physical stock calculation
  const totalPhysicalUnits = productsList.reduce(
    (acc, curr) => acc + curr.physicalStock.currentQuantity,
    0
  );
  const totalStockValue = productsList.reduce(
    (acc, curr) => acc + curr.price * curr.physicalStock.currentQuantity,
    0
  );
  const lowStockCount = productsList.filter(
    (p) => p.physicalStock.currentQuantity <= p.physicalStock.minimumThreshold
  ).length;

  const integrationStatus = getIntegrationStatus();

  // Search filter for physical inventory
  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.physicalStock.shelfLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle brand active state for storefront showcase
  const handleToggleBrand = (brandId: string) => {
    setBrandsList((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, isActive: !b.isActive } : b))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#26241E]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Módulo Administrativo Restrito</span>
            <span aria-hidden="true">·</span>
            <span>Gestão Operacional</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F7F7F6]">
            Painel de Controle & Estoque Físico
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-editorial">
            Ambiente isolado para gestão de inventário, vitrines de marcas parceiras e conferência Pix.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#141414] border border-[#26241E]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Estoque Físico ({productsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('brands')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vitrines & Marcas ({brandsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pedidos & Pix</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Arquitetura de Integrações</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Estoque Físico Total</span>
            <Boxes className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-white font-semibold mt-2 block tabular-nums">
            {totalPhysicalUnits}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Frascos auditados no cofre
          </span>
        </LuxuryCard>

        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Valor em Estoque</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-[#ECC876] font-semibold mt-2 block tabular-nums">
            R$ {(totalStockValue / 1000).toFixed(1)}k
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Preço de catálogo ativo
          </span>
        </LuxuryCard>

        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Marcas Parceiras</span>
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-white font-semibold mt-2 block tabular-nums">
            {brandsList.filter((b) => b.isActive).length} / {brandsList.length}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Vitrines ativas na loja
          </span>
        </LuxuryCard>

        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Alertas de Estoque</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
          </div>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-amber-300 font-semibold mt-2 block tabular-nums">
            {lowStockCount}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Itens no ponto de reposição
          </span>
        </LuxuryCard>
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {/* 1. Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por fragrância, marca, SKU ou gaveta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#141414] border border-[#26241E] text-xs text-neutral-200 pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37] placeholder-neutral-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>Total de {filteredProducts.length} referências catalogadas</span>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto border border-[#26241E] bg-[#121212]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#26241E] bg-[#171717] text-neutral-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fragrância / Casa</th>
                    <th className="py-3 px-4">SKU / EAN</th>
                    <th className="py-3 px-4">Localização Física</th>
                    <th className="py-3 px-4 text-right">Qtd. Atual</th>
                    <th className="py-3 px-4 text-right">Mínimo</th>
                    <th className="py-3 px-4 text-right">Valor Unitário</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26241E] text-neutral-300">
                  {filteredProducts.map((p) => {
                    const isLow = p.physicalStock.currentQuantity <= p.physicalStock.minimumThreshold;

                    return (
                      <tr key={p.id} className="hover:bg-[#181818] transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-serif-luxury text-sm text-white font-medium block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            {p.brandName} · {p.volumeMl}ml
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                          <div>{p.sku}</div>
                          <div className="text-[10px] text-neutral-600">{p.barcodeEan}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-neutral-200">
                          {p.physicalStock.shelfLocation}
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif-luxury text-sm font-semibold tabular-nums">
                          {p.physicalStock.currentQuantity} un
                        </td>
                        <td className="py-3.5 px-4 text-right text-neutral-400 tabular-nums">
                          {p.physicalStock.minimumThreshold} un
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif-luxury text-[#ECC876] tabular-nums">
                          R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isLow ? (
                            <span className="text-[10px] uppercase tracking-wider text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5">
                              Repor Estoque
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Brands Management */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">Gestão de Vitrines Oficiais</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Ative ou oculte casas de perfumaria da vitrine pública e organize a ordem de exibição.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandsList.map((brand) => (
                <LuxuryCard key={brand.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#C5A059]">
                        <span>Origem: {brand.countryOfOrigin}</span>
                        <span aria-hidden="true">·</span>
                        <span>Fundada em {brand.foundedYear}</span>
                      </div>
                      <h3 className="font-serif-luxury text-lg text-white mt-1">
                        {brand.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-2 font-editorial leading-relaxed">
                        {brand.description}
                      </p>
                    </div>

                    <span className="font-mono text-sm px-2.5 py-1 bg-[#1A1A1A] border border-neutral-800 text-[#ECC876]">
                      {brand.logoSymbol}
                    </span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#26241E] flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Vitrine Pública:{' '}
                      <strong className={brand.isActive ? 'text-emerald-400' : 'text-neutral-500'}>
                        {brand.isActive ? 'Visível' : 'Oculta'}
                      </strong>
                    </span>

                    <button
                      onClick={() => handleToggleBrand(brand.id)}
                      className={`text-xs px-3 py-1.5 border transition-colors cursor-pointer ${
                        brand.isActive
                          ? 'border-neutral-700 text-neutral-300 hover:border-amber-600 hover:text-amber-400'
                          : 'border-[#D4AF37] text-[#ECC876] hover:bg-[#D4AF37]/10'
                      }`}
                    >
                      {brand.isActive ? 'Ocultar Vitrine' : 'Ativar Vitrine'}
                    </button>
                  </div>
                </LuxuryCard>
              ))}
            </div>
          </div>
        )}

        {/* 3. Orders & Pix Verification */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">Controle de Vendas & Liquidação Pix</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Conferência de recebimentos em tempo real e autorização de baixa no estoque físico.
              </p>
            </div>

            <LuxuryCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26241E]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif-luxury text-base text-[#ECC876] font-semibold">
                      AURA-2026-0884
                    </span>
                    <GoldBadge variant="gold-hairline">Pix Confirmado</GoldBadge>
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    Cliente: Oziel Souza · E-mail: ozielpsouza9803@gmail.com
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-neutral-400 block">Total Liquidado</span>
                  <span className="font-serif-luxury text-lg text-[#ECC876] font-semibold tabular-nums">
                    R$ 3.450,00
                  </span>
                </div>
              </div>

              <div className="py-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-300">
                    1x Baccarat Rouge 540 Extrait 70ml (Maison Francis Kurkdjian)
                  </span>
                  <span className="text-neutral-400 font-mono">Prateleira: Cofre A - 02</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>ID Transação Pix: E23049102934891238491028</span>
                  <span>Baixa física reservada: 1 unidade</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#26241E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">
                  Status: <strong>Em separação no estoque climatizado</strong>
                </span>

                <GoldButton variant="outline" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                  Autorizar Expedição & Rastreio
                </GoldButton>
              </div>
            </LuxuryCard>
          </div>
        )}

        {/* 4. Architecture & Integration Readiness */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">
                Arquitetura de Integrações — Camada 1 (Fundação)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Estrutura de contratos e adaptadores preparados para futura injeção de banco de dados,
                autenticação, armazenamento de arquivos, gateway Pix e inteligência artificial olfativa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Banco de Dados Relacional</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Contrato: IDatabaseService
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Tipagens prontas para persistência de estoque físico, marcas e pedidos. Nenhum mock falso
                  ou armazenamento local substituto ativo.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-[#C5A059] font-medium">{integrationStatus.database.providerName}</span>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Autenticação & RBAC</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Contrato: IAuthService
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Isolamento formal entre perfil de cliente e credenciais de administrador com suporte a
                  sessões criptografadas.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-[#C5A059] font-medium">{integrationStatus.auth.providerName}</span>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <HardDrive className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Armazenamento de Frascos</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Contrato: IStorageService
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Pronto para upload e distribuição de fotos de alta resolução dos frascos e selos de autenticidade.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-[#C5A059] font-medium">{integrationStatus.storage.providerName}</span>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <QrCode className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Gateway Pix Instantâneo</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Contrato: IPixPaymentService
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Geração dinâmica de QR Code Copia e Cola com webhook para confirmação em segundos e baixa de estoque.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-[#C5A059] font-medium">{integrationStatus.pix.providerName}</span>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquareCode className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Sommelier Olfativo AI</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Contrato: IChatbotService
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Interface para consultoria de notas olfativas e recomendação por ocasião via Gemini API.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-[#C5A059] font-medium">{integrationStatus.chatbot.providerName}</span>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">PWA & Offline</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Contrato: Service Worker & Manifest
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Manifesto JSON e registro estruturado para futura instalação no celular como aplicativo nativo.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-emerald-400 font-medium">Manifesto Configurado</span>
                </div>
              </LuxuryCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
