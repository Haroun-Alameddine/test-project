'use client';

import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  dir?: 'rtl' | 'ltr';
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  error,
  hint,
  dir = 'rtl',
  disabled = false,
  required = false,
  className,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)} dir={dir}>
      {label && (
        <label className="text-sm font-semibold text-[#1B3A6B] font-cairo">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled} dir={dir}>
        <RadixSelect.Trigger
          className={cn(
            'inline-flex items-center justify-between w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-cairo',
            'transition-all duration-150 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B]',
            'data-[placeholder]:text-gray-400',
            error
              ? 'border-red-400 bg-red-50/30 focus:ring-red-400/30'
              : 'border-gray-200 hover:border-gray-300 text-gray-800',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown size={16} className="text-gray-400 shrink-0" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            dir={dir}
            className={cn(
              'z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden',
              'bg-white rounded-xl shadow-xl border border-gray-100',
              'animate-in fade-in-0 zoom-in-95 duration-100'
            )}
          >
            <RadixSelect.Viewport className="p-1.5 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    'relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-cairo cursor-pointer select-none',
                    'text-gray-700 hover:bg-[#F0F4FC] hover:text-[#1B3A6B]',
                    'focus:outline-none focus:bg-[#F0F4FC] focus:text-[#1B3A6B]',
                    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
                    'data-[state=checked]:text-[#1B3A6B] data-[state=checked]:font-semibold',
                    'transition-colors duration-100'
                  )}
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check size={14} className="text-[#1B3A6B]" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p className="text-xs text-red-500 font-cairo" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500 font-cairo">{hint}</p>
      )}
    </div>
  );
}
