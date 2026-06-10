'use client';

import React, { useRef } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import type { ImageObjectData } from '@/types';
import { useAppStore } from '@/lib/store';

interface ImageObjectProps {
  data: ImageObjectData;
  objectId: string;
  pageId: string;
}

export default function ImageObject({ data, objectId, pageId }: ImageObjectProps) {
  const updateObject = useAppStore((s) => s.updateObject);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateObject(pageId, objectId, {
      data: { ...data, src: url, alt: file.name },
    });
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: `${data.borderRadius || 0}px`,
    borderColor: data.borderColor || 'transparent',
    borderWidth: data.borderWidth ? `${data.borderWidth}px` : '0',
    borderStyle: data.borderWidth ? 'solid' : 'none',
    overflow: 'hidden',
    position: 'relative',
  };

  if (!data.src) {
    return (
      <div style={containerStyle} className="bg-[#F3F4F6] flex flex-col items-center justify-center gap-2 cursor-pointer group"
        onClick={() => fileRef.current?.click()}>
        <ImageIcon size={32} className="text-[var(--color-text-subtle)] group-hover:text-[#1B3A6B] transition-colors" />
        <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[#1B3A6B] transition-colors">
          انقر لإضافة صورة
        </span>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/5">
          <Upload size={20} className="text-[#1B3A6B]" />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.src}
        alt={data.alt || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: data.objectFit || 'cover',
          display: 'block',
        }}
      />
      {/* Replace overlay on hover */}
      <button
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center bg-black/30"
        onClick={() => fileRef.current?.click()}
        type="button"
      >
        <span className="bg-white text-xs text-[#1B3A6B] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Upload size={12} /> استبدال
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
