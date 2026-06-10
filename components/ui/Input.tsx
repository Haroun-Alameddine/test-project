'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: string;
  disabled?: boolean;
  dir?: 'rtl' | 'ltr';
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  autoComplete?: string;
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon,
  iconRight,
  type = 'text',
  disabled = false,
  dir = 'rtl',
  required = false,
  name,
  id,
  className,
  inputClassName,
  autoComplete,
}: InputProps) {
  const inputId = id ?? name ?? label;

  return (
    <div className={cn('flex flex-col gap-1.5', className)} dir={dir}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[#1B3A6B] font-cairo"
        >
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className={cn(
            'absolute inset-y-0 flex items-center pointer-events-none text-gray-400',
            dir === 'rtl' ? 'right-3' : 'left-3'
          )}>
            {icon}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          dir={dir}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B]',
            'font-cairo',
            error
              ? 'border-red-400 bg-red-50/30 focus:ring-red-400/30 focus:border-red-500'
              : 'border-gray-200 hover:border-gray-300',
            disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
            icon && (dir === 'rtl' ? 'pr-10' : 'pl-10'),
            iconRight && (dir === 'rtl' ? 'pl-10' : 'pr-10'),
            inputClassName
          )}
        />

        {iconRight && (
          <span className={cn(
            'absolute inset-y-0 flex items-center pointer-events-none text-gray-400',
            dir === 'rtl' ? 'left-3' : 'right-3'
          )}>
            {iconRight}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-cairo" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 font-cairo">{hint}</p>
      )}
    </div>
  );
}
