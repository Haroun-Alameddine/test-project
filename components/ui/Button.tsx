'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#1B3A6B] text-white hover:bg-[#152e56] active:bg-[#0f2242] shadow-sm hover:shadow-md',
  secondary:
    'bg-white text-[#1B3A6B] border border-[#1B3A6B]/30 hover:border-[#1B3A6B] hover:bg-[#F0F4FC] active:bg-[#E0E8F8]',
  ghost:
    'bg-transparent text-[#1B3A6B] hover:bg-[#F0F4FC] active:bg-[#E0E8F8]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
  gold:
    'bg-[#C9A227] text-white hover:bg-[#b8921f] active:bg-[#a07e18] shadow-sm hover:shadow-md',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

export default function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  type = 'button',
  href,
  variant = 'primary',
  size = 'md',
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A6B]/50 focus-visible:ring-offset-1',
    'font-cairo',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    (disabled || loading) && 'opacity-60 cursor-not-allowed pointer-events-none',
    className
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick as any}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {content}
    </button>
  );
}
