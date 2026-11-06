/**
 * @file src/App.tsx
 * @description Ponto de entrada e orquestrador principal da AURA Parfums.
 * Integra o Cabeçalho Compacto, Menu Lateral (Slide-Over), Rodapé Fixo (INÍCIO, VITRINE, CLIENTE, CHAT),
 * Sacola de Compras e o Painel Administrativo.
 */

import { useState } from 'react';
import { AppModule, FragranceProduct } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SideMenuDrawer, PublicTab } from './components/layout/SideMenuDrawer';
import { FixedBottomNav } from './components/layout/FixedBottomNav';
import { CartDrawer, CartItem } from './components/cart/CartDrawer';
import { PublicStorefront } from './modules/public/PublicStorefront';
import { ConciergeChat } from './modules/public/ConciergeChat';
import { CustomerPortal } from './modules/customer/CustomerPortal';
import { AdminDashboard } from './modules/admin/AdminDashboard';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('public');
  const [currentTab, setCurrentTab] = useState<PublicTab>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pixNotice, setPixNotice] = useState<string | null>(null);

  // Cart operations
  const handleAddToCart = (product: FragranceProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckoutPix = () => {
    setPixNotice('Cobrança Pix gerada com sucesso! Seu produto foi reservado no cofre climatizado da AURA Parfums.');
    setCart([]);
    setIsCartOpen(false);
    setTimeout(() => setPixNotice(null), 7000);
  };

  const handleSelectTab = (tab: PublicTab) => {
    setCurrentTab(tab);
    if (tab === 'cliente') {
      setCurrentModule('customer');
    } else {
      setCurrentModule('public');
    }
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F6] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      {/* 1. Cabeçalho Compacto */}
      <Header
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        cartCount={totalCartCount}
        onOpenMenu={() => setIsSideMenuOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Pix Notification Toast */}
      {pixNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="p-4 bg-[#14120C] border border-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 text-xs">
            <span className="text-[#ECC876] font-medium leading-relaxed font-serif-luxury">
              {pixNotice}
            </span>
            <button
              onClick={() => setPixNotice(null)}
              className="text-neutral-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Slide-Over Menu Lateral (Drawer) */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onSelectModule={setCurrentModule}
      />

      {/* 3. Sacola de Compras (Cart Drawer) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckoutPix={handleCheckoutPix}
      />

      {/* 4. Isolated Viewports */}
      <main className="grow w-full">
        {currentModule === 'public' && currentTab !== 'chat' && (
          <PublicStorefront
            onAddToCart={handleAddToCart}
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
          />
        )}

        {currentModule === 'public' && currentTab === 'chat' && (
          <ConciergeChat />
        )}

        {currentModule === 'customer' && (
          <div className="pb-24">
            <CustomerPortal />
          </div>
        )}

        {currentModule === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* 5. Global Footer */}
      <Footer />

      {/* 6. RODAPÉ FIXO DE NAVEGAÇÃO PÚBLICA (Exatamente 4 Opções: INÍCIO, VITRINE, CLIENTE, CHAT) */}
      {currentModule !== 'admin' && (
        <FixedBottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
        />
      )}
    </div>
  );
}
