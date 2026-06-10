'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#1B3A6B', '#2A5298', '#3B82F6', '#60A5FA', '#93C5FD',
  '#C9A227', '#E0B93A', '#F59E0B', '#FCD34D', '#FEF08A',
  '#E84855', '#F06570', '#EF4444', '#FCA5A5', '#FECACA',
  '#2D9B5A', '#38C06F', '#10B981', '#6EE7B7', '#A7F3D0',
  '#1C1C1C', '#374151', '#6B7280', '#D1D5DB', '#F9FAFB',
  '#FFFFFF', '#F3F4F6', '#E5E7EB', '#9CA3AF', '#4B5563',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export default function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value || '#000000');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(value || '#000000');
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleHexInput = (hex: string) => {
    setInputVal(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className="block text-xs text-[var(--color-text-muted)] mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-border-strong)] transition-colors"
      >
        <span
          className="w-5 h-5 rounded-md border border-black/10 flex-shrink-0"
          style={{ background: value || '#ffffff' }}
        />
        <span className="text-xs font-mono text-[var(--color-text)] uppercase flex-1 text-right">
          {(value || '#ffffff').toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 p-3 bg-white rounded-xl shadow-xl border border-[var(--color-border)] w-56 end-0">
          {/* Native color input */}
          <div className="mb-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => { onChange(e.target.value); setInputVal(e.target.value); }}
              className="w-full h-8 rounded-lg cursor-pointer border border-[var(--color-border)]"
            />
          </div>

          {/* Preset grid */}
          <div className="grid grid-cols-6 gap-1 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => { onChange(color); setInputVal(color); setOpen(false); }}
                className={cn(
                  'w-7 h-7 rounded-md border transition-transform hover:scale-110',
                  value === color ? 'border-[#1B3A6B] ring-2 ring-[#1B3A6B]/30 border-2' : 'border-black/10',
                )}
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">Hex</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => handleHexInput(e.target.value)}
              onBlur={() => {
                if (!/^#[0-9A-Fa-f]{6}$/.test(inputVal)) {
                  setInputVal(value || '#000000');
                }
              }}
              maxLength={7}
              className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 uppercase"
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}
