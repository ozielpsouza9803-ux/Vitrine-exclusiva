import React, { useState, useEffect } from 'react';
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
  Search,
  Users,
  Tag,
  Plus,
  Edit3,
  Check,
  X,
  Globe,
  Calendar,
  Sparkles,
  RotateCw,
  Power
} from 'lucide-react';
import { INITIAL_BRANDS, INITIAL_PRODUCTS } from '../../config/constants';
import { FragranceProduct, Brand, CategoryRecord, ConcentrationType, OlfactoryFamily } from '../../types';
import { getIntegrationStatus } from '../../services/registry';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { supabaseDatabaseService } from '../../services/supabaseDatabaseService';
import { GoldButton } from '../../components/ui/GoldButton';
import { GoldBadge } from '../../components/ui/GoldBadge';
import { LuxuryCard } from '../../components/ui/LuxuryCard';
import { AdminManagement } from './AdminManagement';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'brands' | 'categories' | 'orders' | 'admins' | 'integrations'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [productsList, setProductsList] = useState<FragranceProduct[]>(isSupabaseConfigured ? [] : INITIAL_PRODUCTS);
  const [brandsList, setBrandsList] = useState<Brand[]>(isSupabaseConfigured ? [] : INITIAL_BRANDS);
  const [categoriesList, setCategoriesList] = useState<CategoryRecord[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(isSupabaseConfigured);
  const [dataError, setDataError] = useState<string | null>(null);

  // Forms and Feedback state for CRUD
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [brandForm, setBrandForm] = useState<Partial<Brand>>({
    name: '',
    slug: '',
    tagline: '',
    countryOfOrigin: 'França',
    foundedYear: 2000,
    description: '',
    logoSymbol: '',
    bannerImageUrl: '',
    featuredOrder: 1,
    isActive: true,
  });

  const [categoryForm, setCategoryForm] = useState<Partial<CategoryRecord>>({
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
    isActive: true,
  });

  const [productForm, setProductForm] = useState<Partial<FragranceProduct> & {
    topNotesStr?: string;
    heartNotesStr?: string;
    baseNotesStr?: string;
    galleryStr?: string;
  }>({
    name: '',
    brandId: '',
    categoryId: '',
    concentration: 'Eau de Parfum',
    olfactoryFamily: 'Amadeirado',
    topNotesStr: '',
    heartNotesStr: '',
    baseNotesStr: '',
    volumeMl: 100,
    price: 990,
    promotionalPrice: undefined,
    sku: '',
    barcodeEan: '',
    physicalStock: {
      currentQuantity: 10,
      minimumThreshold: 2,
      shelfLocation: 'Galpão A - Prateleira 01',
      reservedOnline: 0,
    },
    status: 'active',
    isFeatured: false,
    isNewArrival: false,
    images: {
      primary: '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
      gallery: [],
      alt: '',
    },
    galleryStr: '',
  });

  useEffect(() => {
    loadRealInventory();
  }, []);

  const loadRealInventory = async () => {
    setIsLoadingRealData(true);
    setDataError(null);
    try {
      const [fetchedProducts, fetchedBrands, fetchedCategories] = await Promise.all([
        supabaseDatabaseService.getProducts({ includeInactive: true }),
        supabaseDatabaseService.getBrands({ includeInactive: true }),
        supabaseDatabaseService.getCategories({ includeInactive: true }),
      ]);

      setProductsList(fetchedProducts || []);
      setBrandsList(fetchedBrands || []);
      setCategoriesList(fetchedCategories || []);

      const err =
        supabaseDatabaseService.getLastError('products') ||
        supabaseDatabaseService.getLastError('brands') ||
        supabaseDatabaseService.getLastError('categories');
      if (err) {
        setDataError(err);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar dados do Supabase:', err);
      setDataError(err.message || 'Erro ao carregar dados');
    } finally {
      setIsLoadingRealData(false);
    }
  };

  // ==========================================
  // BRAND HANDLERS
  // ==========================================
  const handleOpenBrandModal = (brand?: Brand) => {
    setActionFeedback(null);
    if (brand) {
      setBrandForm({ ...brand });
    } else {
      setBrandForm({
        name: '',
        slug: '',
        tagline: '',
        countryOfOrigin: 'França',
        foundedYear: 2000,
        description: '',
        logoSymbol: '',
        bannerImageUrl: '',
        featuredOrder: brandsList.length + 1,
        isActive: true,
      });
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name || !brandForm.countryOfOrigin) {
      setActionFeedback({ type: 'error', message: 'Preencha o nome da marca e o país de origem.' });
      return;
    }

    setIsSaving(true);
    setActionFeedback(null);
    try {
      const brandToSave: Brand = {
        id: brandForm.id || '',
        name: brandForm.name,
        slug: brandForm.slug || brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tagline: brandForm.tagline || '',
        countryOfOrigin: brandForm.countryOfOrigin,
        foundedYear: Number(brandForm.foundedYear) || 2000,
        description: brandForm.description || '',
        logoSymbol: brandForm.logoSymbol || brandForm.name.substring(0, 3).toUpperCase(),
        bannerImageUrl: brandForm.bannerImageUrl || undefined,
        featuredOrder: Number(brandForm.featuredOrder) || 1,
        isActive: brandForm.isActive ?? true,
      };

      const saved = await supabaseDatabaseService.saveBrand(brandToSave);
      setActionFeedback({
        type: 'success',
        message: `Marca "${saved.name}" salva com sucesso no Supabase!`,
      });
      setIsBrandModalOpen(false);
      await loadRealInventory();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Erro ao salvar marca no Supabase.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBrandStatus = async (brand: Brand) => {
    setActionFeedback(null);
    try {
      await supabaseDatabaseService.toggleBrandActive(brand.id, !brand.isActive);
      setActionFeedback({
        type: 'success',
        message: `Status da marca "${brand.name}" alterado para ${!brand.isActive ? 'Visível' : 'Oculta'}.`,
      });
      await loadRealInventory();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Erro ao alterar status da marca.' });
    }
  };

  // ==========================================
  // CATEGORY HANDLERS
  // ==========================================
  const handleOpenCategoryModal = (category?: CategoryRecord) => {
    setActionFeedback(null);
    if (category) {
      setCategoryForm({ ...category });
    } else {
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        displayOrder: categoriesList.length + 1,
        isActive: true,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) {
      setActionFeedback({ type: 'error', message: 'Informe o nome da categoria.' });
      return;
    }

    setIsSaving(true);
    setActionFeedback(null);
    try {
      const catToSave: CategoryRecord = {
        id: categoryForm.id || '',
        name: categoryForm.name,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: categoryForm.description || '',
        displayOrder: Number(categoryForm.displayOrder) || 1,
        isActive: categoryForm.isActive ?? true,
      };

      const saved = await supabaseDatabaseService.saveCategory(catToSave);
      setActionFeedback({
        type: 'success',
        message: `Categoria "${saved.name}" salva com sucesso no Supabase!`,
      });
      setIsCategoryModalOpen(false);
      await loadRealInventory();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Erro ao salvar categoria no Supabase.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCategoryStatus = async (cat: CategoryRecord) => {
    setActionFeedback(null);
    try {
      await supabaseDatabaseService.toggleCategoryActive(cat.id, !cat.isActive);
      setActionFeedback({
        type: 'success',
        message: `Status da categoria "${cat.name}" alterado para ${!cat.isActive ? 'Ativa' : 'Inativa'}.`,
      });
      await loadRealInventory();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Erro ao alterar status da categoria.' });
    }
  };

  // ==========================================
  // PRODUCT / FRAGRANCE HANDLERS
  // ==========================================
  const handleOpenProductModal = (product?: FragranceProduct) => {
    setActionFeedback(null);
    if (product) {
      setProductForm({
        ...product,
        topNotesStr: (product.olfactoryPyramid?.topNotes || []).join(', '),
        heartNotesStr: (product.olfactoryPyramid?.heartNotes || []).join(', '),
        baseNotesStr: (product.olfactoryPyramid?.baseNotes || []).join(', '),
        galleryStr: (product.images?.gallery || []).join('\n'),
      });
    } else {
      const defaultBrandId = brandsList[0]?.id || '';
      const defaultCategoryId = categoriesList[0]?.id || '';
      setProductForm({
        name: '',
        brandId: defaultBrandId,
        categoryId: defaultCategoryId,
        concentration: 'Eau de Parfum',
        olfactoryFamily: 'Amadeirado',
        topNotesStr: '',
        heartNotesStr: '',
        baseNotesStr: '',
        volumeMl: 100,
        price: 990,
        promotionalPrice: undefined,
        sku: `AURA-${Date.now().toString(36).toUpperCase()}`,
        barcodeEan: '',
        physicalStock: {
          currentQuantity: 10,
          minimumThreshold: 2,
          shelfLocation: 'Galpão A - Prateleira 01',
          reservedOnline: 0,
        },
        status: 'active',
        isFeatured: false,
        isNewArrival: false,
        images: {
          primary: '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
          gallery: [],
          alt: '',
        },
        galleryStr: '',
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brandId || !productForm.price) {
      setActionFeedback({ type: 'error', message: 'Preencha o nome da fragrância, a marca e o preço.' });
      return;
    }

    setIsSaving(true);
    setActionFeedback(null);
    try {
      const selectedBrand = brandsList.find((b) => b.id === productForm.brandId);
      const topNotes = (productForm.topNotesStr || '').split(',').map((s) => s.trim()).filter(Boolean);
      const heartNotes = (productForm.heartNotesStr || '').split(',').map((s) => s.trim()).filter(Boolean);
      const baseNotes = (productForm.baseNotesStr || '').split(',').map((s) => s.trim()).filter(Boolean);
      const gallery = (productForm.galleryStr || '').split('\n').map((s) => s.trim()).filter(Boolean);

      const productToSave: FragranceProduct = {
        id: productForm.id || '',
        brandId: productForm.brandId,
        brandName: selectedBrand?.name || 'Casa Parceira',
        categoryId: productForm.categoryId || undefined,
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        concentration: (productForm.concentration as ConcentrationType) || 'Eau de Parfum',
        olfactoryFamily: (productForm.olfactoryFamily as OlfactoryFamily) || 'Amadeirado',
        olfactoryPyramid: {
          topNotes,
          heartNotes,
          baseNotes,
        },
        volumeMl: Number(productForm.volumeMl) || 50,
        price: Number(productForm.price) || 0,
        promotionalPrice: productForm.promotionalPrice ? Number(productForm.promotionalPrice) : undefined,
        sku: productForm.sku || `AURA-${Date.now().toString(36).toUpperCase()}`,
        barcodeEan: productForm.barcodeEan || undefined,
        physicalStock: {
          currentQuantity: Number(productForm.physicalStock?.currentQuantity) || 0,
          minimumThreshold: Number(productForm.physicalStock?.minimumThreshold) || 2,
          shelfLocation: productForm.physicalStock?.shelfLocation || 'Galpão Geral',
          reservedOnline: Number(productForm.physicalStock?.reservedOnline) || 0,
        },
        status: (productForm.status as any) || 'active',
        isFeatured: productForm.isFeatured ?? false,
        isNewArrival: productForm.isNewArrival ?? false,
        images: {
          primary: productForm.images?.primary || '/src/assets/images/hero_luxury_perfume_1793996140999.jpg',
          gallery,
          alt: productForm.images?.alt || productForm.name,
        },
      };

      const saved = await supabaseDatabaseService.saveProduct(productToSave);
      setActionFeedback({
        type: 'success',
        message: `Fragrância "${saved.name}" salva com sucesso no Supabase!`,
      });
      setIsProductModalOpen(false);
      await loadRealInventory();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Erro ao salvar fragrância no Supabase.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleProductStatus = async (product: FragranceProduct, newStatus: FragranceProduct['status']) => {
    setActionFeedback(null);
    try {
      await supabaseDatabaseService.toggleProductStatus(product.id, newStatus);
      setActionFeedback({
        type: 'success',
        message: `Status da fragrância "${product.name}" alterado para ${newStatus.toUpperCase()}.`,
      });
      await loadRealInventory();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Erro ao alterar status da fragrância.' });
    }
  };

  // Calculations
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

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.physicalStock.shelfLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#26241E]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Módulo Administrativo Restrito</span>
            <span aria-hidden="true">·</span>
            <span>Gestão Operacional AURA</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-[#F7F7F6]">
            Painel de Controle & Gestão Real
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-editorial">
            Ambiente isolado para gestão de marcas, categorias, inventário físico e liquidação de vendas.
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
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categorias ({categoriesList.length})</span>
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
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-[#D4AF37] text-[#0A0A0A] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Administradores</span>
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
            <span>Integrações</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {actionFeedback && (
        <div
          className={`mt-6 p-4 border flex items-center justify-between text-xs ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-neutral-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Supabase Status Banner */}
      {dataError && (
        <div className="mt-6 p-5 bg-[#14120C] border border-amber-900/40 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#ECC876]">
                <AlertTriangle className="w-4 h-4 text-[#ECC876]" />
                <span>Supabase AURA-PARFUMS (zfuqmqhirgbdxjlwhdqe)</span>
              </div>
              <h3 className="font-serif-luxury text-base text-white mt-1">
                Conexão com o banco operando em modo seguro
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
                Mensagem do banco: <span className="font-mono text-neutral-300">{dataError}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => loadRealInventory()}
                disabled={isLoadingRealData}
                className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#ECC876] text-black text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoadingRealData ? 'Consultando...' : 'Atualizar Dados'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            Frascos auditados
          </span>
        </LuxuryCard>

        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Patrimônio em Estoque</span>
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif-luxury text-xl sm:text-2xl text-[#ECC876] font-semibold mt-2 block tabular-nums">
            R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Valor a preço de catálogo
          </span>
        </LuxuryCard>

        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Casas Cadastradas</span>
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-white font-semibold mt-2 block tabular-nums">
            {brandsList.length}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Vitrines no Supabase ({brandsList.filter((b) => b.isActive).length} ativas)
          </span>
        </LuxuryCard>

        <LuxuryCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Categorias Cadastradas</span>
            <Tag className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-white font-semibold mt-2 block tabular-nums">
            {categoriesList.length}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Famílias olfativas ativas ({categoriesList.filter((c) => c.isActive).length} ativas)
          </span>
        </LuxuryCard>
      </div>

      {/* Main Tab Content Panels */}
      <div className="mt-8">
        {/* 1. Inventory View */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">Auditoria & Gestão de Fragrâncias</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Cadastre fragrâncias, edite pirâmide olfativa, localização por prateleira e controle de estoque real no Supabase.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Buscar SKU, nome ou local..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                  />
                </div>

                <GoldButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenProductModal()}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Cadastrar Fragrância
                </GoldButton>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto border border-[#26241E] bg-[#121212]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#26241E] bg-[#171717] text-[#C5A059] uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-3 px-4">Fragrância / Casa</th>
                    <th className="py-3 px-4">SKU / EAN</th>
                    <th className="py-3 px-4">Localização Física</th>
                    <th className="py-3 px-4 text-right">Saldo Atual</th>
                    <th className="py-3 px-4 text-right">Mínimo</th>
                    <th className="py-3 px-4 text-right">Preço Un.</th>
                    <th className="py-3 px-4 text-center">Situação</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26241E] text-neutral-300">
                  {filteredProducts.map((p) => {
                    const isLow = p.physicalStock.currentQuantity <= p.physicalStock.minimumThreshold;

                    return (
                      <tr key={p.id} className="hover:bg-[#181818] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images.primary}
                              alt={p.images.alt}
                              className="w-9 h-9 object-cover border border-[#26241E] shrink-0"
                            />
                            <div>
                              <span className="font-serif-luxury text-sm text-white font-medium block">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-neutral-400 block">
                                {p.brandName} · {p.concentration} ({p.volumeMl}ml)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
                          <div>{p.sku}</div>
                          <div className="text-[10px] text-neutral-600">{p.barcodeEan || '-'}</div>
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
                          {p.promotionalPrice && (
                            <div className="text-[10px] text-emerald-400 line-through text-neutral-500">
                              R$ {p.promotionalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-mono ${
                                p.status === 'active'
                                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60'
                                  : p.status === 'draft'
                                  ? 'text-amber-300 bg-amber-950/40 border border-amber-800/60'
                                  : 'text-neutral-400 bg-neutral-900 border border-neutral-700'
                              }`}
                            >
                              {p.status}
                            </span>
                            {isLow && (
                              <span className="text-[9px] text-amber-400">
                                Repor Estoque
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenProductModal(p)}
                              className="p-1.5 border border-[#26241E] hover:border-neutral-600 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Editar Fragrância"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() =>
                                handleToggleProductStatus(p, p.status === 'active' ? 'draft' : 'active')
                              }
                              className={`p-1.5 border transition-colors cursor-pointer ${
                                p.status === 'active'
                                  ? 'border-neutral-800 text-neutral-500 hover:text-amber-400 hover:border-amber-700'
                                  : 'border-[#D4AF37]/50 text-[#ECC876] hover:bg-[#D4AF37]/10'
                              }`}
                              title={p.status === 'active' ? 'Desativar (Draft)' : 'Ativar (Vitrine)'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400 font-editorial">
                        Nenhum produto cadastrado no estoque físico do Supabase.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Brands Management */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">Gestão de Vitrines & Marcas</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Cadastre e gerencie marcas de perfumaria parceiras gravadas diretamente no Supabase.
                </p>
              </div>

              <GoldButton
                variant="primary"
                size="sm"
                onClick={() => handleOpenBrandModal()}
                icon={<Plus className="w-4 h-4" />}
              >
                Cadastrar Nova Marca
              </GoldButton>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brandsList.map((brand) => (
                <LuxuryCard key={brand.id} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#C5A059]">
                          <span>Origem: {brand.countryOfOrigin}</span>
                          {brand.foundedYear && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Fundada em {brand.foundedYear}</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-serif-luxury text-lg text-white mt-1">
                          {brand.name}
                        </h3>
                        {brand.tagline && (
                          <span className="text-xs text-[#ECC876] font-serif-luxury italic block mt-0.5">
                            "{brand.tagline}"
                          </span>
                        )}
                        <p className="text-xs text-neutral-400 mt-2 font-editorial leading-relaxed line-clamp-3">
                          {brand.description || 'Sem descrição cadastrada.'}
                        </p>
                      </div>

                      <span className="font-mono text-xs px-2.5 py-1 bg-[#1A1A1A] border border-neutral-800 text-[#ECC876] shrink-0 font-semibold">
                        {brand.logoSymbol || 'BRAND'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#26241E] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400">
                        Vitrine:{' '}
                        <strong className={brand.isActive ? 'text-emerald-400' : 'text-neutral-500'}>
                          {brand.isActive ? 'Visível' : 'Oculta'}
                        </strong>
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        Ordem: #{brand.featuredOrder}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenBrandModal(brand)}
                        className="px-2.5 py-1.5 border border-[#26241E] hover:border-neutral-600 text-neutral-300 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleToggleBrandStatus(brand)}
                        className={`text-xs px-3 py-1.5 border transition-colors cursor-pointer ${
                          brand.isActive
                            ? 'border-neutral-700 text-neutral-300 hover:border-amber-600 hover:text-amber-400'
                            : 'border-[#D4AF37] text-[#ECC876] hover:bg-[#D4AF37]/10'
                        }`}
                      >
                        {brand.isActive ? 'Ocultar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </LuxuryCard>
              ))}

              {brandsList.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-400 border border-dashed border-[#26241E]">
                  <p className="font-serif-luxury text-base text-neutral-300">Nenhuma marca cadastrada no Supabase.</p>
                  <p className="text-xs text-neutral-500 mt-1">Clique no botão acima para adicionar a primeira marca de perfumaria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Categories Management */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">Gestão de Categorias Olfativas</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Cadastre e organize as famílias olfativas dos perfumes gravadas no banco de dados.
                </p>
              </div>

              <GoldButton
                variant="primary"
                size="sm"
                onClick={() => handleOpenCategoryModal()}
                icon={<Plus className="w-4 h-4" />}
              >
                Cadastrar Nova Categoria
              </GoldButton>
            </div>

            {/* Categories Table / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesList.map((cat) => (
                <LuxuryCard key={cat.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#D4AF37]" />
                        <h3 className="font-serif-luxury text-base text-white font-medium">
                          {cat.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#171717] border border-neutral-800 text-neutral-400">
                        #{cat.displayOrder}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-[#C5A059] block mt-1">
                      /{cat.slug}
                    </span>

                    <p className="text-xs text-neutral-400 mt-2 font-editorial leading-relaxed line-clamp-2">
                      {cat.description || 'Sem descrição.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#26241E] flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Status:{' '}
                      <strong className={cat.isActive ? 'text-emerald-400' : 'text-neutral-500'}>
                        {cat.isActive ? 'Ativa' : 'Inativa'}
                      </strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="px-2.5 py-1 border border-[#26241E] hover:border-neutral-600 text-neutral-300 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleToggleCategoryStatus(cat)}
                        className={`text-xs px-2.5 py-1 border transition-colors cursor-pointer ${
                          cat.isActive
                            ? 'border-neutral-700 text-neutral-400 hover:text-amber-400'
                            : 'border-[#D4AF37] text-[#ECC876]'
                        }`}
                      >
                        {cat.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </LuxuryCard>
              ))}

              {categoriesList.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-400 border border-dashed border-[#26241E]">
                  <p className="font-serif-luxury text-base text-neutral-300">Nenhuma categoria cadastrada no Supabase.</p>
                  <p className="text-xs text-neutral-500 mt-1">Clique no botão acima para cadastrar famílias como Amadeirado, Floral, etc.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Orders & Pix Verification */}
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

        {/* 5. Team & Administrator Management */}
        {activeTab === 'admins' && (
          <AdminManagement />
        )}

        {/* 6. Architecture & Integration Readiness */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">
                Arquitetura de Integrações — Camada 1 (Fundação)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Estrutura de contratos e adaptadores conectados ao Supabase real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Banco de Dados PostgreSQL</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Supabase AURA-PARFUMS
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Conexão ativa com o projeto zfuqmqhirgbdxjlwhdqe para persistência de estoque, marcas e categorias.
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-emerald-400 font-medium">Conectado (HTTP 200)</span>
                </div>
              </LuxuryCard>

              <LuxuryCard className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-serif-luxury text-sm text-white">Autenticação & Edge Functions</h3>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      aura-admin-manager
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Isolamento de privilégios de administrador via JWT e validação de papéis em private.is_admin().
                </p>
                <div className="mt-4 pt-3 border-t border-[#26241E] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-emerald-400 font-medium">Ativo & Protegido</span>
                </div>
              </LuxuryCard>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL: CADASTRAR / EDITAR MARCA
         ========================================== */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#121212] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsBrandModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1">
              <Building2 className="w-4 h-4" />
              <span>{brandForm.id ? 'Editar Marca' : 'Nova Vitrine Parceira'}</span>
            </div>

            <h3 className="font-serif-luxury text-2xl text-white">
              {brandForm.id ? brandForm.name : 'Cadastrar Nova Marca'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Gravação direta na tabela <code className="text-[#ECC876]">brands</code> do Supabase.
            </p>

            <form onSubmit={handleSaveBrandSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Nome da Marca *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandForm.name || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    placeholder="Ex: Tom Ford Private Blend"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Slug (URL Única)
                  </label>
                  <input
                    type="text"
                    value={brandForm.slug || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                    placeholder="Auto-gerado se vazio"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    País de Origem *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandForm.countryOfOrigin || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, countryOfOrigin: e.target.value })}
                    placeholder="Ex: França"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Ano de Fundação
                  </label>
                  <input
                    type="number"
                    value={brandForm.foundedYear || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, foundedYear: Number(e.target.value) })}
                    placeholder="Ex: 2006"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Símbolo (2-3 Letras)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={brandForm.logoSymbol || ''}
                    onChange={(e) => setBrandForm({ ...brandForm, logoSymbol: e.target.value.toUpperCase() })}
                    placeholder="Ex: TF"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={brandForm.tagline || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                  placeholder="Ex: Ousadia arquitetônica e matérias-primas raras"
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Descrição Editorial
                </label>
                <textarea
                  rows={3}
                  value={brandForm.description || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  placeholder="História da casa, extratos nobres e posicionamento olfativo..."
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-editorial"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Ordem de Destaque
                  </label>
                  <input
                    type="number"
                    value={brandForm.featuredOrder ?? 1}
                    onChange={(e) => setBrandForm({ ...brandForm, featuredOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandForm.isActive ?? true}
                      onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
                      className="accent-[#D4AF37]"
                    />
                    <span>Ativa / Visível na Vitrine Pública</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#26241E] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <GoldButton variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? 'Gravando...' : 'Salvar Marca no Supabase'}
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CADASTRAR / EDITAR CATEGORIA
         ========================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#121212] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1">
              <Tag className="w-4 h-4" />
              <span>{categoryForm.id ? 'Editar Categoria' : 'Nova Categoria Olfativa'}</span>
            </div>

            <h3 className="font-serif-luxury text-2xl text-white">
              {categoryForm.id ? categoryForm.name : 'Cadastrar Categoria'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Gravação direta na tabela <code className="text-[#ECC876]">categories</code> do Supabase.
            </p>

            <form onSubmit={handleSaveCategorySubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Nome da Categoria / Família Olfativa *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Amadeirado, Gourmand, Oriental / Âmbar"
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Slug (URL Única)
                </label>
                <input
                  type="text"
                  value={categoryForm.slug || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="Auto-gerado se vazio"
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-400 mb-1">
                  Descrição da Família Olfativa
                </label>
                <textarea
                  rows={3}
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Notas dominantes e sensação sensorial..."
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-editorial"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder ?? 1}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive ?? true}
                      onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                      className="accent-[#D4AF37]"
                    />
                    <span>Categoria Ativa</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#26241E] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <GoldButton variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? 'Gravando...' : 'Salvar Categoria no Supabase'}
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CADASTRAR / EDITAR FRAGRÂNCIA (PRODUTO)
         ========================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#121212] border border-[#D4AF37]/40 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-sm p-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1">
              <Boxes className="w-4 h-4" />
              <span>{productForm.id ? 'Editar Fragrância' : 'Nova Fragrância no Catálogo'}</span>
            </div>

            <h3 className="font-serif-luxury text-2xl text-white">
              {productForm.id ? productForm.name : 'Cadastrar Fragrância'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Persistência direta nas tabelas <code className="text-[#ECC876]">products</code>, <code className="text-[#ECC876]">inventory_stock</code> e <code className="text-[#ECC876]">product_images</code> do Supabase.
            </p>

            <form onSubmit={handleSaveProductSubmit} className="mt-6 space-y-5">
              {/* Informações Básicas */}
              <div className="space-y-4 pt-2 border-t border-[#26241E]">
                <h4 className="text-xs uppercase tracking-widest text-[#ECC876] font-mono">1. Identificação da Fragrância</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Nome do Perfume *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name || ''}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Ex: Oud Wood Extrait"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Casa / Marca Parceira *
                    </label>
                    <select
                      required
                      value={productForm.brandId || ''}
                      onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="" disabled>Selecione a Marca</option>
                      {brandsList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.countryOfOrigin})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Categoria Olfativa
                    </label>
                    <select
                      value={productForm.categoryId || ''}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="">Sem categoria definida</option>
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Concentração *
                    </label>
                    <select
                      value={productForm.concentration || 'Eau de Parfum'}
                      onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value as ConcentrationType })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Extrait de Parfum">Extrait de Parfum</option>
                      <option value="Eau de Parfum">Eau de Parfum</option>
                      <option value="Parfum">Parfum</option>
                      <option value="Eau de Toilette">Eau de Toilette</option>
                      <option value="Eau de Cologne">Eau de Cologne</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Família Olfativa *
                    </label>
                    <select
                      value={productForm.olfactoryFamily || 'Amadeirado'}
                      onChange={(e) => setProductForm({ ...productForm, olfactoryFamily: e.target.value as OlfactoryFamily })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Amadeirado">Amadeirado</option>
                      <option value="Oriental / Âmbar">Oriental / Âmbar</option>
                      <option value="Floral">Floral</option>
                      <option value="Cítrico">Cítrico</option>
                      <option value="Gourmand">Gourmand</option>
                      <option value="Couro">Couro</option>
                      <option value="Aromático Fougère">Aromático Fougère</option>
                      <option value="Chipre">Chipre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pirâmide Olfativa */}
              <div className="space-y-4 pt-3 border-t border-[#26241E]">
                <h4 className="text-xs uppercase tracking-widest text-[#ECC876] font-mono">2. Pirâmide Olfativa (Notas)</h4>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Notas de Topo / Saída (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={productForm.topNotesStr || ''}
                    onChange={(e) => setProductForm({ ...productForm, topNotesStr: e.target.value })}
                    placeholder="Ex: Bergamota de Calábria, Pimenta Rosa, Cardamomo"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Notas de Coração / Corpo (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={productForm.heartNotesStr || ''}
                    onChange={(e) => setProductForm({ ...productForm, heartNotesStr: e.target.value })}
                    placeholder="Ex: Jasmin de Grasse, Iris Florentina, Rosa Damascena"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Notas de Fundo / Base (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={productForm.baseNotesStr || ''}
                    onChange={(e) => setProductForm({ ...productForm, baseNotesStr: e.target.value })}
                    placeholder="Ex: Âmbar Cinzento, Oud Cambodjano, Fava Tonka"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Valores & SKU */}
              <div className="space-y-4 pt-3 border-t border-[#26241E]">
                <h4 className="text-xs uppercase tracking-widest text-[#ECC876] font-mono">3. Preço, SKU & Volume</h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Volume (ML) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.volumeMl || 100}
                      onChange={(e) => setProductForm({ ...productForm, volumeMl: Number(e.target.value) })}
                      placeholder="Ex: 100"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      placeholder="Ex: 1890.00"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Preço Promocional
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.promotionalPrice || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          promotionalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Ex: 1650.00"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      SKU Único *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.sku || ''}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="Ex: AURA-TF-001"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Código EAN / GTIN (Opcional)
                  </label>
                  <input
                    type="text"
                    value={productForm.barcodeEan || ''}
                    onChange={(e) => setProductForm({ ...productForm, barcodeEan: e.target.value })}
                    placeholder="Ex: 3380810423101"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Estoque Físico */}
              <div className="space-y-4 pt-3 border-t border-[#26241E]">
                <h4 className="text-xs uppercase tracking-widest text-[#ECC876] font-mono">4. Gestão de Estoque Físico</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Quantidade Atual em Saldo *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.physicalStock?.currentQuantity ?? 10}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          physicalStock: {
                            ...(productForm.physicalStock || { minimumThreshold: 2, shelfLocation: 'Galpão A', reservedOnline: 0 }),
                            currentQuantity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-serif-luxury font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Limiar Mínimo (Alerta Reposição) *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.physicalStock?.minimumThreshold ?? 2}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          physicalStock: {
                            ...(productForm.physicalStock || { currentQuantity: 10, shelfLocation: 'Galpão A', reservedOnline: 0 }),
                            minimumThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-neutral-400 mb-1">
                      Localização Física (Prateleira / Depósito) *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.physicalStock?.shelfLocation || 'Depósito Geral'}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          physicalStock: {
                            ...(productForm.physicalStock || { currentQuantity: 10, minimumThreshold: 2, reservedOnline: 0 }),
                            shelfLocation: e.target.value,
                          },
                        })
                      }
                      placeholder="Ex: Cofre Climatizado - Prateleira A-02"
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fotos & Galeria */}
              <div className="space-y-4 pt-3 border-t border-[#26241E]">
                <h4 className="text-xs uppercase tracking-widest text-[#ECC876] font-mono">5. Imagem Principal & Galeria</h4>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    URL da Imagem Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.images?.primary || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        images: { ...(productForm.images || { alt: '' }), primary: e.target.value },
                      })
                    }
                    placeholder="Ex: /src/assets/images/hero_luxury_perfume_1793996140999.jpg ou URL HTTPS"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Imagens Adicionais da Galeria (uma URL por linha)
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.galleryStr || ''}
                    onChange={(e) => setProductForm({ ...productForm, galleryStr: e.target.value })}
                    placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Situação e Visibilidade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#26241E]">
                <div>
                  <label className="block text-xs uppercase text-neutral-400 mb-1">
                    Status no Sistema *
                  </label>
                  <select
                    value={productForm.status || 'active'}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="active">Active (Visível na Vitrine)</option>
                    <option value="draft">Draft (Rascunho Oculto)</option>
                    <option value="out_of_stock">Out of Stock (Esgotado)</option>
                    <option value="archived">Archived (Arquivado)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured ?? false}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="accent-[#D4AF37]"
                    />
                    <span>Destaque na Vitrine Principal</span>
                  </label>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNewArrival ?? false}
                      onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                      className="accent-[#D4AF37]"
                    />
                    <span>Selo Lançamento Exclusivo</span>
                  </label>
                </div>
              </div>

              {/* Form Submission Controls */}
              <div className="mt-8 pt-4 border-t border-[#26241E] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <GoldButton variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? 'Gravando no Supabase...' : 'Salvar Fragrância no Supabase'}
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
