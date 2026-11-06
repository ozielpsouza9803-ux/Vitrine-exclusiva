import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ShieldCheck, QrCode } from 'lucide-react';
import { FragranceProduct } from '../../types';
import { GoldButton } from '../ui/GoldButton';

export interface CartItem {
  product: FragranceProduct;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutPix: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutPix,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-[#121212] border-l border-[#D4AF37]/30 h-full flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#26241E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h2 className="font-serif-luxury text-lg text-white font-medium">Sacola de Perfumes</h2>
              <span className="text-[11px] text-neutral-400">
                {totalCount} {totalCount === 1 ? 'item reservado' : 'itens reservados'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Fechar Sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="p-6 grow space-y-4 overflow-y-auto divide-y divide-[#26241E]">
          {cart.map(({ product, quantity }) => (
            <div key={product.id} className="pt-4 first:pt-0 flex items-start gap-4">
              <img
                src={product.images.primary}
                alt={product.images.alt}
                className="w-16 h-20 object-cover bg-[#0A0A0A] border border-[#26241E] shrink-0"
              />

              <div className="grow">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A059] block">
                      {product.brandName}
                    </span>
                    <h4 className="font-serif-luxury text-sm text-white font-medium leading-snug">
                      {product.name}
                    </h4>
                    <span className="text-[11px] text-neutral-400 block mt-0.5 font-editorial">
                      {product.concentration} · {product.volumeMl}ml
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-neutral-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-[#26241E] bg-[#0A0A0A]">
                    <button
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-serif-luxury text-sm text-[#ECC876] font-semibold tabular-nums">
                    R$ {(product.price * quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-16 text-center text-neutral-400 font-editorial">
              <ShoppingBag className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <p className="font-serif-luxury text-base text-neutral-300">Sua sacola está vazia.</p>
              <p className="text-xs text-neutral-500 mt-1">Explore a vitrine para adicionar frascos com envio Pix.</p>
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#26241E] bg-[#0A0A0A] space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono text-neutral-200">
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Frete Seguro (Sedex Climatizado)</span>
                <span className="font-mono text-emerald-400">Grátis via Pix</span>
              </div>
              <div className="pt-2 border-t border-[#26241E] flex justify-between items-baseline text-sm">
                <span className="font-serif-luxury text-white">Total</span>
                <span className="font-serif-luxury text-lg text-[#ECC876] font-semibold tabular-nums">
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <GoldButton
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={onCheckoutPix}
              icon={<QrCode className="w-4 h-4" />}
            >
              Finalizar Pedido via Pix
            </GoldButton>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Estoque Próprio Reservado Instantaneamente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
