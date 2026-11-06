import React, { useState } from 'react';
import { MessageSquareCode, Send, Sparkles, ShieldCheck, QrCode, RefreshCw } from 'lucide-react';
import { GoldButton } from '../../components/ui/GoldButton';
import { LuxuryCard } from '../../components/ui/LuxuryCard';

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  timestamp: string;
  options?: string[];
}

export const ConciergeChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'concierge',
      text: 'Seja bem-vindo ao Ateliê AURA Parfums. Sou o seu Sommelier Olfativo. Como posso auxiliar na sua escolha hoje?',
      timestamp: 'Agora',
      options: [
        'Recomendar Perfume para a Noite',
        'Pesquisar por Notas (Oud, Âmbar, Íris)',
        'Como funciona a Liquidação Pix?',
        'Garantia de Estoque Físico'
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Agora',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulated Concierge Sommelier response
    setTimeout(() => {
      let replyText = 'Anotado! Nossos frascos de alta perfumaria são conservados em cofre climatizado no Brasil.';
      if (text.toLowerCase().includes('noite') || text.toLowerCase().includes('recomendar')) {
        replyText = 'Para ocasiões noturnas de forte presença, recomendamos fragrâncias da família Amadeirado Oriental, como Baccarat Rouge 540 Extrait (Maison Francis Kurkdjian) ou Oud Wood (Tom Ford). Ambas oferecem projeção incomparável.';
      } else if (text.toLowerCase().includes('pix')) {
        replyText = 'O pagamento via Pix possui confirmação instantânea. Ao finalizar seu pedido na sacola, um QR Code é gerado e seu produto é imediatamente reservado em nosso estoque físico.';
      } else if (text.toLowerCase().includes('estoque') || text.toLowerCase().includes('garantia')) {
        replyText = '100% dos frascos anunciados na AURA Parfums estão fisicamente presentes em nosso depósito climatizado. Não trabalhamos com dropshipping nem pré-venda sem estoque.';
      }

      const conciergeMsg: ChatMessage = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text: replyText,
        timestamp: 'Agora',
      };
      setMessages((prev) => [...prev, conciergeMsg]);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Concierge Header */}
      <div className="pb-6 border-b border-[#26241E] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059] mb-1">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Atendimento Personalizado</span>
            <span aria-hidden="true">·</span>
            <span>Sommelier Olfativo AURA</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#F7F7F6]">
            Concierge & Suporte ao Cliente
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-editorial">
            Esclareça dúvidas sobre pirâmides olfativas, estoque físico próprio ou liquidação Pix em tempo real.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Concierge Online</span>
        </div>
      </div>

      {/* Chat Container */}
      <LuxuryCard className="mt-8 flex flex-col h-[520px] overflow-hidden border border-[#D4AF37]/30">
        {/* Messages Scroll Area */}
        <div className="p-6 grow overflow-y-auto space-y-4 bg-[#0D0D0D]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#1C1A14] border border-[#D4AF37]/50 text-[#ECC876]'
                    : 'bg-[#171717] border border-[#26241E] text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#C5A059] mb-1 font-mono">
                  <span>{msg.sender === 'user' ? 'Você' : 'Sommelier AURA'}</span>
                  <span className="text-neutral-500">{msg.timestamp}</span>
                </div>
                <p className="font-editorial text-sm">{msg.text}</p>
              </div>

              {/* Quick option buttons if provided */}
              {msg.options && (
                <div className="mt-3 flex flex-wrap gap-2 max-w-md">
                  {msg.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSend(opt)}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#1F1E19] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-xs text-[#ECC876] transition-colors text-left cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-[#121212] border-t border-[#26241E] flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Digite sua dúvida ou preferência olfativa..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="grow px-4 py-2.5 bg-[#1A1A1A] border border-[#26241E] focus:border-[#D4AF37] text-xs text-white placeholder-neutral-500 outline-none transition-colors"
          />

          <GoldButton variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
            Enviar
          </GoldButton>
        </form>
      </LuxuryCard>
    </div>
  );
};
