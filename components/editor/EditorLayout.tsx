'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Project } from '@/types';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import CanvasArea from './CanvasArea';
import RightSidebar from './RightSidebar';
import { useEditorKeyboard } from './useEditorKeyboard';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface EditorLayoutProps {
  project: Project;
}

export default function EditorLayout({ project }: EditorLayoutProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const { currentProject } = useAppStore();

  const currentPage = project.pages[currentPageIndex] ?? project.pages[0];

  // Register keyboard shortcuts
  useEditorKeyboard(currentPage?.id ?? null);

  // Helper: persist project to localStorage and show badge
  const saveToStorage = useCallback(() => {
    const proj = useAppStore.getState().currentProject;
    if (!proj) return;
    try {
      const stored = localStorage.getItem('pedabook_projects');
      const projects = stored ? JSON.parse(stored) : [];
      const idx = projects.findIndex((p: { id: string }) => p.id === proj.id);
      if (idx >= 0) {
        projects[idx] = proj;
      } else {
        projects.push(proj);
      }
      localStorage.setItem('pedabook_projects', JSON.stringify(projects));
      setLastSavedAt(new Date());
      setShowSavedBadge(true);
      setTimeout(() => setShowSavedBadge(false), 2000);
    } catch {
      // ignore storage errors
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveToStorage();
    }, 30_000);
    return () => clearInterval(interval);
  }, [saveToStorage]);

  // Listen for Ctrl+S to show the toast as well
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's') {
        // useEditorKeyboard already handles the actual save; we just show the badge
        setLastSavedAt(new Date());
        setShowSavedBadge(true);
        setTimeout(() => setShowSavedBadge(false), 2000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format last-saved time
  const savedTimeLabel = lastSavedAt
    ? lastSavedAt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg)] select-none">
      {/* Top Bar */}
      <TopBar project={project} />

      {/* Main content: left sidebar + canvas + right sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          project={project}
          currentPageIndex={currentPageIndex}
          onPageSelect={setCurrentPageIndex}
        />

        {/* Canvas Area */}
        <CanvasArea
          project={project}
          currentPage={currentPage}
          currentPageIndex={currentPageIndex}
        />

        {/* Right Sidebar */}
        <RightSidebar
          project={project}
          currentPage={currentPage}
        />
      </div>

      {/* Auto-save toast badge */}
      <div
        className={cn(
          'fixed bottom-5 end-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg',
          'bg-green-600 text-white text-sm font-medium pointer-events-none',
          'transition-all duration-300',
          showSavedBadge ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        )}
        style={{ direction: 'rtl' }}
        aria-live="polite"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>تم الحفظ تلقائياً{savedTimeLabel ? ` – ${savedTimeLabel}` : ''}</span>
      </div>
    </div>
  );
}
