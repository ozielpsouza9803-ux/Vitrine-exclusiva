import React from 'react';

interface GoldBadgeProps {
  children: React.ReactNode;
  variant?: 'subtle' | 'gold-hairline' | 'dark' | 'text-only';
  className?: string;
}

export const GoldBadge: React.FC<GoldBadgeProps> = ({
  children,
  variant = 'subtle',
  className = '',
}) => {
  const styles = {
    // Discreet luxury micro-tag with hairline framing (not a round pill)
    'gold-hairline':
      'inline-flex items-center text-[11px] font-medium tracking-widest uppercase px-2 py-0.5 border border-[#D4AF37]/30 text-[#D4AF37] bg-[#14120C]/80',
    subtle:
      'inline-flex items-center text-[11px] tracking-wider uppercase text-neutral-400 border border-neutral-800 px-2 py-0.5 bg-[#121212]',
    dark:
      'inline-flex items-center text-[11px] tracking-wider uppercase text-neutral-300 bg-[#1A1A1A] px-2 py-0.5',
    'text-only':
      'inline-flex items-center text-[11px] tracking-widest uppercase text-[#C5A059] font-medium',
  };

  return <span className={`${styles[variant]} whitespace-nowrap ${className}`}>{children}</span>;
};
