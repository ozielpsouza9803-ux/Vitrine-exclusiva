import React from 'react';

interface LuxuryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

export const LuxuryCard: React.FC<LuxuryCardProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[#121212] border border-[#26241E] transition-all duration-200 relative ${
        interactive
          ? 'hover:border-[#D4AF37]/40 hover:-translate-y-0.5 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)]'
          : 'shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
