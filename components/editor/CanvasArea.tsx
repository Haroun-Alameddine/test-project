'use client';

import React, { useRef, useCallback } from 'react';
import type { Project, ProjectPage } from '@/types';
import { useAppStore } from '@/lib/store';
import { ZoomIn, ZoomOut } from 'lucide-react';
import PageCanvas from './PageCanvas';

interface CanvasAreaProps {
  project: Project;
  currentPage: ProjectPage;
  currentPageIndex: number;
}

export default function CanvasArea({ project, currentPage, currentPageIndex }: CanvasAreaProps) {
  const { zoom, setZoom, setSelectedObjectId } = useAppStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(Math.min(3, Math.max(0.1, zoom + delta)));
      }
    },
    [zoom, setZoom],
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedObjectId(null);
      }
    },
    [setSelectedObjectId],
  );

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#e5e7eb] text-gray-400">
        <span>لا توجد صفحات</span>
      </div>
    );
  }

  // Canvas bottom padding accounts for the zoom scale
  const scaledHeight = currentPage.height * zoom;
  const paddingBottom = Math.max(64, 64 + scaledHeight * 0.1);

  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 overflow-auto"
      style={{ background: '#e5e7eb', direction: 'ltr' }}
      onWheelCapture={handleWheel}
      onClick={handleBackgroundClick}
    >
      {/* Page number indicator */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium bg-white/80 px-3 py-1 rounded-full z-10 pointer-events-none"
        style={{ direction: 'rtl' }}
      >
        صفحة {currentPage.pageNumber} من {project.pages.length}
      </div>

      {/* Scrollable artboard wrapper */}
      <div
        className="flex items-start justify-center"
        style={{ paddingTop: 52, paddingBottom }}
      >
        {/* Scaled artboard */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            // Reserve proper space so scrollbar works correctly
            marginBottom: (zoom - 1) * currentPage.height,
          }}
        >
          <PageCanvas project={project} page={currentPage} zoom={zoom} />
        </div>
      </div>

      {/* Floating zoom controls */}
      <div
        className="fixed bottom-5 flex items-center gap-1.5 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1.5 z-50"
        style={{ left: '50%', transform: 'translateX(-50%)', direction: 'ltr' }}
      >
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          title="تصغير"
        >
          <ZoomOut size={14} />
        </button>
        <select
          value={[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].includes(zoom) ? zoom : ''}
          onChange={(e) => e.target.value && setZoom(Number(e.target.value))}
          className="text-xs text-gray-700 bg-transparent border-none outline-none cursor-pointer px-1 w-14 text-center"
        >
          <option value="" disabled>{Math.round(zoom * 100)}%</option>
          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((z) => (
            <option key={z} value={z}>
              {Math.round(z * 100)}%
            </option>
          ))}
        </select>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          title="تكبير"
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </div>
  );
}
