import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import type {
  BookType,
  DocumentSettings,
  ProjectTheme,
  PageSize,
} from '@/types';

// ─── Tailwind Merge ───────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return uuidv4();
}

// ─── Date Formatting ─────────────────────────────────────────────────────────

export function formatDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory',
  }).format(d);
}

// ─── Page Sizes (mm) ─────────────────────────────────────────────────────────

export const pageSizes: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 216, height: 279 },
  Square: { width: 210, height: 210 },
};

// ─── Arabic Fonts ─────────────────────────────────────────────────────────────

export const arabicFonts: Array<{ name: string; label: string; value: string }> = [
  { name: 'Cairo', label: 'Cairo / القاهرة', value: 'Cairo' },
  { name: 'Tajawal', label: 'Tajawal / تجوال', value: 'Tajawal' },
  { name: 'Almarai', label: 'Almarai / المراعي', value: 'Almarai' },
  { name: 'Amiri', label: 'Amiri / أميري', value: 'Amiri' },
  { name: 'Noto Naskh Arabic', label: 'Noto Naskh / نوتو نسخ', value: 'Noto Naskh Arabic' },
  { name: 'Lateef', label: 'Lateef / لطيف', value: 'Lateef' },
  { name: 'Scheherazade New', label: 'Scheherazade / شهرزاد', value: 'Scheherazade New' },
  { name: 'Reem Kufi', label: 'Reem Kufi / ريم كوفي', value: 'Reem Kufi' },
  { name: 'Harmattan', label: 'Harmattan / هرماتان', value: 'Harmattan' },
  { name: 'Mada', label: 'Mada / مدى', value: 'Mada' },
  { name: 'Lalezar', label: 'Lalezar / لالهزار', value: 'Lalezar' },
  { name: 'Mirza', label: 'Mirza / ميرزا', value: 'Mirza' },
];

// ─── Book Type Labels ─────────────────────────────────────────────────────────

export const bookTypeLabels: Record<BookType, string> = {
  arabic_book: 'كتاب عربي',
  science_book: 'كتاب علوم',
  teacher_guide: 'دليل المعلم',
  planner: 'مخطط تعليمي',
  notebook: 'دفتر نشاط',
  support_book: 'كتاب دعم تعليمي',
};

// ─── Section Type Labels ──────────────────────────────────────────────────────

export const sectionTypeLabels: Record<
  string,
  { label: string; icon: string }
> = {
  reading_text: { label: 'نص قرائي', icon: '📖' },
  activity: { label: 'نشاط', icon: '✏️' },
  question: { label: 'أسئلة', icon: '❓' },
  remember: { label: 'تذكر', icon: '💡' },
  observe: { label: 'الحظ', icon: '🔍' },
  apply: { label: 'طبّق', icon: '🎯' },
  write: { label: 'اكتب', icon: '✍️' },
  conclusion: { label: 'خلاصة', icon: '📝' },
  vocabulary: { label: 'مفردات', icon: '📚' },
  table: { label: 'جدول', icon: '📊' },
  image: { label: 'صورة', icon: '🖼️' },
  title: { label: 'عنوان', icon: '🏷️' },
};

// ─── Unit Conversions ─────────────────────────────────────────────────────────

/** Convert millimetres to pixels at the given DPI (default 96). */
export function mmToPx(mm: number, dpi = 96): number {
  return Math.round((mm / 25.4) * dpi);
}

/** Convert pixels to millimetres at the given DPI (default 96). */
export function pxToMm(px: number, dpi = 96): number {
  return (px / dpi) * 25.4;
}

// ─── Default Document Settings ───────────────────────────────────────────────

export const defaultDocumentSettings: DocumentSettings = {
  width: 210,
  height: 297,
  unit: 'mm',
  orientation: 'portrait',
  bleed: 3,
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15,
  },
  columns: 1,
  gutter: 5,
};

// ─── Default Theme ────────────────────────────────────────────────────────────

export const defaultTheme: ProjectTheme = {
  colors: {
    primary: '#1A3A6B',      // deep navy blue – trustworthy, educational
    secondary: '#C6922A',    // warm gold – prestige, Arabic heritage
    accent: '#E8F0FB',       // light blue tint – highlights
    background: '#FFFFFF',   // white page
    text: '#1C1C1C',         // near-black body text
    heading: '#1A3A6B',      // navy headings
    border: '#D4D4D4',       // subtle dividers
  },
  fonts: {
    heading: 'Cairo',
    body: 'Tajawal',
    ui: 'Cairo',
  },
  fontSizes: {
    heading1: 28,
    heading2: 22,
    heading3: 18,
    body: 14,
    caption: 11,
  },
  lineSpacing: 1.8,
  paragraphSpacing: 10,
};

// ─── Page-size Helpers ────────────────────────────────────────────────────────

/** Return a PageSize object by name key (A4, A5, Letter, Square). */
export function getPageSize(key: string): PageSize {
  const size = pageSizes[key] ?? pageSizes['A4'];
  return { ...size, unit: 'mm' as const };
}
