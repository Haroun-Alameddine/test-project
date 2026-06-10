'use client';

import React, { useCallback } from 'react';
import type { Project, ProjectPage } from '@/types';
import { useAppStore } from '@/lib/store';
import PageObject from './PageObject';

interface PageCanvasProps {
  project: Project;
  page: ProjectPage;
  zoom: number;
}

export default function PageCanvas({ project, page, zoom }: PageCanvasProps) {
  const { selectedObjectId, setSelectedObjectId, showGrid, showGuides } = useAppStore();

  const handlePageClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement) === e.currentTarget) {
      setSelectedObjectId(null);
    }
  }, [setSelectedObjectId]);

  const sortedObjects = [...(page.objects || [])].sort(
    (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
  );

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: page.width,
        height: page.height,
        backgroundColor: page.background || '#ffffff',
        backgroundImage: page.backgroundImage ? `url(${page.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        transformOrigin: 'top center',
      }}
      onClick={handlePageClick}
    >
      {/* Grid overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            zIndex: 0,
          }}
        />
      )}

      {/* Margin guides */}
      {showGuides && (
        <>
          {/* Top margin */}
          <div
            className="absolute left-0 right-0 border-t border-blue-300 border-dashed pointer-events-none"
            style={{ top: (project.documentSettings.margins.top / project.documentSettings.height) * page.height, zIndex: 9999 }}
          />
          {/* Bottom margin */}
          <div
            className="absolute left-0 right-0 border-t border-blue-300 border-dashed pointer-events-none"
            style={{
              top: ((project.documentSettings.height - project.documentSettings.margins.bottom) / project.documentSettings.height) * page.height,
              zIndex: 9999,
            }}
          />
          {/* Right margin (in RTL this is actually right visually = text start) */}
          <div
            className="absolute top-0 bottom-0 border-r border-blue-300 border-dashed pointer-events-none"
            style={{
              right: (project.documentSettings.margins.right / project.documentSettings.width) * page.width,
              zIndex: 9999,
            }}
          />
          {/* Left margin */}
          <div
            className="absolute top-0 bottom-0 border-l border-blue-300 border-dashed pointer-events-none"
            style={{
              left: (project.documentSettings.margins.left / project.documentSettings.width) * page.width,
              zIndex: 9999,
            }}
          />
        </>
      )}

      {/* Page objects */}
      {sortedObjects.map((obj) => (
        <PageObject
          key={obj.id}
          obj={obj}
          pageId={page.id}
          isSelected={selectedObjectId === obj.id}
          zoom={zoom}
          onSelect={setSelectedObjectId}
        />
      ))}
    </div>
  );
}
