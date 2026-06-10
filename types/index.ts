// ─── Book Types ──────────────────────────────────────────────────────────────

export type BookType =
  | 'arabic_book'
  | 'science_book'
  | 'teacher_guide'
  | 'planner'
  | 'notebook'
  | 'support_book';

// ─── Page / Document ─────────────────────────────────────────────────────────

export type PageOrientation = 'portrait' | 'landscape';

export interface PageSize {
  width: number;
  height: number;
  unit: 'mm' | 'px' | 'in';
}

export interface DocumentSettings {
  width: number;
  height: number;
  unit: string;
  orientation: PageOrientation;
  bleed: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  columns: number;
  gutter: number;
}

// ─── Text & Style ────────────────────────────────────────────────────────────

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  align: 'right' | 'left' | 'center';
  direction: 'rtl' | 'ltr';
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
}

// ─── Canvas Object Data ───────────────────────────────────────────────────────

export interface TextObjectData {
  text: string;
  style: TextStyle;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  background: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export interface ImageObjectData {
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
}

export interface ShapeObjectData {
  shape: 'rect' | 'circle' | 'triangle' | 'star';
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface TableCell {
  content: string;
  style: TextStyle;
  background: string;
  colspan: number;
  rowspan: number;
}

export interface TableStyle {
  borderColor: string;
  borderWidth: number;
  headerBackground: string;
  alternateRows: boolean;
}

export interface TableObjectData {
  rows: number;
  cols: number;
  cells: TableCell[][];
  headerRow: boolean;
  style: TableStyle;
}

// ─── Canvas Object ────────────────────────────────────────────────────────────

export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'line' | 'table' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  data: TextObjectData | ImageObjectData | ShapeObjectData | TableObjectData;
}

// ─── Page Templates ───────────────────────────────────────────────────────────

export type PageTemplateType =
  | 'cover'
  | 'unit_opener'
  | 'lesson'
  | 'reading_text'
  | 'activity'
  | 'question'
  | 'vocabulary'
  | 'summary'
  | 'empty'
  | 'back_cover'
  | 'table_of_contents';

export interface ProjectPage {
  id: string;
  pageNumber: number;
  templateType: PageTemplateType;
  width: number;
  height: number;
  background: string;
  backgroundImage?: string;
  objects: CanvasObject[];
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
  border: string;
}

export interface ProjectFonts {
  heading: string;
  body: string;
  ui: string;
}

export interface ProjectTheme {
  colors: ColorTheme;
  fonts: ProjectFonts;
  fontSizes: {
    heading1: number;
    heading2: number;
    heading3: number;
    body: number;
    caption: number;
  };
  lineSpacing: number;
  paragraphSpacing: number;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  bookType: BookType;
  grade: string;
  documentSettings: DocumentSettings;
  theme: ProjectTheme;
  fonts: string[];
  styles: any[];
  pages: ProjectPage[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

// ─── Template ─────────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  bookType: BookType;
  grade: string;
  subject: string;
  language: 'ar' | 'en';
  colorStyle: string;
  preview: string;
  pages: ProjectPage[];
  theme: ProjectTheme;
  documentSettings: DocumentSettings;
}

// ─── Book Parsing ─────────────────────────────────────────────────────────────

export interface BookSection {
  type:
    | 'reading_text'
    | 'activity'
    | 'question'
    | 'remember'
    | 'observe'
    | 'apply'
    | 'write'
    | 'conclusion'
    | 'vocabulary'
    | 'table'
    | 'image'
    | 'title';
  title: string;
  content: string;
  questions: string[];
  images: string[];
  level: number;
}

export interface BookLesson {
  lessonTitle: string;
  sections: BookSection[];
}

export interface BookUnit {
  unitTitle: string;
  lessons: BookLesson[];
}

export interface ParsedBook {
  bookTitle: string;
  grade: string;
  units: BookUnit[];
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface ExportOptions {
  format: 'pdf' | 'json' | 'idml';
  quality: 'screen' | 'print';
  includeBleed: boolean;
  includeCropMarks: boolean;
  spreadView: boolean;
  embedFonts: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
