import { v4 as uuidv4 } from 'uuid';
import type { BookType, Project, ProjectPage, Template } from '@/types';
import {
  allTemplates,
  arabicGrade1Template,
  arabicGrade2Template,
  supportBookTemplate,
  scienceBookTemplate,
  teacherGuideTemplate,
} from './definitions';
import { defaultDocumentSettings, defaultTheme } from '@/lib/utils';

// ─── Re-exports ───────────────────────────────────────────────────────────────

export {
  allTemplates,
  arabicGrade1Template,
  arabicGrade2Template,
  supportBookTemplate,
  scienceBookTemplate,
  teacherGuideTemplate,
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Find a template by its unique id.
 * Returns `undefined` if no matching template is found.
 */
export function getTemplateById(id: string): Template | undefined {
  return allTemplates.find((t) => t.id === id);
}

/**
 * Return all templates that match a given BookType.
 */
export function getTemplatesByBookType(bookType: BookType): Template[] {
  return allTemplates.filter((t) => t.bookType === bookType);
}

/**
 * Return all templates that target a specific grade string (e.g. '1', '2').
 */
export function getTemplatesByGrade(grade: string): Template[] {
  return allTemplates.filter((t) => t.grade === grade);
}

// ─── Project factory ──────────────────────────────────────────────────────────

/**
 * Create a new Project instance from a Template.
 * Every page gets a fresh UUID so multiple projects from the same template
 * never share page ids.
 */
export function createProjectFromTemplate(template: Template, name: string): Project {
  const now = new Date().toISOString();

  const pages: ProjectPage[] = template.pages.map((page, idx) => ({
    ...page,
    id: uuidv4(),
    pageNumber: page.pageNumber === 0 ? 0 : idx,
    objects: page.objects.map((obj) => ({
      ...obj,
      id: uuidv4(),
    })),
  }));

  return {
    id: uuidv4(),
    name,
    bookType: template.bookType,
    grade: template.grade,
    documentSettings: { ...template.documentSettings },
    theme: {
      colors: { ...template.theme.colors },
      fonts: { ...template.theme.fonts },
      fontSizes: { ...template.theme.fontSizes },
      lineSpacing: template.theme.lineSpacing,
      paragraphSpacing: template.theme.paragraphSpacing,
    },
    fonts: [template.theme.fonts.heading, template.theme.fonts.body].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
    styles: [],
    pages,
    createdAt: now,
    updatedAt: now,
    thumbnail: template.preview,
  };
}

/**
 * Create a blank project with sensible defaults.
 * Any field in `settings` overrides the defaults.
 */
export function createBlankProject(settings: Partial<Project> = {}): Project {
  const now = new Date().toISOString();

  const blankPage: ProjectPage = {
    id: uuidv4(),
    pageNumber: 1,
    templateType: 'empty',
    width: 794,   // A4 at 96 dpi
    height: 1123,
    background: '#FFFFFF',
    objects: [],
  };

  const defaults: Project = {
    id: uuidv4(),
    name: 'مشروع جديد',
    bookType: 'arabic_book',
    grade: '1',
    documentSettings: { ...defaultDocumentSettings },
    theme: {
      colors: { ...defaultTheme.colors },
      fonts: { ...defaultTheme.fonts },
      fontSizes: { ...defaultTheme.fontSizes },
      lineSpacing: defaultTheme.lineSpacing,
      paragraphSpacing: defaultTheme.paragraphSpacing,
    },
    fonts: ['Cairo', 'Tajawal'],
    styles: [],
    pages: [blankPage],
    createdAt: now,
    updatedAt: now,
  };

  // Allow caller to provide pre-built pages; otherwise use the blank page.
  return {
    ...defaults,
    ...settings,
    id: settings.id ?? defaults.id,
    createdAt: settings.createdAt ?? defaults.createdAt,
    updatedAt: now,
  };
}
