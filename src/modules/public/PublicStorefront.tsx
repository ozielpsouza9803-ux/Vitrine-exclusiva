import React, { useState } from 'react';
import { Sparkles, Eye, ShoppingBag, Check, Layers, SlidersHorizontal, MapPin } from 'lucide-react';
import { Brand, FragranceProduct, OlfactoryFamily } from '../../types';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../../config/constants';
import { GoldButton } from '../../components/ui/GoldButton';
import { GoldBadge } from '../../components/ui/GoldBadge';
import { LuxuryCard } from '../../components/ui/LuxuryCard';
import { GoldDivider } from '../../components/ui/GoldDivider';

interface PublicStorefrontProps {
  onAddToCart: (product: FragranceProduct) => void;
}

export const PublicStorefront: React.FC<PublicStorefrontProps> = ({ onAddToCart }) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedProductForModal, setSelectedProductForModal] = useState<FragranceProduct | null>(null);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Filter products by brand and olfactory family
  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchBrand = selectedBrandId === 'all' || product.brandId === selectedBrandId;
    const matchFamily = selectedFamily === 'all' || product.olfactoryFamily === selectedFamily;
    return matchBrand && matchFamily;
  });

  const activeBrand = INITIAL_BRANDS.find((b) => b.id === selectedBrandId);

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

  return (
    <div className="w-full">
      {/* 1. Storefront Campaign Hero */}
      <section className="relative w-full border-b border-[#26241E] overflow-hidden bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Editorial & Brand Proposition */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#C5A059] mb-4">
                <span>Coleção Exclusiva</span>
                <span aria-hidden="true">·</span>
                <span>Estoque Físico no Brasil</span>
                <span aria-hidden="true">·</span>
                <span>Envio Imediato via Pix</span>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[#F7F7F6] leading-[1.15] text-balance">
                A Arte da Alta Perfumaria em Vitrines Exclusivas
              </h1>

              <p className="mt-5 text-sm sm:text-base text-neutral-400 font-editorial leading-relaxed max-w-2xl">
                O encontro das mais reverenciadas casas olfativas do mundo. Frascos de colecionador, 
                extratos puros e essências de nicho com estoque físico auditado e autenticidade incondicional.
              </p>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <GoldButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    const el = document.getElementById('vitrines-marcas');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Explorar Vitrines
                </GoldButton>

                <GoldButton
                  variant="outline"
                  size="md"
                  onClick={() => {
                    const el = document.getElementById('catalogo-fragrancias');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Catálogo Completo
                </GoldButton>
              </div>

              {/* Sub-hero metadata */}
              <div className="mt-10 pt-6 border-t border-[#26241E] flex flex-wrap items-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury text-base text-[#ECC876] tabular-nums">4</span>
                  <span>Casas de Nicho Ativas</span>
                </div>
                <span aria-hidden="true" className="text-neutral-700">|</span>
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury text-base text-[#ECC876] tabular-nums">100%</span>
                  <span>Estoque Próprio</span>
                </div>
                <span aria-hidden="true" className="text-neutral-700">|</span>
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury text-base text-[#ECC876] tabular-nums">0%</span>
                  <span>Falsificações</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero High-Res Campaign Imagery */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] overflow-hidden border border-[#D4AF37]/30 bg-[#121212] shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                <img
                  src="/src/assets/images/hero_luxury_perfume_1793996140999.jpg"
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

      {/* 2. Vitrines Individuais por Marca */}
      <section id="vitrines-marcas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <GoldBadge variant="text-only">Vitrines Oficiais</GoldBadge>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#F7F7F6] mt-1">
              Casas de Perfumaria Parceiras
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Selecione uma marca para acessar sua vitrine individualizada com história e linhagem olfativa.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Filtro Ativo: {selectedBrandId === 'all' ? 'Todas as Casas' : activeBrand?.name}</span>
          </div>
        </div>

        {/* Brand Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setSelectedBrandId('all')}
            className={`p-4 text-left border transition-all duration-200 cursor-pointer ${
              selectedBrandId === 'all'
                ? 'bg-[#1C1A14] border-[#D4AF37] text-[#ECC876] shadow-[0_4px_16px_rgba(212,175,55,0.15)]'
                : 'bg-[#121212] border-[#26241E] text-neutral-300 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <span className="block text-[11px] uppercase tracking-wider text-[#C5A059] font-medium">
              Visão Global
            </span>
            <span className="font-serif-luxury text-sm font-semibold mt-1 block">
              Todas as Casas
            </span>
            <span className="text-[11px] text-neutral-400 block mt-2">
              {INITIAL_PRODUCTS.length} fragrâncias
            </span>
          </button>

          {INITIAL_BRANDS.map((brand) => {
            const count = INITIAL_PRODUCTS.filter((p) => p.brandId === brand.id).length;
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
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-mono">
                    {brand.logoSymbol}
                  </span>
                  <span className="text-[10px] text-neutral-400">{brand.countryOfOrigin}</span>
                </div>
                <span className="font-serif-luxury text-sm font-semibold mt-1 block truncate">
                  {brand.name}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-2">
                  {count} em estoque
                </span>
              </button>
            );
          })}
        </div>

        {/* Brand Showcase Banner (When a specific brand is selected) */}
        {activeBrand && (
          <div className="mt-6 p-6 bg-[#14120C] border border-[#D4AF37]/30 text-neutral-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#ECC876] tracking-wider uppercase">
                  <span>Vitrine Oficial</span>
                  <span aria-hidden="true">·</span>
                  <span>Fundada em {activeBrand.foundedYear}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeBrand.countryOfOrigin}</span>
                </div>
                <h3 className="font-serif-luxury text-xl text-white mt-1">
                  {activeBrand.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
                  {activeBrand.description}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setSelectedBrandId('all')}
                  className="text-xs uppercase tracking-wider text-neutral-400 hover:text-[#ECC876] underline underline-offset-4 cursor-pointer"
                >
                  Limpar Vitrine
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Product Catalog Grid */}
      <section id="catalogo-fragrancias" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#26241E]">
          <div>
            <span className="text-xs font-serif-luxury tracking-widest uppercase text-[#C5A059]">
              Catálogo de Nicho
            </span>
            <h2 className="font-serif-luxury text-2xl text-[#F7F7F6] mt-0.5">
              Fragrâncias Disponíveis
            </h2>
          </div>

          {/* Olfactory Family Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 mr-1">Família:</span>
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
            {olfactoryFamilies.map((fam) => (
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

        {/* Product Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const inStock = product.physicalStock.currentQuantity > 0;

            return (
              <LuxuryCard key={product.id} className="flex flex-col justify-between overflow-hidden group">
                {/* Image Container (65% of card focus) */}
                <div className="relative aspect-[4/3] bg-[#0E0E0E] overflow-hidden border-b border-[#26241E]">
                  <img
                    src={product.images.primary}
                    alt={product.images.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent pointer-events-none" />

                  {/* Stock status tag (Zero-pill compliant) */}
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
                      Estoque: {product.physicalStock.currentQuantity} un
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col justify-between grow">
                  <div>
                    {/* Brand / Category clean metadata */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-widest mb-1.5">
                      <span>{product.brandName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#C5A059]">{product.olfactoryFamily}</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-serif-luxury text-lg text-white font-medium group-hover:text-[#ECC876] transition-colors leading-snug">
                      {product.name}
                    </h3>

                    {/* Top notes preview */}
                    <p className="mt-2 text-xs text-neutral-400 line-clamp-1 font-editorial">
                      Saída: {product.olfactoryPyramid.topNotes.join(', ')}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-6 pt-4 border-t border-[#26241E] flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
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

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-serif-luxury text-lg text-neutral-300">Nenhum perfume encontrado para este filtro.</p>
            <button
              onClick={() => {
                setSelectedBrandId('all');
                setSelectedFamily('all');
              }}
              className="mt-3 text-xs text-[#ECC876] underline underline-offset-4 cursor-pointer"
            >
              Restaurar vitrine completa
            </button>
          </div>
        )}
      </section>

      {/* 4. Modal / Drawer de Pirâmide Olfativa */}
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

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059]">
              <span>{selectedProductForModal.brandName}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedProductForModal.concentration}</span>
            </div>

            <h3 className="font-serif-luxury text-2xl text-white mt-1">
              {selectedProductForModal.name}
            </h3>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-[#26241E] py-6">
              {/* Notas de Topo */}
              <div className="p-3 bg-[#171717] border border-[#26241E]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#ECC876] font-medium mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Topo (15min)</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 font-editorial">
                  {selectedProductForModal.olfactoryPyramid.topNotes.map((note, idx) => (
                    <li key={idx}>· {note}</li>
                  ))}
                </ul>
              </div>

              {/* Notas de Coração */}
              <div className="p-3 bg-[#171717] border border-[#26241E]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#ECC876] font-medium mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Coração (4h)</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 font-editorial">
                  {selectedProductForModal.olfactoryPyramid.heartNotes.map((note, idx) => (
                    <li key={idx}>· {note}</li>
                  ))}
                </ul>
              </div>

              {/* Notas de Fundo */}
              <div className="p-3 bg-[#171717] border border-[#26241E]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#ECC876] font-medium mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Fundo (12h+)</span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 font-editorial">
                  {selectedProductForModal.olfactoryPyramid.baseNotes.map((note, idx) => (
                    <li key={idx}>· {note}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Estoque físico & SKU */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Estoque Físico: {selectedProductForModal.physicalStock.shelfLocation}</span>
              </div>
              <span className="font-mono">SKU: {selectedProductForModal.sku}</span>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#26241E]">
              <div>
                <span className="text-[10px] uppercase text-neutral-400 block">Preço</span>
                <span className="text-xl font-serif-luxury text-[#ECC876] font-semibold tabular-nums">
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
