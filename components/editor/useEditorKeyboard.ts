'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useProjectStore } from '@/store/projectStore';
import { generateId } from '@/lib/utils';

export function useEditorKeyboard(currentPageId: string | null) {
  const {
    selectedObjectId,
    setSelectedObjectId,
    currentProject,
    deleteObject,
    addObject,
    updateObject,
    undo,
    redo,
    canUndo,
    canFuture,
    updateProject,
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't trigger shortcuts when typing in inputs
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z — undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Ctrl+Y / Ctrl+Shift+Z — redo
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        if (canFuture) redo();
        return;
      }

      // Ctrl+S — save
      if (ctrl && e.key === 's') {
        e.preventDefault();
        if (currentProject) {
          useProjectStore.getState().updateProject(currentProject.id, currentProject);
        }
        return;
      }

      // Ctrl+A — select all (not implemented for multi-select, just prevent default)
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        return;
      }

      if (!selectedObjectId || !currentPageId || !currentProject) return;

      const page = currentProject.pages.find((p) => p.id === currentPageId);
      if (!page) return;
      const obj = page.objects.find((o) => o.id === selectedObjectId);
      if (!obj) return;

      // Delete / Backspace — delete selected object
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteObject(currentPageId, selectedObjectId);
        setSelectedObjectId(null);
        return;
      }

      // Escape — deselect
      if (e.key === 'Escape') {
        setSelectedObjectId(null);
        return;
      }

      // Ctrl+D — duplicate
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        const duplicate = {
          ...obj,
          id: generateId(),
          x: obj.x + 20,
          y: obj.y + 20,
        };
        addObject(currentPageId, duplicate);
        setSelectedObjectId(duplicate.id);
        return;
      }

      // Arrow keys — move object
      const STEP = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateObject(currentPageId, selectedObjectId, { x: obj.x - STEP });
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateObject(currentPageId, selectedObjectId, { x: obj.x + STEP });
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateObject(currentPageId, selectedObjectId, { y: obj.y - STEP });
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateObject(currentPageId, selectedObjectId, { y: obj.y + STEP });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedObjectId,
    currentPageId,
    currentProject,
    deleteObject,
    addObject,
    updateObject,
    setSelectedObjectId,
    undo,
    redo,
    canUndo,
    canFuture,
    updateProject,
  ]);
}
