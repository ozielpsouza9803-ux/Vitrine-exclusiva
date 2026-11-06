import React, { useState } from 'react';
import { Menu, X, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { AppModule } from '../../types';

interface HeaderProps {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  cartCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#26241E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant 3-Zone Top Bar */}
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark (Display serif face, single text element, no subtitle) */}
          <button
            onClick={() => onSelectModule('public')}
            className="text-left font-serif-luxury text-xl sm:text-2xl tracking-[0.22em] text-[#F7F7F6] hover:text-[#ECC876] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            AURA PARFUMS
          </button>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs tracking-widest uppercase text-neutral-300 font-medium">
            <button
              onClick={() => onSelectModule('public')}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
                currentModule === 'public'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Vitrines de Marca
            </button>
            <button
              onClick={() => onSelectModule('public')}
              className="hover:text-[#ECC876] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent"
            >
              Alta Perfumaria
            </button>
            <button
              onClick={() => onSelectModule('customer')}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
                currentModule === 'customer'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Área do Cliente
            </button>
            <button
              onClick={() => onSelectModule('admin')}
              className={`hover:text-[#ECC876] transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
                currentModule === 'admin'
                  ? 'text-[#ECC876] border-[#D4AF37]'
                  : 'border-transparent'
              }`}
            >
              Gestão & Estoque
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick cart badge if shopping */}
            <button
              onClick={() => onSelectModule('public')}
              className="relative p-2.5 text-neutral-300 hover:text-[#ECC876] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Sacola de Compras"
              aria-label="Sacola de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => onSelectModule(currentModule === 'admin' ? 'public' : 'admin')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-[#171717] hover:bg-[#202020] text-[#ECC876] border border-[#D4AF37]/40 transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
            >
              {currentModule === 'admin' ? (
                <>
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Ver Loja</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Painel Admin</span>
                </>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-neutral-300 hover:text-[#ECC876] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#26241E] flex flex-col gap-3">
            <button
              onClick={() => {
                onSelectModule('public');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-xs uppercase tracking-widest ${
                currentModule === 'public' ? 'text-[#ECC876] bg-[#171717]' : 'text-neutral-300'
              }`}
            >
              Vitrines das Marcas (Loja Pública)
            </button>
            <button
              onClick={() => {
                onSelectModule('customer');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-xs uppercase tracking-widest ${
                currentModule === 'customer' ? 'text-[#ECC876] bg-[#171717]' : 'text-neutral-300'
              }`}
            >
              Área do Cliente (Meus Pedidos)
            </button>
            <button
              onClick={() => {
                onSelectModule('admin');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-xs uppercase tracking-widest ${
                currentModule === 'admin' ? 'text-[#ECC876] bg-[#171717]' : 'text-neutral-300'
              }`}
            >
              Painel Administrativo & Estoque Físico
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
