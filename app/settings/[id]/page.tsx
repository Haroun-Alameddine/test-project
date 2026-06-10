'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Save,
  Trash2,
  Settings,
  BookOpen,
  FileText,
  Palette,
  Type,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useProjectStore } from '@/store/projectStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { bookTypeLabels, arabicFonts, pageSizes, cn } from '@/lib/utils';
import type { BookType, PageOrientation, Project } from '@/types';

// ─── Color themes ─────────────────────────────────────────────────────────────

const COLOR_THEMES = [
  {
    id: 'navy_gold',
    label: 'أزرق كحلي وذهبي',
    primary: '#1B3A6B',
    secondary: '#C9A227',
    accent: '#4A90D9',
    bg: '#FFFFFF',
  },
  {
    id: 'green_gold',
    label: 'أخضر وذهبي',
    primary: '#1A6B3C',
    secondary: '#C9A227',
    accent: '#8BC34A',
    bg: '#FFFFFF',
  },
  {
    id: 'purple_amber',
    label: 'بنفسجي وعنبري',
    primary: '#7B2D8B',
    secondary: '#F5A623',
    accent: '#BF83FF',
    bg: '#FFFFFF',
  },
  {
    id: 'teal_coral',
    label: 'فيروزي ومرجاني',
    primary: '#0E7C7B',
    secondary: '#E84855',
    accent: '#76C5C4',
    bg: '#FFFFFF',
  },
  {
    id: 'charcoal_orange',
    label: 'رمادي وبرتقالي',
    primary: '#2D2D2D',
    secondary: '#F5871A',
    accent: '#FF6B35',
    bg: '#FAFAFA',
  },
  {
    id: 'red_navy',
    label: 'أحمر وكحلي',
    primary: '#C0392B',
    secondary: '#1A2557',
    accent: '#E74C3C',
    bg: '#FFFFFF',
  },
  {
    id: 'brown_gold',
    label: 'بني وذهبي',
    primary: '#6B3A1F',
    secondary: '#C9A227',
    accent: '#D4845A',
    bg: '#FFFDF8',
  },
  {
    id: 'midnight_rose',
    label: 'أزرق داكن وورد',
    primary: '#1A1A4E',
    secondary: '#E91E8C',
    accent: '#7B5EA7',
    bg: '#FFFFFF',
  },
];

// ─── Page size presets ────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (210×297 مم)', width: 210, height: 297 },
  { value: 'A5', label: 'A5 (148×210 مم)', width: 148, height: 210 },
  { value: 'Letter', label: 'Letter (216×279 مم)', width: 216, height: 279 },
  { value: 'Square', label: 'مربع (210×210 مم)', width: 210, height: 210 },
];

const BLEED_OPTIONS = [
  { value: 0, label: '0 مم (بدون نزيف)' },
  { value: 3, label: '3 مم (قياسي)' },
  { value: 5, label: '5 مم (مطبعة احترافية)' },
];

const MARGIN_PRESETS = [
  { id: 'normal', label: 'عادي', top: 20, right: 20, bottom: 20, left: 20 },
  { id: 'narrow', label: 'ضيق', top: 12, right: 12, bottom: 12, left: 12 },
  { id: 'wide', label: 'واسع', top: 30, right: 30, bottom: 30, left: 30 },
  { id: 'custom', label: 'مخصص', top: 0, right: 0, bottom: 0, left: 0 },
];

const BOOK_TYPE_OPTIONS: Array<{ value: BookType; label: string }> = [
  { value: 'arabic_book', label: 'كتاب عربي' },
  { value: 'science_book', label: 'كتاب علوم' },
  { value: 'teacher_guide', label: 'دليل المعلم' },
  { value: 'planner', label: 'مخطط تعليمي' },
  { value: 'notebook', label: 'دفتر نشاط' },
  { value: 'support_book', label: 'كتاب دعم تعليمي' },
];

const GRADE_OPTIONS = [
  'الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس',
  'الصف السادس', 'الصف السابع', 'الصف الثامن', 'الصف التاسع', 'الصف العاشر',
  'الصف الحادي عشر', 'الصف الثاني عشر', 'عام',
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SettingsSection({
  icon,
  title,
  subtitle,
  children,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border shadow-sm overflow-hidden',
        danger ? 'border-red-200' : 'border-gray-100',
      )}
    >
      {/* Section header */}
      <div
        className={cn(
          'flex items-center gap-3 px-6 py-4 border-b',
          danger ? 'bg-red-50 border-red-100' : 'bg-gray-50/60 border-gray-100',
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center',
            danger ? 'bg-red-100 text-red-600' : 'bg-[#1B3A6B]/10 text-[#1B3A6B]',
          )}
        >
          {icon}
        </div>
        <div>
          <h2
            className={cn(
              'font-bold font-cairo text-sm',
              danger ? 'text-red-700' : 'text-[#1B3A6B]',
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 font-cairo mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-cairo font-semibold text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 font-cairo">{hint}</p>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-cairo font-medium animate-fade-in-up',
        type === 'success' ? 'bg-[#1B3A6B]' : 'bg-red-600',
      )}
    >
      {type === 'success' ? (
        <CheckCircle size={16} className="text-[#C9A227]" />
      ) : (
        <AlertTriangle size={16} />
      )}
      {message}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold font-cairo text-gray-900 text-base">{title}</h3>
            <p className="text-sm font-cairo text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            إلغاء
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { loading: authLoading } = useRequireAuth();
  const { getProject, updateProject, deleteProject } = useProjectStore();

  // ── Local form state ──────────────────────────────────────────
  const [name, setName] = useState('');
  const [bookType, setBookType] = useState<BookType>('arabic_book');
  const [grade, setGrade] = useState('الصف الأول');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

  // Page settings
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [bleed, setBleed] = useState(3);
  const [marginPreset, setMarginPreset] = useState('normal');
  const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 });

  // Colors & fonts
  const [selectedTheme, setSelectedTheme] = useState('navy_gold');
  const [headingFont, setHeadingFont] = useState('Cairo');
  const [bodyFont, setBodyFont] = useState('Tajawal');

  // UI state
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const closeToast = useCallback(() => setToast(null), []);

  // ── Load project ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const project = getProject(id);
    if (!project) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    // Hydrate form
    setName(project.name);
    setBookType(project.bookType);
    setGrade(project.grade ?? 'الصف الأول');
    setHeadingFont(project.theme.fonts.heading ?? 'Cairo');
    setBodyFont(project.theme.fonts.body ?? 'Tajawal');

    // Page settings
    const ds = project.documentSettings;
    // Match page size by dimensions
    const matchedSize =
      PAGE_SIZE_OPTIONS.find((s) => s.width === ds.width && s.height === ds.height) ??
      PAGE_SIZE_OPTIONS[0];
    setPageSize(matchedSize.value);
    setOrientation(ds.orientation);
    setBleed(ds.bleed ?? 3);
    setMargins({ ...ds.margins });

    // Match margin preset
    const presetMatch = MARGIN_PRESETS.find(
      (p) =>
        p.id !== 'custom' &&
        p.top === ds.margins.top &&
        p.right === ds.margins.right &&
        p.bottom === ds.margins.bottom &&
        p.left === ds.margins.left,
    );
    setMarginPreset(presetMatch ? presetMatch.id : 'custom');

    // Match color theme
    const themeMatch = COLOR_THEMES.find(
      (t) =>
        t.primary === project.theme.colors.primary &&
        t.secondary === project.theme.colors.secondary,
    );
    setSelectedTheme(themeMatch ? themeMatch.id : 'navy_gold');

    setLoading(false);
  }, [id, getProject]);

  // ── Margin preset change ──────────────────────────────────────
  function handleMarginPreset(presetId: string) {
    setMarginPreset(presetId);
    const preset = MARGIN_PRESETS.find((p) => p.id === presetId);
    if (preset && presetId !== 'custom') {
      setMargins({ top: preset.top, right: preset.right, bottom: preset.bottom, left: preset.left });
    }
  }

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    try {
      const theme = COLOR_THEMES.find((t) => t.id === selectedTheme) ?? COLOR_THEMES[0];
      const size = PAGE_SIZE_OPTIONS.find((s) => s.value === pageSize) ?? PAGE_SIZE_OPTIONS[0];

      const updates: Partial<Project> = {
        name: name.trim() || 'مشروع بدون اسم',
        bookType,
        grade,
        documentSettings: {
          width: size.width,
          height: size.height,
          unit: 'mm',
          orientation,
          bleed,
          margins: { ...margins },
          columns: 1,
          gutter: 5,
        },
        theme: {
          colors: {
            primary: theme.primary,
            secondary: theme.secondary,
            accent: theme.accent,
            background: theme.bg,
            text: '#1C1C1C',
            heading: theme.primary,
            border: '#D4D4D4',
          },
          fonts: { heading: headingFont, body: bodyFont, ui: 'Cairo' },
          fontSizes: { heading1: 28, heading2: 22, heading3: 18, body: 14, caption: 11 },
          lineSpacing: 1.8,
          paragraphSpacing: 10,
        },
        fonts: [headingFont, bodyFont].filter((v, i, a) => a.indexOf(v) === i),
      };

      updateProject(id, updates);

      // Persist to localStorage (projectStore already does this via zustand persist)
      setToast({ message: 'تم حفظ الإعدادات بنجاح', type: 'success' });
    } catch {
      setToast({ message: 'حدث خطأ أثناء الحفظ', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────
  function handleDelete() {
    deleteProject(id);
    router.push('/dashboard');
  }

  // ── Render guards ─────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B3A6B]/20 border-t-[#1B3A6B] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-cairo text-sm">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 font-cairo mb-2">المشروع غير موجود</h2>
          <p className="text-gray-500 font-cairo text-sm mb-5">لم يتم العثور على مشروع بهذا المعرف</p>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  const activeThemeObj = COLOR_THEMES.find((t) => t.id === selectedTheme) ?? COLOR_THEMES[0];

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Back + title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/editor/${id}`)}
                className="flex items-center gap-1.5 text-sm font-cairo text-gray-500 hover:text-[#1B3A6B] transition-colors"
              >
                <ArrowRight size={16} />
                <span>العودة للمحرر</span>
              </button>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1B3A6B] rounded-xl flex items-center justify-center">
                  <Settings className="text-[#C9A227]" size={15} />
                </div>
                <span className="font-bold text-[#1B3A6B] font-cairo text-base">إعدادات المشروع</span>
              </div>
            </div>

            {/* Save button */}
            <Button
              variant="primary"
              size="sm"
              icon={<Save size={15} />}
              loading={saving}
              onClick={handleSave}
            >
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── 1. Project Info ────────────────────────────────────── */}
        <SettingsSection
          icon={<BookOpen size={16} />}
          title="معلومات المشروع"
          subtitle="البيانات الأساسية للمشروع"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Project name */}
            <div className="sm:col-span-2">
              <Field label="اسم المشروع" htmlFor="proj-name">
                <input
                  id="proj-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم المشروع"
                  className="w-full px-4 py-2.5 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 placeholder-gray-400"
                  dir="rtl"
                />
              </Field>
            </div>

            {/* Book type */}
            <Field label="نوع الكتاب" htmlFor="book-type">
              <div className="relative">
                <select
                  id="book-type"
                  value={bookType}
                  onChange={(e) => setBookType(e.target.value as BookType)}
                  className="w-full appearance-none px-4 py-2.5 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 cursor-pointer pr-4 pl-9"
                  dir="rtl"
                >
                  {BOOK_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            {/* Grade */}
            <Field label="الصف الدراسي" htmlFor="grade">
              <div className="relative">
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 cursor-pointer pr-4 pl-9"
                  dir="rtl"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>

            {/* Language direction */}
            <div className="sm:col-span-2">
              <Field label="اتجاه النص" hint="يؤثر على اتجاه عرض المحتوى الافتراضي">
                <div className="flex gap-3">
                  {[
                    { value: 'rtl', label: 'يمين لليسار (RTL)', sublabel: 'للغة العربية' },
                    { value: 'ltr', label: 'يسار لليمين (LTR)', sublabel: 'للغة الإنجليزية' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDirection(opt.value as 'rtl' | 'ltr')}
                      className={cn(
                        'flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-150 text-right',
                        direction === opt.value
                          ? 'border-[#1B3A6B] bg-[#1B3A6B]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300',
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                          direction === opt.value
                            ? 'border-[#1B3A6B] bg-[#1B3A6B]'
                            : 'border-gray-300',
                        )}
                      />
                      <div>
                        <div className={cn('text-sm font-cairo font-semibold', direction === opt.value ? 'text-[#1B3A6B]' : 'text-gray-700')}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-gray-400 font-cairo">{opt.sublabel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        </SettingsSection>

        {/* ── 2. Page Settings ────────────────────────────────────── */}
        <SettingsSection
          icon={<FileText size={16} />}
          title="إعدادات الصفحة"
          subtitle="حجم الصفحة والهوامش والنزيف"
        >
          <div className="space-y-6">
            {/* Page size & orientation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="حجم الصفحة" htmlFor="page-size">
                <div className="grid grid-cols-2 gap-2">
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setPageSize(s.value)}
                      className={cn(
                        'px-3 py-2 rounded-xl border-2 text-sm font-cairo transition-all duration-150 text-right',
                        pageSize === s.value
                          ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B] font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300',
                      )}
                    >
                      {s.value}
                      <div className="text-xs text-gray-400 font-cairo font-normal">
                        {s.width}×{s.height}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="space-y-4">
                <Field label="الاتجاه">
                  <div className="flex gap-2">
                    {[
                      { value: 'portrait', label: 'عمودي', icon: '▯' },
                      { value: 'landscape', label: 'أفقي', icon: '▭' },
                    ].map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setOrientation(o.value as PageOrientation)}
                        className={cn(
                          'flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm font-cairo transition-all',
                          orientation === o.value
                            ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B] font-semibold'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300',
                        )}
                      >
                        <span className="text-lg">{o.icon}</span>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="النزيف (Bleed)" htmlFor="bleed" hint="مساحة إضافية للقص عند الطباعة">
                  <div className="relative">
                    <select
                      id="bleed"
                      value={bleed}
                      onChange={(e) => setBleed(Number(e.target.value))}
                      className="w-full appearance-none px-4 py-2.5 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 cursor-pointer pr-4 pl-9"
                      dir="rtl"
                    >
                      {BLEED_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </Field>
              </div>
            </div>

            {/* Margins */}
            <div>
              <p className="text-sm font-cairo font-semibold text-gray-700 mb-3">الهوامش</p>

              {/* Margin presets */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {MARGIN_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleMarginPreset(p.id)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-cairo border transition-all',
                      marginPreset === p.id
                        ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B3A6B]/40',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom margin inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'top', label: 'أعلى' },
                  { key: 'bottom', label: 'أسفل' },
                  { key: 'right', label: 'يمين' },
                  { key: 'left', label: 'يسار' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-cairo text-gray-500">{label} (مم)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={margins[key as keyof typeof margins]}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(60, Number(e.target.value)));
                        setMargins((m) => ({ ...m, [key]: val }));
                        setMarginPreset('custom');
                      }}
                      className="px-3 py-2 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ── 3. Colors & Fonts ────────────────────────────────────── */}
        <SettingsSection
          icon={<Palette size={16} />}
          title="الألوان والخطوط"
          subtitle="نمط ألوان المشروع وخطوطه"
        >
          <div className="space-y-6">
            {/* Color theme picker */}
            <div>
              <p className="text-sm font-cairo font-semibold text-gray-700 mb-3">نمط الألوان</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      'flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all text-right hover:shadow-md',
                      selectedTheme === theme.id
                        ? 'border-[#1B3A6B] shadow-sm bg-[#1B3A6B]/3'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    )}
                  >
                    {/* Color swatches */}
                    <div className="flex gap-1.5 items-center">
                      <div
                        className="w-6 h-6 rounded-lg shadow-sm border border-white"
                        style={{ background: theme.primary }}
                      />
                      <div
                        className="w-5 h-5 rounded-md shadow-sm border border-white"
                        style={{ background: theme.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-md shadow-sm border border-white"
                        style={{ background: theme.accent }}
                      />
                    </div>
                    <span className="text-xs font-cairo text-gray-600 leading-tight">
                      {theme.label}
                    </span>
                    {selectedTheme === theme.id && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#1B3A6B]" />
                        <span className="text-xs text-[#1B3A6B] font-cairo font-semibold">محدد</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Active theme preview */}
              <div
                className="mt-4 rounded-xl p-4 flex items-center gap-4 border"
                style={{
                  borderColor: activeThemeObj.primary + '30',
                  background: activeThemeObj.primary + '08',
                }}
              >
                <div className="flex gap-2">
                  {[activeThemeObj.primary, activeThemeObj.secondary, activeThemeObj.accent].map(
                    (c, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ background: c }}
                        title={c}
                      />
                    ),
                  )}
                </div>
                <div>
                  <p className="text-sm font-cairo font-semibold" style={{ color: activeThemeObj.primary }}>
                    {activeThemeObj.label}
                  </p>
                  <p className="text-xs text-gray-400 font-cairo">
                    {activeThemeObj.primary} · {activeThemeObj.secondary} · {activeThemeObj.accent}
                  </p>
                </div>
              </div>
            </div>

            {/* Fonts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="خط العناوين" htmlFor="heading-font">
                <div className="relative">
                  <select
                    id="heading-font"
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 cursor-pointer pr-4 pl-9"
                    dir="rtl"
                  >
                    {arabicFonts.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {/* Preview */}
                <div className="mt-1.5 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  <p className="text-base font-bold text-[#1B3A6B]" style={{ fontFamily: headingFont }}>
                    عنوان تجريبي
                  </p>
                </div>
              </Field>

              <Field label="خط النص الأساسي" htmlFor="body-font">
                <div className="relative">
                  <select
                    id="body-font"
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] text-gray-800 cursor-pointer pr-4 pl-9"
                    dir="rtl"
                  >
                    {arabicFonts.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {/* Preview */}
                <div className="mt-1.5 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: bodyFont }}>
                    نص تجريبي للمحتوى الأساسي في الصفحة
                  </p>
                </div>
              </Field>
            </div>
          </div>
        </SettingsSection>

        {/* ── 4. Danger Zone ────────────────────────────────────────── */}
        <SettingsSection
          icon={<Trash2 size={16} />}
          title="منطقة الخطر"
          subtitle="إجراءات لا يمكن التراجع عنها"
          danger
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-cairo font-bold text-red-700 mb-1">حذف المشروع</h3>
              <p className="text-sm font-cairo text-gray-500">
                سيتم حذف المشروع وجميع صفحاته نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              حذف المشروع
            </Button>
          </div>
        </SettingsSection>

        {/* ── Save button (bottom) ─────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
          <p className="text-sm font-cairo text-gray-500">
            تأكد من مراجعة جميع الإعدادات قبل الحفظ
          </p>
          <Button
            variant="primary"
            size="md"
            icon={<Save size={16} />}
            loading={saving}
            onClick={handleSave}
          >
            حفظ التغييرات
          </Button>
        </div>

        <div className="h-8" />
      </main>

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* ── Delete confirm dialog ────────────────────────────────── */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="حذف المشروع نهائياً"
        message={`هل أنت متأكد من حذف "${name}"؟ لن تتمكن من استعادته.`}
        confirmLabel="نعم، احذف المشروع"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
