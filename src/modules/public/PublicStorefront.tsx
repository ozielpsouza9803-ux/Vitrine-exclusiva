import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  ShoppingBag,
  Check,
  Layers,
  SlidersHorizontal,
  MapPin,
  RotateCw,
  ShieldCheck,
  QrCode,
  Truck,
  Building2,
  Tag,
  ArrowRight,
  MessageSquareCode,
  CheckCircle2
} from 'lucide-react';
import { Brand, FragranceProduct, OlfactoryFamily, CategoryRecord } from '../../types';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../../config/constants';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { supabaseDatabaseService, BannerRecord } from '../../services/supabaseDatabaseService';
import { GoldButton } from '../../components/ui/GoldButton';
import { GoldBadge } from '../../components/ui/GoldBadge';
import { LuxuryCard } from '../../components/ui/LuxuryCard';
import { GoldDivider } from '../../components/ui/GoldDivider';
import { PublicTab } from '../../components/layout/SideMenuDrawer';

interface PublicStorefrontProps {
  onAddToCart: (product: FragranceProduct) => void;
  currentTab?: PublicTab;
  onSelectTab?: (tab: PublicTab) => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({
  onAddToCart,
  currentTab = 'home',
  onSelectTab,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState<FragranceProduct | null>(null);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Supabase live records
  const [brands, setBrands] = useState<Brand[]>(isSupabaseConfigured ? [] : INITIAL_BRANDS);
  const [products, setProducts] = useState<FragranceProduct[]>(isSupabaseConfigured ? [] : INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    loadStoreData();
  }, [selectedBrandId, selectedFamily]);

  const loadStoreData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [fetchedBrands, fetchedProducts, fetchedCategories, fetchedBanners] = await Promise.all([
        supabaseDatabaseService.getBrands(),
        supabaseDatabaseService.getProducts({
          brandId: selectedBrandId !== 'all' ? selectedBrandId : undefined,
          olfactoryFamily: selectedFamily !== 'all' ? selectedFamily : undefined,
        }),
        supabaseDatabaseService.getCategories(),
        supabaseDatabaseService.getBanners(),
      ]);

      setBrands(fetchedBrands || []);
      setProducts(fetchedProducts || []);
      setCategories(fetchedCategories || []);
      setBanners(fetchedBanners || []);

      const err =
        supabaseDatabaseService.getLastError('brands') ||
        supabaseDatabaseService.getLastError('products') ||
        supabaseDatabaseService.getLastError('categories');
      if (err) {
        setDbError(err);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar dados do banco:', err);
      setDbError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWithFeedback = (product: FragranceProduct) => {
    onAddToCart(product);
    setAddedSuccessId(product.id);
    setTimeout(() => setAddedSuccessId(null), 1800);
  };

  const olfactoryFamilies: OlfactoryFamily[] = [
    'Amadeirado',
    'Oriental / Âmbar',
    'Floral',
    'Cítrico',
    'Couro',
    'Chipre',
  ];

  const activeBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="w-full pb-24 overflow-x-hidden">
      {/* Dynamic Database Error / Revalidation Banner */}
      {dbError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 bg-[#14120C] border border-amber-900/40 shadow-lg text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#ECC876]">
                <RotateCw className="w-4 h-4 shrink-0" />
                <span>Conexão Supabase (zfuqmqhirgbdxjlwhdqe): <strong className="font-mono text-white">{dbError}</strong></span>
              </div>
              <button
                onClick={() => loadStoreData()}
                disabled={loading}
                className="px-3 py-1 bg-[#D4AF37] hover:bg-[#ECC876] text-black font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {loading ? 'Consultando...' : 'Atualizar Dados'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          VIEW 1: HOME (Tela Inicial Pública Completa)
         ============================================================================== */}
      {(currentTab === 'home' || currentTab === 'marcas' || currentTab === 'como-funciona') && (
        <>
          {/* 1. Campaign Hero & Banner Carousel */}
          <section className="relative w-full border-b border-[#26241E] overflow-hidden bg-[#0A0A0A]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Editorial & Brand Proposition */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#C5A059] mb-4 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Coleção Exclusiva</span>
                    <span aria-hidden="true">·</span>
                    <span>Estoque Físico no Brasil</span>
                    <span aria-hidden="true">·</span>
                    <span>Envio Pix Instantâneo</span>
                  </div>

                  <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[#F7F7F6] leading-[1.15] text-balance">
                    {banners.length > 0 ? banners[0].title : 'A Arte da Alta Perfumaria em Vitrines Exclusivas'}
                  </h1>

                  <p className="mt-5 text-sm sm:text-base text-neutral-400 font-editorial leading-relaxed max-w-2xl">
                    {banners.length > 0 && banners[0].subtitle
                      ? banners[0].subtitle
                      : 'O encontro das mais reverenciadas casas olfativas do mundo. Frascos de colecionador, extratos puros e essências de nicho com estoque físico auditado e autenticidade incondicional.'}
                  </p>

                  {/* Hero Quick Actions */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <GoldButton
                      variant="primary"
                      size="md"
                      onClick={() => {
                        if (onSelectTab) onSelectTab('vitrine');
                        else {
                          const el = document.getElementById('catalogo-fragrancias');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      icon={<Sparkles className="w-4 h-4" />}
                    >
                      Explorar Vitrine Completa
                    </GoldButton>

                    <GoldButton
                      variant="outline"
                      size="md"
                      onClick={() => {
                        const el = document.getElementById('como-funciona-secao');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Como Funciona
                    </GoldButton>
                  </div>

                  {/* Sub-hero metadata guarantees */}
                  <div className="mt-10 pt-6 border-t border-[#26241E] flex flex-wrap items-center gap-6 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="font-serif-luxury text-base text-[#ECC876] tabular-nums font-semibold">
                        {brands.length}
                      </span>
                      <span>Casas de Nicho</span>
                    </div>
                    <span aria-hidden="true" className="text-neutral-700">|</span>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-luxury text-base text-[#ECC876] tabular-nums font-semibold">
                        100%
                      </span>
                      <span>Estoque Físico Próprio</span>
                    </div>
                    <span aria-hidden="true" className="text-neutral-700">|</span>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-luxury text-base text-[#ECC876] tabular-nums font-semibold">
                        0s
                      </span>
                      <span>Liberação Pix</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero High-Res Imagery */}
                <div className="lg:col-span-5 relative">
                  <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] overflow-hidden border border-[#D4AF37]/30 bg-[#121212] shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                    <img
                      src={banners.length > 0 ? banners[0].imageUrl : "/src/assets/images/hero_luxury_perfume_1793996140999.jpg"}
                      alt="Frasco de Alta Perfumaria AURA em pedestal de basalto lapidado"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                      <span className="font-serif-luxury tracking-wider text-[#ECC876] uppercase">
                        Extrait de Parfum
                      </span>
                      <span className="text-neutral-300 font-mono tabular-nums">
                        Lote Auditado 2026
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Vitrines Oficiais de Marcas Parceiras */}
          <section id="vitrines-marcas-secao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-b border-[#26241E]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <GoldBadge variant="text-only">Vitrines Exclusivas</GoldBadge>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#F7F7F6] mt-1">
                  Casas de Perfumaria Parceiras
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-editorial">
                  Selecione uma marca para explorar sua linhagem olfativa e estoque físico no Brasil.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Filtro: {selectedBrandId === 'all' ? 'Todas as Casas' : activeBrand?.name}</span>
              </div>
            </div>

            {/* Brand Buttons Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                onClick={() => setSelectedBrandId('all')}
                className={`p-4 text-left border transition-all duration-200 cursor-pointer ${
                  selectedBrandId === 'all'
                    ? 'bg-[#1C1A14] border-[#D4AF37] text-[#ECC876] shadow-[0_4px_16px_rgba(212,175,55,0.15)]'
                    : 'bg-[#121212] border-[#26241E] text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <span className="block text-[11px] uppercase tracking-wider text-[#C5A059] font-mono">
                  GLOBAL
                </span>
                <span className="font-serif-luxury text-sm font-semibold mt-1 block">
                  Todas as Casas
                </span>
                <span className="text-[11px] text-neutral-400 block mt-2 font-mono">
                  {products.length} fragrâncias
                </span>
              </button>

              {brands.map((brand) => {
                const count = products.filter((p) => p.brandId === brand.id).length;
                const isSelected = selectedBrandId === brand.id;

                return (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrandId(brand.id)}
                    className={`p-4 text-left border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C1A14] border-[#D4AF37] text-[#ECC876] shadow-[0_4px_16px_rgba(212,175,55,0.15)]'
                        : 'bg-[#121212] border-[#26241E] text-neutral-300 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-mono font-semibold">
                        {brand.logoSymbol || 'BRAND'}
                      </span>
                      <span className="text-[10px] text-neutral-400">{brand.countryOfOrigin}</span>
                    </div>
                    <span className="font-serif-luxury text-sm font-semibold mt-1 block truncate">
                      {brand.name}
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-2 font-mono">
                      {count} em estoque
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Brand Showcase Detail Banner */}
            {activeBrand && (
              <div className="mt-6 p-6 bg-[#14120C] border border-[#D4AF37]/40 text-neutral-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#ECC876] tracking-wider uppercase font-mono">
                      <span>Vitrine Oficial</span>
                      <span aria-hidden="true">·</span>
                      <span>Fundada em {activeBrand.foundedYear}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeBrand.countryOfOrigin}</span>
                    </div>
                    <h3 className="font-serif-luxury text-xl text-white mt-1">
                      {activeBrand.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl font-editorial">
                      {activeBrand.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBrandId('all')}
                    className="text-xs uppercase tracking-wider text-neutral-400 hover:text-[#ECC876] underline underline-offset-4 cursor-pointer shrink-0"
                  >
                    Restaurar Visão Global
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 3. Como Funciona — Garantia de Estoque & Processo */}
          <section id="como-funciona-secao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-[#26241E]">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <GoldBadge variant="text-only">Transparência & Excelência</GoldBadge>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-white mt-1">
                Como Funciona a AURA Parfums
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-editorial">
                Diferente de marketplaces tradicionais, operamos exclusivamente com estoque próprio climatizado no Brasil.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <LuxuryCard className="p-6">
                <div className="w-10 h-10 bg-[#1A1812] border border-[#D4AF37]/50 flex items-center justify-center mb-4 text-[#ECC876]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059]">Passo 01</span>
                <h3 className="font-serif-luxury text-lg text-white mt-1">Escolha Olfativa Auditada</h3>
                <p className="text-xs text-neutral-400 mt-2 font-editorial leading-relaxed">
                  Navegue pelas vitrines por casa, notas de saída, corpo e fundo. Cada produto possui pirâmide olfativa completa e foto real do frasco.
                </p>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="w-10 h-10 bg-[#1A1812] border border-[#D4AF37]/50 flex items-center justify-center mb-4 text-[#ECC876]">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059]">Passo 02</span>
                <h3 className="font-serif-luxury text-lg text-white mt-1">Liquidação Pix Instantânea</h3>
                <p className="text-xs text-neutral-400 mt-2 font-editorial leading-relaxed">
                  Ao concluir na sacola, a chave Pix é gerada em segundos. A aprovação é automática, garantindo a reserva imediata do seu frasco.
                </p>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="w-10 h-10 bg-[#1A1812] border border-[#D4AF37]/50 flex items-center justify-center mb-4 text-[#ECC876]">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A059]">Passo 03</span>
                <h3 className="font-serif-luxury text-lg text-white mt-1">Expedição do Cofre Climatizado</h3>
                <p className="text-xs text-neutral-400 mt-2 font-editorial leading-relaxed">
                  Sua encomenda é embalada com proteção isotérmica e despachada no mesmo dia com código de rastreio em tempo real.
                </p>
              </LuxuryCard>
            </div>
          </section>
        </>
      )}

      {/* ==============================================================================
          CATÁLOGO DE PRODUTOS (VITRINE COMPLETA)
         ============================================================================== */}
      <section id="catalogo-fragrancias" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#26241E]">
          <div>
            <span className="text-xs font-serif-luxury tracking-widest uppercase text-[#C5A059]">
              Catálogo de Alta Perfumaria
            </span>
            <h2 className="font-serif-luxury text-2xl text-[#F7F7F6] mt-0.5">
              Fragrâncias Disponíveis no Supabase
            </h2>
          </div>

          {/* Olfactory Family / Categories Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 mr-1 font-mono">Família:</span>
            <button
              onClick={() => setSelectedFamily('all')}
              className={`text-xs px-2.5 py-1 transition-colors cursor-pointer ${
                selectedFamily === 'all'
                  ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                  : 'bg-[#171717] text-neutral-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            {(categories.length > 0 ? categories.map((c) => c.name) : olfactoryFamilies).map((fam) => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`text-xs px-2.5 py-1 transition-colors cursor-pointer ${
                  selectedFamily === fam
                    ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                    : 'bg-[#171717] text-neutral-400 hover:text-white'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State Skeletons */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[#121212] border border-[#26241E] h-96 p-4">
                <div className="bg-[#1A1A1A] h-48 w-full mb-4" />
                <div className="bg-[#1A1A1A] h-4 w-1/3 mb-2" />
                <div className="bg-[#1A1A1A] h-6 w-3/4 mb-4" />
                <div className="bg-[#1A1A1A] h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Product Cards Grid */}
        {!loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const inStock = product.physicalStock?.currentQuantity > 0;

              return (
                <LuxuryCard key={product.id} className="flex flex-col justify-between overflow-hidden group">
                  {/* Image Container (65% focus) */}
                  <div className="relative aspect-[4/3] bg-[#0E0E0E] overflow-hidden border-b border-[#26241E]">
                    <img
                      src={product.images?.primary || "/src/assets/images/hero_luxury_perfume_1793996140999.jpg"}
                      alt={product.images?.alt || product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent pointer-events-none" />

                    {/* Stock status tag */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#D4AF37] bg-[#0A0A0A]/85 px-2 py-0.5 border border-[#D4AF37]/30">
                        {product.concentration}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-editorial italic text-sm">
                        {product.volumeMl} ml
                      </span>
                      <span className="text-neutral-400 font-mono text-[11px]">
                        Estoque: {product.physicalStock?.currentQuantity ?? 0} un
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between grow">
                    <div>
                      {/* Brand / Family metadata */}
                      <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        <span>{product.brandName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#C5A059]">{product.olfactoryFamily}</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-serif-luxury text-lg text-white font-medium group-hover:text-[#ECC876] transition-colors leading-snug">
                        {product.name}
                      </h3>

                      {/* Notes Preview */}
                      {product.olfactoryPyramid?.topNotes?.length > 0 && (
                        <p className="mt-2 text-xs text-neutral-400 line-clamp-1 font-editorial">
                          Saída: {product.olfactoryPyramid.topNotes.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Pricing and Action */}
                    <div className="mt-6 pt-4 border-t border-[#26241E] flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-mono">
                          Valor Unitário
                        </span>
                        <span className="text-lg font-serif-luxury text-[#ECC876] font-semibold tabular-nums">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProductForModal(product)}
                          className="p-2.5 text-neutral-400 hover:text-white border border-[#26241E] hover:border-neutral-600 transition-colors cursor-pointer"
                          title="Ver Pirâmide Olfativa"
                          aria-label="Ver Pirâmide Olfativa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <GoldButton
                          variant={addedSuccessId === product.id ? 'outline' : 'primary'}
                          size="sm"
                          disabled={!inStock}
                          onClick={() => handleAddWithFeedback(product)}
                          icon={
                            addedSuccessId === product.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {addedSuccessId === product.id
                            ? 'Adicionado'
                            : inStock
                            ? 'Comprar'
                            : 'Esgotado'}
                        </GoldButton>
                      </div>
                    </div>
                  </div>
                </LuxuryCard>
              );
            })}
          </div>
        )}

        {/* Zero Products Clean Empty State */}
        {!loading && products.length === 0 && (
          <div className="py-16 text-center text-neutral-400 border border-dashed border-[#26241E] mt-8 bg-[#0D0D0D]">
            <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
            <p className="font-serif-luxury text-lg text-neutral-300">
              Nenhum perfume encontrado no Supabase para estes filtros.
            </p>
            <p className="text-xs text-neutral-500 mt-1 font-editorial">
              Utilize o Painel Administrativo para cadastrar novos produtos no estoque real.
            </p>
            <button
              onClick={() => {
                setSelectedBrandId('all');
                setSelectedFamily('all');
              }}
              className="mt-4 text-xs text-[#ECC876] underline underline-offset-4 cursor-pointer font-mono uppercase"
            >
              Restaurar vitrine completa
            </button>
          </div>
        )}
      </section>

      {/* ==============================================================================
          MODAL: PIRÂMIDE OLFATIVA DETALHADA
         ============================================================================== */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#121212] border border-[#D4AF37]/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <button
              onClick={() => setSelectedProductForModal(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm p-2 cursor-pointer"
              aria-label="Fechar modal"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] font-mono">
              <span>{selectedProductForModal.brandName}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedProductForModal.concentration}</span>
            </div>

            <h3 className="font-serif-luxury text-2xl text-white mt-1">
              {selectedProductForModal.name}
            </h3>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-[#171717] border border-[#26241E]">
                <span className="text-[10px] uppercase font-mono text-[#D4AF37] block mb-1">
                  Notas de Saída / Topo
                </span>
                <p className="text-xs text-neutral-200 font-editorial">
                  {selectedProductForModal.olfactoryPyramid?.topNotes?.join(', ') || 'Não especificadas'}
                </p>
              </div>

              <div className="p-4 bg-[#171717] border border-[#26241E]">
                <span className="text-[10px] uppercase font-mono text-[#D4AF37] block mb-1">
                  Notas de Coração / Corpo
                </span>
                <p className="text-xs text-neutral-200 font-editorial">
                  {selectedProductForModal.olfactoryPyramid?.heartNotes?.join(', ') || 'Não especificadas'}
                </p>
              </div>

              <div className="p-4 bg-[#171717] border border-[#26241E]">
                <span className="text-[10px] uppercase font-mono text-[#D4AF37] block mb-1">
                  Notas de Fundo / Base
                </span>
                <p className="text-xs text-neutral-200 font-editorial">
                  {selectedProductForModal.olfactoryPyramid?.baseNotes?.join(', ') || 'Não especificadas'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#26241E] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block font-mono">Valor Unitário</span>
                <span className="font-serif-luxury text-xl text-[#ECC876] font-semibold">
                  R$ {selectedProductForModal.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <GoldButton
                variant="primary"
                size="md"
                onClick={() => {
                  handleAddWithFeedback(selectedProductForModal);
                  setSelectedProductForModal(null);
                }}
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                Adicionar à Sacola
              </GoldButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
