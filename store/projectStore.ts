import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types';
import { generateId } from '@/lib/utils';
import { defaultDocumentSettings, defaultTheme } from '@/lib/utils';

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  getProject: (id: string) => Project | undefined;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'sample-1',
    name: 'كتاب اللغة العربية - الصف الثالث',
    bookType: 'arabic_book',
    grade: 'الصف الثالث',
    documentSettings: { ...defaultDocumentSettings },
    theme: { ...defaultTheme },
    fonts: ['Cairo', 'Tajawal'],
    styles: [],
    pages: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: undefined,
  },
  {
    id: 'sample-2',
    name: 'كتاب العلوم - الصف الخامس',
    bookType: 'science_book',
    grade: 'الصف الخامس',
    documentSettings: { ...defaultDocumentSettings },
    theme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#1A6B3C',
        secondary: '#8BC34A',
      },
    },
    fonts: ['Cairo'],
    styles: [],
    pages: [],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-3',
    name: 'دليل المعلم - الوحدة الأولى',
    bookType: 'teacher_guide',
    grade: 'الصف الأول',
    documentSettings: { ...defaultDocumentSettings },
    theme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#6B1A5A',
        secondary: '#E91E8C',
      },
    },
    fonts: ['Cairo', 'Amiri'],
    styles: [],
    pages: [],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-4',
    name: 'مخطط الفصل الدراسي الأول',
    bookType: 'planner',
    grade: 'عام',
    documentSettings: { ...defaultDocumentSettings },
    theme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#E65100',
        secondary: '#FFC107',
      },
    },
    fonts: ['Tajawal'],
    styles: [],
    pages: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-5',
    name: 'دفتر تمارين الرياضيات',
    bookType: 'notebook',
    grade: 'الصف الرابع',
    documentSettings: { ...defaultDocumentSettings },
    theme: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: '#1565C0',
        secondary: '#42A5F5',
      },
    },
    fonts: ['Cairo'],
    styles: [],
    pages: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: SAMPLE_PROJECTS,

      addProject: (projectData) => {
        const now = new Date().toISOString();
        const project: Project = {
          ...projectData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return project;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      duplicateProject: (id) => {
        const original = get().projects.find((p) => p.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const copy: Project = {
          ...original,
          id: generateId(),
          name: `${original.name} - نسخة`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [copy, ...state.projects] }));
        return copy;
      },

      getProject: (id) => get().projects.find((p) => p.id === id),
    }),
    {
      name: 'pedabook-projects',
    }
  )
);
