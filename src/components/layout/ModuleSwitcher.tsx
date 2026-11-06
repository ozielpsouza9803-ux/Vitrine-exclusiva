import React from 'react';
import { Store, UserCircle, ShieldAlert } from 'lucide-react';
import { AppModule } from '../../types';

interface ModuleSwitcherProps {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
}

export const ModuleSwitcher: React.FC<ModuleSwitcherProps> = ({
  currentModule,
  onSelectModule,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-1.5 bg-[#121212]/90 backdrop-blur-md border border-[#D4AF37]/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => onSelectModule('public')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
            currentModule === 'public'
              ? 'bg-gradient-to-r from-[#DFBF70] to-[#D4AF37] text-[#0A0A0A] font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Loja Pública</span>
        </button>

        <button
          onClick={() => onSelectModule('customer')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
            currentModule === 'customer'
              ? 'bg-gradient-to-r from-[#DFBF70] to-[#D4AF37] text-[#0A0A0A] font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <UserCircle className="w-3.5 h-3.5" />
          <span>Área do Cliente</span>
        </button>

        <button
          onClick={() => onSelectModule('admin')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
            currentModule === 'admin'
              ? 'bg-gradient-to-r from-[#DFBF70] to-[#D4AF37] text-[#0A0A0A] font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Painel Admin</span>
        </button>
      </div>
    </div>
  );
};
