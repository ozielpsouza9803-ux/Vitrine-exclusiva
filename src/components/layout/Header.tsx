import React from 'react';
import { Menu, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { AppModule } from '../../types';
import { PublicTab } from './SideMenuDrawer';

interface HeaderProps {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  cartCount?: number;
  onOpenMenu: () => void;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  currentTab,
  onSelectTab,
  cartCount = 0,
  onOpenMenu,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#26241E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          {/* Zone 1: Menu Lateral Button & Logotipo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Menu Lateral Hamburger Trigger */}
            <button
              onClick={onOpenMenu}
              className="p-2 text-neutral-300 hover:text-[#ECC876] hover:bg-[#141414] border border-[#26241E] transition-colors flex items-center gap-2 cursor-pointer"
              title="Abrir Menu Lateral"
              aria-label="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5 text-[#D4AF37]" />
              <span className="hidden sm:inline text-[11px] font-semibold tracking-widest uppercase">
                Menu
              </span>
            </button>

            {/* Logotipo AURA PARFUMS */}
            <button
              onClick={() => {
                onSelectModule('public');
                onSelectTab('home');
              }}
              className="text-left font-serif-luxury text-lg sm:text-2xl tracking-[0.22em] text-[#F7F7F6] hover:text-[#ECC876] transition-colors whitespace-nowrap cursor-pointer"
            >
              AURA PARFUMS
            </button>
          </div>

          {/* Zone 2: Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-xs tracking-widest uppercase text-neutral-300 font-medium">
            <button
              onClick={() => {
                onSelectModule('public');
                onSelectTab('home');
              }}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap py-1 border-b ${
                currentModule === 'public' && currentTab === 'home'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Início
            </button>

            <button
              onClick={() => {
                onSelectModule('public');
                onSelectTab('vitrine');
              }}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap py-1 border-b ${
                currentModule === 'public' && currentTab === 'vitrine'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Vitrine
            </button>

            <button
              onClick={() => {
                onSelectModule('customer');
                onSelectTab('cliente');
              }}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap py-1 border-b ${
                currentModule === 'customer' || currentTab === 'cliente'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Área do Cliente
            </button>

            <button
              onClick={() => {
                onSelectModule('public');
                onSelectTab('chat');
              }}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap py-1 border-b ${
                currentTab === 'chat'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Chat & SAC
            </button>
          </nav>

          {/* Zone 3: Actions (Sacola & Admin Link) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sacola de Compras Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 text-neutral-300 hover:text-[#ECC876] hover:bg-[#141414] border border-[#26241E] transition-colors flex items-center justify-center cursor-pointer min-h-[40px] min-w-[40px]"
              title="Abrir Sacola de Compras"
              aria-label="Sacola de compras"
            >
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Switcher Action Button */}
            <button
              onClick={() => onSelectModule(currentModule === 'admin' ? 'public' : 'admin')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold tracking-wider uppercase bg-[#171717] hover:bg-[#202020] text-[#ECC876] border border-[#D4AF37]/40 transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
            >
              {currentModule === 'admin' ? (
                <>
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Ver Loja</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Painel Admin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
