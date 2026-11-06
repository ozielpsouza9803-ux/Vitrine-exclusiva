/**
 * @file src/App.tsx
 * @description Ponto de entrada da plataforma AURA Parfums — Camada 1: Fundação.
 * Orquestra de forma desacoplada a Área Pública, Área do Cliente e Painel Administrativo.
 */

import { useState } from 'react';
import { AppModule, FragranceProduct } from './types';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ModuleSwitcher } from './components/layout/ModuleSwitcher';
import { PublicStorefront } from './modules/public/PublicStorefront';
import { CustomerPortal } from './modules/customer/CustomerPortal';
import { AdminDashboard } from './modules/admin/AdminDashboard';

export default function App() {
  const [currentModule, setCurrentModule] = useState<AppModule>('public');
  const [cart, setCart] = useState<Array<{ product: FragranceProduct; quantity: number }>>([]);

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
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F7F7F6] flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black">
      {/* 1. Global Navigation Header (Top Bar Contract Compliant) */}
      <Header
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        cartCount={totalCartCount}
      />

      {/* 2. Isolated Modular Viewports */}
      <main className="grow w-full">
        {currentModule === 'public' && (
          <PublicStorefront onAddToCart={handleAddToCart} />
        )}

        {currentModule === 'customer' && (
          <CustomerPortal />
        )}

        {currentModule === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer />

      {/* 4. Architectural Module Switcher for Evaluation */}
      <ModuleSwitcher
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
      />
    </div>
  );
}
