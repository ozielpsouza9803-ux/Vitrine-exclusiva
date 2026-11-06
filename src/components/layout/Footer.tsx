import React from 'react';
import { ShieldCheck, Sparkles, Truck, QrCode } from 'lucide-react';
import { GoldDivider } from '../ui/GoldDivider';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080808] border-t border-[#26241E] mt-24">
      {/* Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium tracking-wide text-neutral-200">Procedência 100% Original</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Frascos lacrados e importação direta das casas oficiais de alta perfumaria.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium tracking-wide text-neutral-200">Estoque Físico Climatizado</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Armazenamento com temperatura e luminosidade controladas para preservação das notas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <QrCode className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium tracking-wide text-neutral-200">Pagamento Pix Instantâneo</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Baixa imediata em estoque e despacho prioritário com chave de segurança.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium tracking-wide text-neutral-200">Envio Seguro com Rastreio</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Embalagem reforçada anti-impacto e seguro total contra extravio.
              </p>
            </div>
          </div>
        </div>

        <GoldDivider className="my-10" />

        {/* Brand & Editorial Column */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div className="text-center md:text-left">
            <span className="font-serif-luxury text-sm tracking-[0.2em] text-[#C5A059] block">
              AURA PARFUMS
            </span>
            <span className="mt-1 block">
              Plataforma de Perfumaria Multimarcas — Todos os direitos reservados.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400 text-xs">
            <span>Autenticidade Garantida</span>
            <span aria-hidden="true">·</span>
            <span>Estoque Próprio</span>
            <span aria-hidden="true">·</span>
            <span>Vitrines Oficiais</span>
            <span aria-hidden="true">·</span>
            <span>Privacidade & Segurança</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
