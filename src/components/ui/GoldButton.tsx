import React from 'react';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-7 py-3.5 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#DFBF70] via-[#D4AF37] to-[#B38F2E] text-[#0A0A0A] font-semibold hover:brightness-110 active:scale-[0.98] shadow-[0_2px_12px_rgba(212,175,55,0.2)]',
    outline:
      'bg-[#0D0D0D]/60 backdrop-blur-sm border border-[#D4AF37]/40 text-[#ECC876] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] active:scale-[0.98]',
    ghost:
      'bg-transparent text-neutral-300 hover:text-[#ECC876] hover:bg-[#1A1A1A]/80 active:scale-[0.98]',
    dark:
      'bg-[#1A1A1A] border border-neutral-800 text-neutral-200 hover:border-[#D4AF37]/40 hover:text-white active:scale-[0.98]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
