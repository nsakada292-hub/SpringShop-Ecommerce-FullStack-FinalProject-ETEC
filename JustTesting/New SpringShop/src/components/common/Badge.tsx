import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    success: 'bg-[#4ce600]/15 text-[#00b000] dark:text-[#4ce600] border border-[#4ce600]/30 font-medium',
    info: 'bg-[#00e1ff]/15 text-[#009dff] dark:text-[#00e1ff] border border-[#00e1ff]/30 font-medium',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-medium',
    neutral: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700',
    brand: 'bg-brand-gradient text-white font-semibold shadow-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider font-semibold whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
