'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Search,
  Star,
  BookOpen,
  LayoutTemplate,
  Users,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useProjectStore } from '@/store/projectStore';
import { allTemplates, createProjectFromTemplate } from '@/lib/templates';
import { bookTypeLabels, cn, generateId } from '@/lib/utils';
import type { BookType, Template } from '@/types';

// ─── Mock additional templates ────────────────────────────────────────────────

interface MockTemplate {
  id: string;
  name: string;
  bookType: BookType;
  grade: string;
  subject: string;
  language: 'ar' | 'en';
  colorStyle: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pageCount: number;
  rating: number;
  usageCount: number;
  isMock: true;
}

const MOCK_EXTRA_TEMPLATES: MockTemplate[] = [
  {
    id: 'mock_math_grade_1',
    name: 'كتاب الرياضيات – الصف الأول',
    bookType: 'arabic_book',
    grade: '1',
    subject: 'الرياضيات',
    language: 'ar',
    colorStyle: 'blue_orange',
    primaryColor: '#1B4F8C',
    secondaryColor: '#F5871A',
    accentColor: '#FFC857',
    pageCount: 120,
    rating: 4.7,
    usageCount: 1840,
    isMock: true,
  },
  {
    id: 'mock_islamic_edu',
    name: 'كتاب التربية الإسلامية',
    bookType: 'arabic_book',
    grade: '3',
    subject: 'التربية الإسلامية',
    language: 'ar',
    colorStyle: 'green_gold',
    primaryColor: '#1A6B3C',
    secondaryColor: '#C9A227',
    accentColor: '#8BC34A',
    pageCount: 96,
    rating: 4.9,
    usageCount: 2310,
    isMock: true,
  },
  {
    id: 'mock_weekly_notebook',
    name: 'دفتر الطالب الأسبوعي',
    bookType: 'notebook',
    grade: 'عام',
    subject: 'عام',
    language: 'ar',
    colorStyle: 'purple_lavender',
    primaryColor: '#6B2FA0',
    secondaryColor: '#BF83FF',
    accentColor: '#E0C3FC',
    pageCount: 52,
    rating: 4.5,
    usageCount: 3120,
    isMock: true,
  },
  {
    id: 'mock_annual_planner',
    name: 'مخطط المعلم السنوي',
    bookType: 'planner',
    grade: 'عام',
    subject: 'التخطيط',
    language: 'ar',
    colorStyle: 'teal_cyan',
    primaryColor: '#0E7C7B',
    secondaryColor: '#17BEBB',
    accentColor: '#76C5C4',
    pageCount: 84,
    rating: 4.6,
    usageCount: 1560,
    isMock: true,
  },
  {
    id: 'mock_english_book',
    name: 'كتاب الإنجليزية',
    bookType: 'arabic_book',
    grade: '4',
    subject: 'اللغة الإنجليزية',
    language: 'en',
    colorStyle: 'red_navy',
    primaryColor: '#C0392B',
    secondaryColor: '#1A2557',
    accentColor: '#E74C3C',
    pageCount: 110,
    rating: 4.4,
    usageCount: 980,
    isMock: true,
  },
  {
    id: 'mock_social_studies',
    name: 'كتاب الاجتماعيات',
    bookType: 'arabic_book',
    grade: '5',
    subject: 'الدراسات الاجتماعية',
    language: 'ar',
    colorStyle: 'brown_gold',
    primaryColor: '#6B3A1F',
    secondaryColor: '#C9A227',
    accentColor: '#D4845A',
    pageCount: 104,
    rating: 4.3,
    usageCount: 1220,
    isMock: true,
  },
];

// ─── Color style map for real templates ──────────────────────────────────────

const COLOR_STYLE_MAP: Record<string, { primary: string; secondary: string; accent: string }> = {
  green_gold:      { primary: '#1A6B3C', secondary: '#C9A227', accent: '#8BC34A' },
  navy_gold:       { primary: '#1A3A6B', secondary: '#C9A227', accent: '#4A90D9' },
  purple_amber:    { primary: '#7B2D8B', secondary: '#F5A623', accent: '#BF83FF' },
  teal_coral:      { primary: '#0E7C7B', secondary: '#E84855', accent: '#76C5C4' },
  charcoal_orange: { primary: '#2D2D2D', secondary: '#F5871A', accent: '#FF6B35' },
};

// ─── Grade options ────────────────────────────────────────────────────────────

const GRADE_OPTIONS = [
  { value: 'all', label: 'كل الصفوف' },
  { value: '1', label: 'الصف الأول' },
  { value: '2', label: 'الصف الثاني' },
  { value: '3', label: 'الصف الثالث' },
  { value: '4', label: 'الصف الرابع' },
  { value: '5', label: 'الصف الخامس' },
  { value: 'عام', label: 'عام' },
];

const COLOR_STYLE_OPTIONS = [
  { value: 'all', label: 'كل الألوان' },
  { value: 'green_gold', label: 'أخضر وذهبي' },
  { value: 'navy_gold', label: 'أزرق وذهبي' },
  { value: 'purple_amber', label: 'بنفسجي وعنبري' },
  { value: 'teal_coral', label: 'فيروزي ومرجاني' },
  { value: 'charcoal_orange', label: 'رمادي وبرتقالي' },
  { value: 'blue_orange', label: 'أزرق وبرتقالي' },
  { value: 'purple_lavender', label: 'بنفسجي' },
  { value: 'teal_cyan', label: 'فيروزي' },
  { value: 'red_navy', label: 'أحمر وكحلي' },
  { value: 'brown_gold', label: 'بني وذهبي' },
];

// ─── Unified template type ────────────────────────────────────────────────────

type DisplayTemplate = (Template & { isMock?: false; rating: number; usageCount: number }) | MockTemplate;

// ─── Mini SVG preview for a template ─────────────────────────────────────────

function TemplatePreviewSVG({
  primary,
  secondary,
  accent,
}: {
  primary: string;
  secondary: string;
  accent: string;
}) {
  return (
    <svg
      viewBox="0 0 80 112"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Page background */}
      <rect width="80" height="112" fill="#ffffff" rx="3" />

      {/* Header bar */}
      <rect x="0" y="0" width="80" height="22" fill={primary} rx="3" />
      <rect x="0" y="19" width="80" height="3" fill={primary} />

      {/* Accent stripe on header */}
      <rect x="0" y="0" width="6" height="22" fill={secondary} rx="3" />

      {/* Title area */}
      <rect x="10" y="7" width="40" height="4" fill="rgba(255,255,255,0.85)" rx="2" />
      <rect x="10" y="13" width="26" height="3" fill="rgba(255,255,255,0.5)" rx="1.5" />

      {/* Page number circle */}
      <circle cx="70" cy="11" r="5" fill={secondary} />
      <rect x="67" y="9.5" width="6" height="3" fill="rgba(255,255,255,0.7)" rx="1" />

      {/* Content block 1 */}
      <rect x="8" y="28" width="64" height="6" fill={primary} opacity="0.12" rx="2" />
      <rect x="8" y="28" width="4" height="6" fill={accent} rx="1" />

      {/* Body lines */}
      <rect x="8" y="38" width="60" height="2.5" fill="#e5e7eb" rx="1.5" />
      <rect x="8" y="43" width="52" height="2.5" fill="#e5e7eb" rx="1.5" />
      <rect x="8" y="48" width="56" height="2.5" fill="#e5e7eb" rx="1.5" />
      <rect x="8" y="53" width="44" height="2.5" fill="#e5e7eb" rx="1.5" />

      {/* Activity box */}
      <rect x="8" y="61" width="64" height="24" fill={accent} opacity="0.1" rx="3" stroke={accent} strokeWidth="0.5" />
      <rect x="8" y="61" width="64" height="5" fill={accent} opacity="0.25" rx="3" />
      <rect x="10" y="69" width="40" height="2" fill={primary} opacity="0.2" rx="1" />
      <rect x="10" y="73" width="52" height="2" fill={primary} opacity="0.15" rx="1" />
      <rect x="10" y="77" width="34" height="2" fill={primary} opacity="0.15" rx="1" />

      {/* Bottom content lines */}
      <rect x="8" y="90" width="58" height="2.5" fill="#e5e7eb" rx="1.5" />
      <rect x="8" y="95" width="50" height="2.5" fill="#e5e7eb" rx="1.5" />

      {/* Footer */}
      <rect x="0" y="105" width="80" height="7" fill={primary} opacity="0.08" rx="2" />
      <rect x="8" y="107" width="24" height="2" fill={primary} opacity="0.3" rx="1" />
      <circle cx="68" cy="108.5" r="2.5" fill={secondary} opacity="0.6" />
    </svg>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            i < full
              ? 'fill-[#C9A227] text-[#C9A227]'
              : i === full && hasHalf
              ? 'fill-[#C9A227]/50 text-[#C9A227]'
              : 'fill-gray-200 text-gray-200',
          )}
        />
      ))}
      <span className="text-xs text-gray-500 font-cairo mr-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: DisplayTemplate;
  onUse: (template: DisplayTemplate) => void;
}) {
  const colors =
    'isMock' in template && template.isMock
      ? { primary: template.primaryColor, secondary: template.secondaryColor, accent: template.accentColor }
      : COLOR_STYLE_MAP[template.colorStyle] ?? { primary: '#1A3A6B', secondary: '#C9A227', accent: '#4A90D9' };

  const pageCount = 'isMock' in template && template.isMock ? template.pageCount : (template as Template).pages.length;
  const rating = template.rating;
  const usageCount = template.usageCount;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Preview area */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors.primary}18 0%, ${colors.secondary}12 100%)` }}
      >
        {/* Decorative background circles */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
          style={{ background: colors.primary }}
        />
        <div
          className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10"
          style={{ background: colors.secondary }}
        />

        {/* Stacked page previews */}
        <div className="relative flex items-center justify-center">
          {/* Back shadow pages */}
          <div
            className="absolute w-[68px] h-[96px] rounded-md opacity-20 rotate-[-6deg] translate-x-3 translate-y-1"
            style={{ background: colors.primary }}
          />
          <div
            className="absolute w-[68px] h-[96px] rounded-md opacity-30 rotate-[-3deg] translate-x-1.5"
            style={{ background: colors.secondary }}
          />
          {/* Main preview */}
          <div className="relative w-[72px] h-[100px] rounded-md shadow-lg overflow-hidden border border-white/50">
            <TemplatePreviewSVG
              primary={colors.primary}
              secondary={colors.secondary}
              accent={colors.accent}
            />
          </div>
        </div>

        {/* Language badge */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-cairo font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
            style={{ background: colors.primary }}
          >
            {template.language === 'ar' ? 'عربي' : 'English'}
          </span>
        </div>

        {/* Color dot accent */}
        <div
          className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ background: colors.secondary }}
        />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Name */}
        <h3 className="font-bold text-[#1B3A6B] font-cairo text-sm leading-snug line-clamp-2">
          {template.name}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs font-cairo px-2 py-0.5 rounded-full bg-[#1B3A6B]/8 text-[#1B3A6B] font-medium">
            {bookTypeLabels[template.bookType]}
          </span>
          {template.grade && template.grade !== 'عام' && (
            <span className="text-xs font-cairo px-2 py-0.5 rounded-full bg-[#C9A227]/12 text-[#9B7B1E] font-medium">
              صف {template.grade}
            </span>
          )}
          {template.grade === 'عام' && (
            <span className="text-xs font-cairo px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              عام
            </span>
          )}
          <span className="text-xs font-cairo px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {pageCount} صفحة
          </span>
        </div>

        {/* Rating & usage */}
        <div className="flex items-center justify-between">
          <StarRating rating={rating} />
          <div className="flex items-center gap-1 text-xs text-gray-400 font-cairo">
            <Users size={11} />
            <span>{usageCount.toLocaleString('ar-SA')}</span>
          </div>
        </div>

        {/* Use button */}
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => onUse(template)}
          className="mt-auto"
        >
          استخدم القالب
        </Button>
      </div>
    </div>
  );
}

// ─── Book type filter chips ───────────────────────────────────────────────────

const BOOK_TYPE_FILTERS: Array<{ value: BookType | 'all'; label: string }> = [
  { value: 'all', label: 'الكل' },
  { value: 'arabic_book', label: 'كتاب عربي' },
  { value: 'science_book', label: 'علوم' },
  { value: 'teacher_guide', label: 'دليل معلم' },
  { value: 'planner', label: 'مخطط' },
  { value: 'notebook', label: 'دفتر' },
  { value: 'support_book', label: 'دعم تعليمي' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router = useRouter();
  const { addProject } = useProjectStore();

  const [search, setSearch] = useState('');
  const [bookTypeFilter, setBookTypeFilter] = useState<BookType | 'all'>('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');

  // Combine real + mock templates
  const realTemplates: DisplayTemplate[] = useMemo(
    () =>
      allTemplates.map((t) => ({
        ...t,
        isMock: false as const,
        rating: 4 + Math.random() * 0.9,
        usageCount: Math.floor(800 + Math.random() * 2500),
      })),
    [],
  );

  const allDisplayTemplates: DisplayTemplate[] = useMemo(
    () => [...realTemplates, ...MOCK_EXTRA_TEMPLATES],
    [realTemplates],
  );

  const filtered = useMemo(() => {
    return allDisplayTemplates.filter((t) => {
      if (bookTypeFilter !== 'all' && t.bookType !== bookTypeFilter) return false;
      if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
      if (colorFilter !== 'all' && t.colorStyle !== colorFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.name.includes(q) &&
          !t.subject.toLowerCase().includes(q) &&
          !bookTypeLabels[t.bookType].includes(q)
        )
          return false;
      }
      return true;
    });
  }, [allDisplayTemplates, bookTypeFilter, gradeFilter, colorFilter, search]);

  function handleUseTemplate(template: DisplayTemplate) {
    if ('isMock' in template && template.isMock) {
      // For mock templates, create a blank project with the template's style
      const project = {
        name: template.name,
        bookType: template.bookType,
        grade: template.grade,
        documentSettings: {
          width: 210,
          height: 297,
          unit: 'mm',
          orientation: 'portrait' as const,
          bleed: 3,
          margins: { top: 20, right: 15, bottom: 20, left: 15 },
          columns: 1,
          gutter: 5,
        },
        theme: {
          colors: {
            primary: template.primaryColor,
            secondary: template.secondaryColor,
            accent: template.accentColor,
            background: '#FFFFFF',
            text: '#1C1C1C',
            heading: template.primaryColor,
            border: '#D4D4D4',
          },
          fonts: { heading: 'Cairo', body: 'Tajawal', ui: 'Cairo' },
          fontSizes: { heading1: 28, heading2: 22, heading3: 18, body: 14, caption: 11 },
          lineSpacing: 1.8,
          paragraphSpacing: 10,
        },
        fonts: ['Cairo', 'Tajawal'],
        styles: [],
        pages: [],
        thumbnail: undefined,
      };
      const created = addProject(project);
      router.push(`/editor/${created.id}`);
    } else {
      const realTpl = template as Template;
      const project = createProjectFromTemplate(realTpl, realTpl.name);
      const created = addProject({
        name: project.name,
        bookType: project.bookType,
        grade: project.grade,
        documentSettings: project.documentSettings,
        theme: project.theme,
        fonts: project.fonts,
        styles: project.styles,
        pages: project.pages,
        thumbnail: project.thumbnail,
      });
      router.push(`/editor/${created.id}`);
    }
  }

  const hasActiveFilters =
    bookTypeFilter !== 'all' || gradeFilter !== 'all' || colorFilter !== 'all' || search !== '';

  function clearFilters() {
    setBookTypeFilter('all');
    setGradeFilter('all');
    setColorFilter('all');
    setSearch('');
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb]" dir="rtl">
      {/* ── Top bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo + back */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 text-sm font-cairo text-gray-500 hover:text-[#1B3A6B] transition-colors"
              >
                <ArrowRight size={16} />
                <span>لوحة التحكم</span>
              </button>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1B3A6B] rounded-xl flex items-center justify-center">
                  <LayoutTemplate className="text-[#C9A227]" size={16} />
                </div>
                <span className="font-bold text-[#1B3A6B] font-cairo text-base">سوق القوالب</span>
              </div>
            </div>

            {/* Result count */}
            <span className="text-sm font-cairo text-gray-500 hidden sm:block">
              {filtered.length} قالب متاح
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero header ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] py-12 px-4 text-center relative overflow-hidden">
        {/* Decorative dots */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="absolute -left-16 top-0 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -right-16 bottom-0 w-48 h-48 bg-[#C9A227]/10 rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4 text-white/80 text-sm font-cairo">
            <Sparkles size={14} className="text-[#C9A227]" />
            قوالب احترافية جاهزة للاستخدام
          </div>
          <h1 className="text-4xl font-bold text-white font-cairo mb-3">
            سوق القوالب
          </h1>
          <p className="text-blue-200 font-cairo text-lg">
            اختر قالباً جاهزاً لكتابك وابدأ التصميم فوراً
          </p>
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {[
              { label: 'قالب جاهز', value: allDisplayTemplates.length.toString() },
              { label: 'نمط لوني', value: '10+' },
              { label: 'مستخدم', value: '12K+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-[#C9A227] font-cairo">{s.value}</div>
                <div className="text-xs text-blue-200 font-cairo">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Book type chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
            {BOOK_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setBookTypeFilter(f.value)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-sm font-cairo font-medium transition-all duration-150 border',
                  bookTypeFilter === f.value
                    ? 'bg-[#1B3A6B] text-white border-[#1B3A6B] shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3A6B]/40 hover:text-[#1B3A6B]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Second row: grade, color style, search */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Grade filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400 shrink-0" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="text-sm font-cairo bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-700 cursor-pointer"
                dir="rtl"
              >
                {GRADE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color style filter */}
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="text-sm font-cairo bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-700 cursor-pointer"
              dir="rtl"
            >
              {COLOR_STYLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن قالب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm font-cairo bg-white border border-gray-200 rounded-xl pl-8 pr-9 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                dir="rtl"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-cairo text-[#E84855] hover:underline flex items-center gap-1"
              >
                <X size={12} />
                مسح الفلاتر
              </button>
            )}

            {/* Result count – mobile */}
            <span className="text-xs font-cairo text-gray-400 mr-auto sm:hidden">
              {filtered.length} نتيجة
            </span>
          </div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-600 font-cairo mb-2">
              لا توجد قوالب تطابق البحث
            </h3>
            <p className="text-gray-400 font-cairo text-sm mb-4">
              جرب تغيير الفلاتر أو البحث بكلمات أخرى
            </p>
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              مسح جميع الفلاتر
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutTemplate size={18} className="text-[#1B3A6B]" />
                <h2 className="text-lg font-bold text-[#1B3A6B] font-cairo">
                  {hasActiveFilters ? 'نتائج البحث' : 'جميع القوالب'}
                </h2>
                <span className="bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-cairo px-2.5 py-0.5 rounded-full font-semibold">
                  {filtered.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom spacer */}
        <div className="h-12" />
      </main>
    </div>
  );
}
