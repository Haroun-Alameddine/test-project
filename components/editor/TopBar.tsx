'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Undo2,
  Redo2,
  Save,
  ChevronDown,
  FileJson,
  FileText,
  Check,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { Project } from '@/types';
import { cn } from '@/lib/utils';

interface TopBarProps {
  project: Project;
}

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5];
const ZOOM_LABELS: Record<number, string> = {
  0.25: '25%',
  0.5: '50%',
  0.75: '75%',
  1: '100%',
  1.25: '125%',
  1.5: '150%',
};

export default function TopBar({ project }: TopBarProps) {
  const router = useRouter();
  const {
    updateProject,
    undo,
    redo,
    canUndo,
    canFuture,
    zoom,
    setZoom,
    currentProject,
  } = useAppStore();

  const [isSaved, setIsSaved] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);
  const [exportOpen, setExportOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNameVal(project.name);
  }, [project.name]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (zoomRef.current && !zoomRef.current.contains(e.target as Node)) {
        setZoomOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNameSubmit = () => {
    const trimmed = nameVal.trim();
    if (trimmed && trimmed !== project.name) {
      updateProject({ name: trimmed });
    } else {
      setNameVal(project.name);
    }
    setIsEditingName(false);
  };

  const handleSave = () => {
    if (!currentProject) return;
    try {
      const stored = localStorage.getItem('pedabook_projects');
      const projects = stored ? JSON.parse(stored) : [];
      const idx = projects.findIndex((p: { id: string }) => p.id === currentProject.id);
      if (idx >= 0) {
        projects[idx] = currentProject;
      } else {
        projects.push(currentProject);
      }
      localStorage.setItem('pedabook_projects', JSON.stringify(projects));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleExportJSON = () => {
    if (!currentProject) return;
    const blob = new Blob([JSON.stringify(currentProject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleExportPDF = () => {
    // PDF export would require a more complex setup – open print dialog as placeholder
    window.print();
    setExportOpen(false);
  };

  const fitPage = () => {
    // Calculate zoom to fit the page in the viewport
    const pageW = 794;
    const pageH = 1123;
    const viewW = window.innerWidth - 260 - 280 - 80;
    const viewH = window.innerHeight - 52 - 80;
    const fitZoom = Math.min(viewW / pageW, viewH / pageH, 1.5);
    setZoom(Math.max(0.1, fitZoom));
    setZoomOpen(false);
  };

  return (
    <header
      className="flex items-center h-[52px] px-3 gap-2 bg-white border-b border-[var(--color-border)] shrink-0 z-20"
      style={{ direction: 'rtl' }}
    >
      {/* Back to dashboard */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[var(--color-bg)] shrink-0"
        title="العودة للوحة التحكم"
      >
        <ArrowRight size={16} />
        <span className="hidden sm:inline">رجوع</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--color-border)] shrink-0" />

      {/* Project name */}
      <div className="flex-1 min-w-0 flex items-center">
        {isEditingName ? (
          <input
            ref={nameRef}
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') {
                setNameVal(project.name);
                setIsEditingName(false);
              }
            }}
            className="text-sm font-semibold text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-primary)] rounded-lg px-2 py-0.5 outline-none w-full max-w-[260px]"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] truncate max-w-[260px] px-1 py-0.5 rounded hover:bg-[var(--color-bg)] transition-colors"
            title="انقر للتعديل"
          >
            {project.name}
          </button>
        )}
      </div>

      {/* Center controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="تراجع (Ctrl+Z)"
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            canUndo
              ? 'text-[var(--color-text)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]'
              : 'text-[var(--color-text-subtle)] cursor-not-allowed',
          )}
        >
          <Undo2 size={16} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canFuture}
          title="إعادة (Ctrl+Y)"
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            canFuture
              ? 'text-[var(--color-text)] hover:bg-[var(--color-bg)] hover:text-[var(--color-primary)]'
              : 'text-[var(--color-text-subtle)] cursor-not-allowed',
          )}
        >
          <Redo2 size={16} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        {/* Zoom out */}
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          title="تصغير"
        >
          <ZoomOut size={15} />
        </button>

        {/* Zoom selector */}
        <div ref={zoomRef} className="relative">
          <button
            onClick={() => setZoomOpen((o) => !o)}
            className="flex items-center gap-1 text-xs font-mono text-[var(--color-text)] hover:bg-[var(--color-bg)] px-2 py-1.5 rounded-lg transition-colors min-w-[60px] justify-center"
          >
            {Math.round(zoom * 100)}%
            <ChevronDown size={12} />
          </button>
          {zoomOpen && (
            <div className="absolute top-full mt-1 start-0 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50 min-w-[110px]">
              {ZOOM_LEVELS.map((z) => (
                <button
                  key={z}
                  onClick={() => { setZoom(z); setZoomOpen(false); }}
                  className={cn(
                    'w-full text-right px-3 py-1.5 text-xs hover:bg-[var(--color-bg)] transition-colors flex items-center justify-between gap-2',
                    zoom === z ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--color-text)]',
                  )}
                >
                  <span>{ZOOM_LABELS[z]}</span>
                  {zoom === z && <Check size={12} />}
                </button>
              ))}
              <div className="border-t border-[var(--color-border)] my-1" />
              <button
                onClick={fitPage}
                className="w-full text-right px-3 py-1.5 text-xs hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text)]"
              >
                ملاءمة الصفحة
              </button>
            </div>
          )}
        </div>

        {/* Zoom in */}
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          title="تكبير"
        >
          <ZoomIn size={15} />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--color-border)] mx-1 shrink-0" />

      {/* Right side: Save + Export */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Save */}
        <button
          onClick={handleSave}
          title="حفظ (Ctrl+S)"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            isSaved
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]',
          )}
        >
          {isSaved ? (
            <>
              <Check size={14} />
              <span>محفوظ</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>حفظ</span>
            </>
          )}
        </button>

        {/* Export dropdown */}
        <div ref={exportRef} className="relative">
          <button
            onClick={() => setExportOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          >
            <span>تصدير</span>
            <ChevronDown size={13} />
          </button>
          {exportOpen && (
            <div className="absolute top-full mt-1 end-0 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50 min-w-[140px]">
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
              >
                <FileText size={14} className="text-[var(--color-text-muted)]" />
                تصدير PDF
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
              >
                <FileJson size={14} className="text-[var(--color-text-muted)]" />
                تصدير JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
