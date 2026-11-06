/**
 * @file src/App.tsx
 * @description Ponto de entrada e orquestrador principal da AURA Parfums.
 * Integra o Cabeçalho Compacto, Menu Lateral (Slide-Over), Rodapé Fixo (INÍCIO, VITRINE, CLIENTE, CHAT),
 * Sacola de Compras e o Painel Administrativo.
 */

import { useState, useEffect } from 'react';
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
import { LoginModule, ResetPasswordModule } from './modules/auth/LoginModule';
import { supabaseAuthService } from './services/supabaseAuthService';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('public');
  const [currentTab, setCurrentTab] = useState<PublicTab>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pixNotice, setPixNotice] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(window.location.hash === '#reset-password');
  
  const [user, setUser] = useState<{id: string; email: string; role: 'customer' | 'admin'} | null>(null);

  useEffect(() => {
    supabaseAuthService.getCurrentUser().then(setUser);
    
    // Listen for hash changes to detect password recovery
    const handleHashChange = () => {
        setIsResettingPassword(window.location.hash === '#reset-password');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const handleSelectTab = (tab: PublicTab) => {
    setCurrentTab(tab);
    if (tab === 'cliente') {
      setCurrentModule('customer');
    } else {
      setCurrentModule('public');
    }
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const renderModule = () => {
    if (isResettingPassword) {
        return <ResetPasswordModule onSaveSuccess={() => {
            window.location.hash = '';
            setIsResettingPassword(false);
            supabaseAuthService.getCurrentUser().then(setUser);
        }} />;
    }
    if (currentModule === 'admin') {
      if (!user || user.role !== 'admin') {
        return <LoginModule mode="admin" onLoginSuccess={() => supabaseAuthService.getCurrentUser().then(setUser)} />;
      }
      return <AdminDashboard />;
    }

    if (currentModule === 'customer') {
      if (!user) {
        return <LoginModule mode="customer" onLoginSuccess={() => supabaseAuthService.getCurrentUser().then(setUser)} />;
      }
      return <div className="pb-24"><CustomerPortal /></div>;
    }

    if (currentTab === 'chat') return <ConciergeChat />;
    return (
      <PublicStorefront
        onAddToCart={handleAddToCart}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F6] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      <Header
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        cartCount={totalCartCount}
        onOpenMenu={() => setIsSideMenuOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

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

      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onSelectModule={setCurrentModule}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckoutSuccess={(orderNumber) => {
          setCart([]);
          setPixNotice(`Pedido ${orderNumber} criado com sucesso e Pix gerado!`);
        }}
      />

      <main className="grow w-full">
        {renderModule()}
      </main>

      <Footer />

      {currentModule !== 'admin' && (
        <FixedBottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
        />
      )}
    </div>
  );
}
