import React from 'react';

interface GoldDividerProps {
  label?: string;
  className?: string;
}

export const GoldDivider: React.FC<GoldDividerProps> = ({ label, className = '' }) => {
  if (label) {
    return (
      <div className={`relative flex items-center justify-center my-8 ${className}`}>
        <div className="grow border-t border-[#26241E]" />
        <span className="shrink-0 px-4 text-xs font-serif-luxury tracking-widest uppercase text-[#C5A059]">
          {label}
        </span>
        <div className="grow border-t border-[#26241E]" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center my-6 ${className}`}>
      <div className="w-full border-t border-[#26241E]" />
      <div className="absolute w-2 h-2 rotate-45 bg-[#0A0A0A] border border-[#D4AF37]/40" />
    </div>
  );
};
