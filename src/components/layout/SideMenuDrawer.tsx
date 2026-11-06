import React from 'react';
import {
  Home,
  Sparkles,
  Building2,
  ShieldCheck,
  MessageSquareCode,
  User,
  ShieldAlert,
  X,
  ChevronRight,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { AppModule } from '../../types';

export type PublicTab = 'home' | 'vitrine' | 'marcas' | 'como-funciona' | 'atendimento' | 'cliente' | 'chat';

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onSelectModule: (module: AppModule) => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onSelectModule,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Content Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0E0E0E] border-r border-[#D4AF37]/30 h-full flex flex-col justify-between shadow-[10px_0_40px_rgba(0,0,0,0.9)] z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div>
          <div className="p-6 border-b border-[#26241E] flex items-center justify-between">
            <div>
              <span className="font-serif-luxury text-xl tracking-[0.2em] text-[#F7F7F6] block">
                AURA PARFUMS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] block mt-0.5 font-mono">
                Haute Parfumerie & Nicho
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors cursor-pointer"
              aria-label="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => {
                onSelectTab('home');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-[#1C1A14] text-[#ECC876] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-[#D4AF37]" />
                <span>Início</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => {
                onSelectTab('vitrine');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'vitrine'
                  ? 'bg-[#1C1A14] text-[#ECC876] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Vitrine de Produtos</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => {
                onSelectTab('marcas');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'marcas'
                  ? 'bg-[#1C1A14] text-[#ECC876] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Vitrines & Marcas</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => {
                onSelectTab('como-funciona');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'como-funciona'
                  ? 'bg-[#1C1A14] text-[#ECC876] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Como Funciona</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => {
                onSelectTab('chat');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'chat'
                  ? 'bg-[#1C1A14] text-[#ECC876] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquareCode className="w-4 h-4 text-[#D4AF37]" />
                <span>Atendimento & Concierge</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => {
                onSelectTab('cliente');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'cliente'
                  ? 'bg-[#1C1A14] text-[#ECC876] border-l-2 border-[#D4AF37] font-semibold'
                  : 'text-neutral-300 hover:bg-[#171717] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Entrar / Cadastrar-se</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-[#26241E] space-y-4">
          {/* Quick Admin Access Link */}
          <button
            onClick={() => {
              onSelectModule('admin');
              onClose();
            }}
            className="w-full py-2.5 px-3 bg-[#171717] hover:bg-[#202020] border border-[#D4AF37]/40 text-[#ECC876] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
            <span>Painel Administrativo</span>
          </button>

          <div className="text-[11px] text-neutral-400 space-y-1 font-editorial">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>100% Estoque Físico Auditado</span>
            </div>
            <p>Frascos com selo de garantia e envio imediato via Pix.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
