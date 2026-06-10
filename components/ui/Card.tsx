'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'hover' | 'selected';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-100 shadow-sm',
  hover:
    'bg-white border border-gray-100 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#1B3A6B]/20',
  selected:
    'bg-white border-2 border-[#1B3A6B] shadow-md ring-2 ring-[#1B3A6B]/10',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  variant = 'default',
  className,
  onClick,
  padding = 'md',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl overflow-hidden',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
