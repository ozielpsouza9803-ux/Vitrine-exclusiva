import React from 'react';
import { Home, Sparkles, User, MessageSquareCode } from 'lucide-react';
import { PublicTab } from './SideMenuDrawer';

interface FixedBottomNavProps {
  currentTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
}

export const FixedBottomNav: React.FC<FixedBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#26241E] shadow-[0_-4px_25px_rgba(0,0,0,0.9)]">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
        {/* 1. INÍCIO */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            currentTab === 'home' || currentTab === 'marcas' || currentTab === 'como-funciona'
              ? 'text-[#ECC876]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
            {(currentTab === 'home' || currentTab === 'marcas' || currentTab === 'como-funciona') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase mt-1">
            INÍCIO
          </span>
        </button>

        {/* 2. VITRINE */}
        <button
          onClick={() => onSelectTab('vitrine')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            currentTab === 'vitrine'
              ? 'text-[#ECC876]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 transition-transform group-hover:scale-110" />
            {currentTab === 'vitrine' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase mt-1">
            VITRINE
          </span>
        </button>

        {/* 3. CLIENTE */}
        <button
          onClick={() => onSelectTab('cliente')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            currentTab === 'cliente'
              ? 'text-[#ECC876]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 transition-transform group-hover:scale-110" />
            {currentTab === 'cliente' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase mt-1">
            CLIENTE
          </span>
        </button>

        {/* 4. CHAT */}
        <button
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer group ${
            currentTab === 'chat' || currentTab === 'atendimento'
              ? 'text-[#ECC876]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquareCode className="w-5 h-5 transition-transform group-hover:scale-110" />
            {(currentTab === 'chat' || currentTab === 'atendimento') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase mt-1">
            CHAT
          </span>
        </button>
      </div>
    </div>
  );
};
