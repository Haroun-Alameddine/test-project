'use client';

import React from 'react';
import type { ProjectPage } from '@/types';
import { cn } from '@/lib/utils';

interface PageThumbnailProps {
  page: ProjectPage;
  isActive: boolean;
  onClick: () => void;
  scale?: number;
}

// Thumbnail dimensions
const THUMB_W = 80;
const THUMB_H = 113; // A4 ratio
const PAGE_W = 794;
const PAGE_H = 1123;
const SCALE = THUMB_W / PAGE_W;

export default function PageThumbnail({ page, isActive, onClick, scale = SCALE }: PageThumbnailProps) {
  const thumbW = Math.round(PAGE_W * scale);
  const thumbH = Math.round(PAGE_H * scale);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-md overflow-hidden border-2 transition-all shrink-0 bg-white shadow-sm hover:shadow-md',
        isActive
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
          : 'border-transparent hover:border-[var(--color-border-strong)]',
      )}
      style={{ width: thumbW, height: thumbH }}
      title={`صفحة ${page.pageNumber}`}
    >
      {/* Scaled page preview */}
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top right',
          background: page.background || '#ffffff',
          position: 'absolute',
          top: 0,
          right: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Render objects as simple colored blocks */}
        {page.objects.map((obj) => (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: obj.x,
              top: obj.y,
              width: obj.width,
              height: obj.height,
              transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
              opacity: obj.visible === false ? 0 : 1,
              zIndex: obj.zIndex,
              background:
                obj.type === 'shape'
                  ? (obj.data as { fill?: string }).fill || '#3B82F6'
                  : obj.type === 'image'
                  ? '#E5E7EB'
                  : obj.type === 'table'
                  ? '#F3F4F6'
                  : (obj.data as { background?: string }).background || 'transparent',
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {/* Page number badge */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 text-center text-[9px] font-semibold py-0.5',
          isActive
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-black/40 text-white',
        )}
      >
        {page.pageNumber}
      </div>
    </button>
  );
}
