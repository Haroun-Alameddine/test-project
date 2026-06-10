import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type {
  Project,
  ProjectPage,
  CanvasObject,
} from '@/types';

// ─── Slice Types ──────────────────────────────────────────────────────────────

interface ProjectSlice {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;

  updatePage: (pageId: string, updates: Partial<ProjectPage>) => void;
  addPage: (page: ProjectPage) => void;
  deletePage: (pageId: string) => void;
  reorderPages: (orderedIds: string[]) => void;

  addObject: (pageId: string, object: CanvasObject) => void;
  updateObject: (pageId: string, objectId: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (pageId: string, objectId: string) => void;

  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
}

interface UISlice {
  activePanel: 'templates' | 'pages' | 'elements' | 'uploads';
  setActivePanel: (panel: 'templates' | 'pages' | 'elements' | 'uploads') => void;

  zoom: number;
  setZoom: (zoom: number) => void;

  isPreviewMode: boolean;
  togglePreviewMode: () => void;

  showGrid: boolean;
  toggleGrid: () => void;

  showGuides: boolean;
  toggleGuides: () => void;
}

interface ProjectsSlice {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProjectMeta: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

interface HistorySlice {
  past: Project[];
  future: Project[];
  pushHistory: (snapshot: Project) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canFuture: boolean;
}

interface ExportSlice {
  isExporting: boolean;
  exportProgress: number;
  setExporting: (value: boolean) => void;
  setExportProgress: (value: number) => void;
}

// ─── Combined Store Type ──────────────────────────────────────────────────────

type AppStore = ProjectSlice & UISlice & ProjectsSlice & HistorySlice & ExportSlice;

// ─── Store Implementation ─────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // ── Project Slice ──────────────────────────────────────────────────────────

    currentProject: null,

    setCurrentProject(project) {
      set({ currentProject: project });
    },

    updateProject(updates) {
      const { currentProject } = get();
      if (!currentProject) return;
      const updated: Project = {
        ...currentProject,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      set({ currentProject: updated });
    },

    updatePage(pageId, updates) {
      const { currentProject } = get();
      if (!currentProject) return;
      const pages = currentProject.pages.map((p) =>
        p.id === pageId ? { ...p, ...updates } : p,
      );
      set({
        currentProject: {
          ...currentProject,
          pages,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    addPage(page) {
      const { currentProject } = get();
      if (!currentProject) return;
      set({
        currentProject: {
          ...currentProject,
          pages: [...currentProject.pages, page],
          updatedAt: new Date().toISOString(),
        },
      });
    },

    deletePage(pageId) {
      const { currentProject } = get();
      if (!currentProject) return;
      const pages = currentProject.pages
        .filter((p) => p.id !== pageId)
        .map((p, i) => ({ ...p, pageNumber: i + 1 }));
      set({
        currentProject: {
          ...currentProject,
          pages,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    reorderPages(orderedIds) {
      const { currentProject } = get();
      if (!currentProject) return;
      const pageMap = new Map(currentProject.pages.map((p) => [p.id, p]));
      const pages = orderedIds
        .filter((id) => pageMap.has(id))
        .map((id, i) => ({ ...pageMap.get(id)!, pageNumber: i + 1 }));
      set({
        currentProject: {
          ...currentProject,
          pages,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    addObject(pageId, object) {
      const { currentProject } = get();
      if (!currentProject) return;
      const pages = currentProject.pages.map((p) => {
        if (p.id !== pageId) return p;
        const maxZ = p.objects.reduce((m, o) => Math.max(m, o.zIndex), 0);
        return {
          ...p,
          objects: [...p.objects, { ...object, zIndex: maxZ + 1 }],
        };
      });
      set({
        currentProject: {
          ...currentProject,
          pages,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    updateObject(pageId, objectId, updates) {
      const { currentProject } = get();
      if (!currentProject) return;
      const pages = currentProject.pages.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          objects: p.objects.map((o) =>
            o.id === objectId ? { ...o, ...updates } : o,
          ),
        };
      });
      set({
        currentProject: {
          ...currentProject,
          pages,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    deleteObject(pageId, objectId) {
      const { currentProject } = get();
      if (!currentProject) return;
      const pages = currentProject.pages.map((p) => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          objects: p.objects.filter((o) => o.id !== objectId),
        };
      });
      set({
        currentProject: {
          ...currentProject,
          pages,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    selectedObjectId: null,

    setSelectedObjectId(id) {
      set({ selectedObjectId: id });
    },

    // ── UI Slice ───────────────────────────────────────────────────────────────

    activePanel: 'templates',

    setActivePanel(panel) {
      set({ activePanel: panel });
    },

    zoom: 1,

    setZoom(zoom) {
      set({ zoom: Math.max(0.1, Math.min(4, zoom)) });
    },

    isPreviewMode: false,

    togglePreviewMode() {
      set((s) => ({ isPreviewMode: !s.isPreviewMode }));
    },

    showGrid: false,

    toggleGrid() {
      set((s) => ({ showGrid: !s.showGrid }));
    },

    showGuides: true,

    toggleGuides() {
      set((s) => ({ showGuides: !s.showGuides }));
    },

    // ── Projects Slice ─────────────────────────────────────────────────────────

    projects: [],

    setProjects(projects) {
      set({ projects });
    },

    addProject(project) {
      set((s) => ({ projects: [...s.projects, project] }));
    },

    updateProjectMeta(id, updates) {
      set((s) => ({
        projects: s.projects.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p,
        ),
      }));
    },

    deleteProject(id) {
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    },

    // ── History Slice ──────────────────────────────────────────────────────────

    past: [],
    future: [],
    canUndo: false,
    canFuture: false,

    pushHistory(snapshot) {
      set((s) => {
        const past = [...s.past.slice(-49), snapshot]; // keep last 50 snapshots
        return { past, future: [], canUndo: past.length > 0, canFuture: false };
      });
    },

    undo() {
      const { past, future, currentProject } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      const newFuture = currentProject
        ? [currentProject, ...future]
        : future;
      set({
        currentProject: previous,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canFuture: newFuture.length > 0,
      });
    },

    redo() {
      const { past, future, currentProject } = get();
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      const newPast = currentProject ? [...past, currentProject] : past;
      set({
        currentProject: next,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canFuture: newFuture.length > 0,
      });
    },

    // ── Export Slice ───────────────────────────────────────────────────────────

    isExporting: false,
    exportProgress: 0,

    setExporting(value) {
      set({ isExporting: value, exportProgress: value ? 0 : 100 });
    },

    setExportProgress(value) {
      set({ exportProgress: Math.max(0, Math.min(100, value)) });
    },
  })),
);

// ─── Convenience Selectors ────────────────────────────────────────────────────

export const selectCurrentPage =
  (pageId: string) =>
  (state: AppStore): ProjectPage | undefined =>
    state.currentProject?.pages.find((p) => p.id === pageId);

export const selectSelectedObject =
  (state: AppStore): CanvasObject | undefined => {
    if (!state.currentProject || !state.selectedObjectId) return undefined;
    for (const page of state.currentProject.pages) {
      const found = page.objects.find((o) => o.id === state.selectedObjectId);
      if (found) return found;
    }
    return undefined;
  };

// ─── ID helper re-export for convenience ────────────────────────────────────

export { generateId };
