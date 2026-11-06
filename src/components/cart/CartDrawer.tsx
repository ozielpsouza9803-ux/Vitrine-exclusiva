import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ShieldCheck, QrCode, ArrowLeft, CheckCircle } from 'lucide-react';
import { FragranceProduct, Order } from '../../types';
import { GoldButton } from '../ui/GoldButton';
import { supabaseDatabaseService } from '../../services/supabaseDatabaseService';
import { supabasePixService } from '../../services/supabasePixService';

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
  onCheckoutSuccess?: (orderNumber: string, qrCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutSuccess,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'pix'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPix, setGeneratedPix] = useState<{ orderNumber: string; qrCode: string; amount: number } | null>(null);

  const [customerForm, setCustomerForm] = useState({
    fullName: 'Oziel Souza',
    email: 'ozielpsouza9803@gmail.com',
    phone: '(11) 98765-4321',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apt 101',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
  });

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleProceedToCheckout = () => {
    setErrorMessage(null);
    setStep('checkout');
  };

  const handleCreateOrderAndPix = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderNumber = `AURA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderPayload: Order = {
        id: '',
        orderNumber,
        customerProfileId: '',
        customerName: customerForm.fullName,
        customerEmail: customerForm.email,
        customerPhone: customerForm.phone,
        items: cart.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          brandName: i.product.brandName,
          concentration: i.product.concentration,
          volumeMl: i.product.volumeMl,
          unitPrice: i.product.price,
          quantity: i.quantity,
          subtotal: i.product.price * i.quantity,
        })),
        subtotal,
        shippingFee: 0,
        total: subtotal,
        status: 'AGUARDANDO_PIX',
        paymentMethod: 'PIX',
        shippingAddress: {
          street: customerForm.street,
          number: customerForm.number,
          complement: customerForm.complement,
          neighborhood: customerForm.neighborhood,
          city: customerForm.city,
          state: customerForm.state,
          zipCode: customerForm.zipCode,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orderId = await supabaseDatabaseService.createOrder(orderPayload);
      const pixCharge = await supabasePixService.generatePixCharge(orderId, subtotal);

      setGeneratedPix({
        orderNumber,
        qrCode: pixCharge.qrCodeCopyPaste,
        amount: subtotal,
      });

      setStep('pix');
      if (onCheckoutSuccess) {
        onCheckoutSuccess(orderNumber, pixCharge.qrCodeCopyPaste);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar pedido e Pix.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {step !== 'cart' && (
              <button
                onClick={() => setStep('cart')}
                className="text-neutral-400 hover:text-white mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h2 className="font-serif-luxury text-lg text-white font-medium">
                {step === 'cart' && 'Sacola de Perfumes'}
                {step === 'checkout' && 'Endereço e Cliente'}
                {step === 'pix' && 'Pagamento Pix Instantâneo'}
              </h2>
              <span className="text-[11px] text-neutral-400">
                {step === 'cart' && `${totalCount} ${totalCount === 1 ? 'item' : 'itens'} reservados`}
                {step === 'checkout' && 'Confirmação de Envio'}
                {step === 'pix' && 'Reserva Climatizada Ativa'}
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

        {/* Error message banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: CART ITEMS */}
        {step === 'cart' && (
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
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <form onSubmit={handleCreateOrderAndPix} className="p-6 grow space-y-4 overflow-y-auto text-xs">
            <h3 className="font-serif-luxury text-sm text-[#ECC876] uppercase tracking-wider mb-2">
              Dados do Comprador & Endereço
            </h3>

            <div>
              <label className="block uppercase text-neutral-400 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={customerForm.fullName}
                onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block uppercase text-neutral-400 mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="col-span-2">
                <label className="block uppercase text-neutral-400 mb-1">Rua / Logradouro *</label>
                <input
                  type="text"
                  required
                  value={customerForm.street}
                  onChange={(e) => setCustomerForm({ ...customerForm, street: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1">Número *</label>
                <input
                  type="text"
                  required
                  value={customerForm.number}
                  onChange={(e) => setCustomerForm({ ...customerForm, number: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block uppercase text-neutral-400 mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  value={customerForm.neighborhood}
                  onChange={(e) => setCustomerForm({ ...customerForm, neighborhood: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1">CEP *</label>
                <input
                  type="text"
                  required
                  value={customerForm.zipCode}
                  onChange={(e) => setCustomerForm({ ...customerForm, zipCode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block uppercase text-neutral-400 mb-1">Cidade *</label>
                <input
                  type="text"
                  required
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block uppercase text-neutral-400 mb-1">Estado (UF) *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={customerForm.state}
                  onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#26241E] text-white outline-none focus:border-[#D4AF37] font-mono uppercase text-center"
                />
              </div>
            </div>

            <div className="pt-4">
              <GoldButton
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center"
                disabled={isSubmitting}
                icon={<QrCode className="w-4 h-4" />}
              >
                {isSubmitting ? 'Gerando Cobrança Pix...' : 'Gerar Pix e Reservar Estoque'}
              </GoldButton>
            </div>
          </form>
        )}

        {/* STEP 3: PIX GENERATED VIEW */}
        {step === 'pix' && generatedPix && (
          <div className="p-6 grow space-y-6 overflow-y-auto text-center">
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 rounded-none flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <h4 className="font-serif-luxury text-base text-white">Pedido {generatedPix.orderNumber} Registrado!</h4>
              <p className="text-xs text-neutral-300">Seu frasco foi reservado no cofre climatizado. Conclua o pagamento via Pix abaixo.</p>
            </div>

            <div className="p-5 bg-[#171717] border border-[#26241E] space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-[#C5A059] block">Chave Pix Copia e Cola</span>
              <div className="p-3 bg-black border border-neutral-800 font-mono text-[11px] text-[#ECC876] break-all select-all">
                {generatedPix.qrCode}
              </div>
              <GoldButton
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  navigator.clipboard.writeText(generatedPix.qrCode);
                  alert('Código Pix copiado para a área de transferência!');
                }}
              >
                Copiar Código Pix
              </GoldButton>
            </div>

            <div className="pt-2">
              <GoldButton
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={onClose}
              >
                Concluir & Acompanhar Pedido
              </GoldButton>
            </div>
          </div>
        )}

        {/* Footer & Checkout Trigger */}
        {step === 'cart' && cart.length > 0 && (
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
              onClick={handleProceedToCheckout}
              icon={<QrCode className="w-4 h-4" />}
            >
              Avançar para Checkout Pix
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
