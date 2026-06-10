'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FlaskConical,
  BookMarked,
  Calendar,
  NotebookPen,
  LibraryBig,
  ChevronRight,
  ChevronLeft,
  Check,
  Type,
  Palette,
  LayoutTemplate,
  FileText,
  Sparkles,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn, defaultDocumentSettings, defaultTheme } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';
import type { BookType, ProjectTheme, DocumentSettings } from '@/types';

interface WizardData {
  bookType: BookType | null;
  grade: string;
  direction: 'rtl' | 'ltr';
  pageCount: number;
  pageSize: string;
  orientation: 'portrait' | 'landscape';
  bleed: number;
  margins: string;
  colorTheme: string;
  headingFont: string;
  bodyFont: string;
  fontSize: string;
  lineSpacing: number;
  projectName: string;
}

const BOOK_TYPES: Array<{ type: BookType; label: string; icon: React.ReactNode; desc: string }> = [
  { type: 'arabic_book', label: 'كتاب عربي', icon: <BookOpen size={28} />, desc: 'لغة عربية وأدب' },
  { type: 'science_book', label: 'كتاب علوم', icon: <FlaskConical size={28} />, desc: 'علوم وتكنولوجيا' },
  { type: 'teacher_guide', label: 'دليل المعلم', icon: <BookMarked size={28} />, desc: 'مرجع تدريسي' },
  { type: 'planner', label: 'مخطط / بلانر', icon: <Calendar size={28} />, desc: 'تنظيم وتخطيط' },
  { type: 'notebook', label: 'دفتر تمارين', icon: <NotebookPen size={28} />, desc: 'تمارين وأنشطة' },
  { type: 'support_book', label: 'كتاب مساعد', icon: <LibraryBig size={28} />, desc: 'دعم ومراجعة' },
];

const GRADES = [
  'الصف الأول', 'الصف الثاني', 'الصف الثالث',
  'الصف الرابع', 'الصف الخامس', 'الصف السادس',
  'الصف السابع', 'الصف الثامن', 'الصف التاسع',
];

const PAGE_SIZES = [
  { key: 'A4', label: 'A4', desc: '210 × 297 مم', w: 210, h: 297 },
  { key: 'A5', label: 'A5', desc: '148 × 210 مم', w: 148, h: 210 },
  { key: 'Letter', label: 'Letter', desc: '216 × 279 مم', w: 216, h: 279 },
  { key: 'Square', label: 'مربع', desc: '210 × 210 مم', w: 210, h: 210 },
  { key: 'Custom', label: 'مخصص', desc: 'أبعاد حرة', w: 210, h: 297 },
];

const COLOR_THEMES = [
  {
    key: 'blue_gold',
    label: 'أزرق كلاسيكي',
    primary: '#1B3A6B',
    secondary: '#C9A227',
    accent: '#E8F0FB',
    bg: '#FFFFFF',
    text: '#1C1C1C',
    heading: '#1B3A6B',
    border: '#D4D4D4',
  },
  {
    key: 'green_beige',
    label: 'أخضر طبيعي',
    primary: '#2D6A4F',
    secondary: '#B7950B',
    accent: '#E9F5EE',
    bg: '#FAFAF7',
    text: '#1C1C1C',
    heading: '#2D6A4F',
    border: '#D4E0D8',
  },
  {
    key: 'purple_pink',
    label: 'بنفسجي إبداعي',
    primary: '#5B2D8E',
    secondary: '#C0397C',
    accent: '#F3EEF9',
    bg: '#FFFFFF',
    text: '#1C1C1C',
    heading: '#5B2D8E',
    border: '#DDD4ED',
  },
  {
    key: 'orange_yellow',
    label: 'برتقالي نشيط',
    primary: '#C75000',
    secondary: '#E8A800',
    accent: '#FFF3E0',
    bg: '#FFFDF8',
    text: '#1C1C1C',
    heading: '#C75000',
    border: '#EDD8C0',
  },
  {
    key: 'gray_modern',
    label: 'رمادي عصري',
    primary: '#374151',
    secondary: '#6B7280',
    accent: '#F3F4F6',
    bg: '#FFFFFF',
    text: '#111827',
    heading: '#374151',
    border: '#E5E7EB',
  },
  {
    key: 'red_academic',
    label: 'أحمر أكاديمي',
    primary: '#991B1B',
    secondary: '#C9A227',
    accent: '#FEF2F2',
    bg: '#FFFEF9',
    text: '#1C1C1C',
    heading: '#991B1B',
    border: '#F5C6C6',
  },
  {
    key: 'teal_white',
    label: 'أزرق فيروزي',
    primary: '#0D7490',
    secondary: '#22D3EE',
    accent: '#ECFEFF',
    bg: '#FFFFFF',
    text: '#0F172A',
    heading: '#0D7490',
    border: '#BAE6FD',
  },
  {
    key: 'brown_warm',
    label: 'بني دافئ',
    primary: '#78350F',
    secondary: '#D97706',
    accent: '#FEF3C7',
    bg: '#FFFBF0',
    text: '#1C1C1C',
    heading: '#78350F',
    border: '#E8D5B7',
  },
];

const ARABIC_FONTS = [
  { value: 'Cairo', label: 'Cairo — القاهرة' },
  { value: 'Amiri', label: 'Amiri — أميري' },
  { value: 'Noto Naskh Arabic', label: 'Noto Naskh — نوتو نسخ' },
  { value: 'Tajawal', label: 'Tajawal — تجوال' },
  { value: 'Readex Pro', label: 'Readex Pro — ريدكس' },
  { value: 'Almarai', label: 'Almarai — المراعي' },
];

const MARGIN_PRESETS = [
  { key: 'normal', label: 'عادي', value: 20 },
  { key: 'narrow', label: 'ضيق', value: 12 },
  { key: 'wide', label: 'واسع', value: 25 },
  { key: 'custom', label: 'مخصص', value: 15 },
];

const STEP_LABELS = [
  { icon: <BookOpen size={16} />, label: 'النوع' },
  { icon: <FileText size={16} />, label: 'التفاصيل' },
  { icon: <LayoutTemplate size={16} />, label: 'الصفحة' },
  { icon: <Palette size={16} />, label: 'الألوان' },
  { icon: <Type size={16} />, label: 'الخطوط' },
  { icon: <Sparkles size={16} />, label: 'الملخص' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectWizard({ open, onClose }: Props) {
  const router = useRouter();
  const addProject = useProjectStore((s) => s.addProject);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    bookType: null,
    grade: 'الصف الأول',
    direction: 'rtl',
    pageCount: 80,
    pageSize: 'A4',
    orientation: 'portrait',
    bleed: 3,
    margins: 'normal',
    colorTheme: 'blue_gold',
    headingFont: 'Cairo',
    bodyFont: 'Tajawal',
    fontSize: 'normal',
    lineSpacing: 1.8,
    projectName: '',
  });
  const [creating, setCreating] = useState(false);

  function update<K extends keyof WizardData>(key: K, val: WizardData[K]) {
    setData((d) => ({ ...d, [key]: val }));
  }

  function canAdvance(): boolean {
    if (step === 0) return data.bookType !== null;
    if (step === 1) return !!data.grade;
    return true;
  }

  function handleNext() {
    if (step < 5) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleCreate() {
    if (!data.bookType) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 600));

    const selectedTheme = COLOR_THEMES.find((t) => t.key === data.colorTheme) ?? COLOR_THEMES[0];
    const selectedSize = PAGE_SIZES.find((s) => s.key === data.pageSize) ?? PAGE_SIZES[0];
    const marginVal = MARGIN_PRESETS.find((m) => m.key === data.margins)?.value ?? 20;

    const theme: ProjectTheme = {
      ...defaultTheme,
      colors: {
        primary: selectedTheme.primary,
        secondary: selectedTheme.secondary,
        accent: selectedTheme.accent,
        background: selectedTheme.bg,
        text: selectedTheme.text,
        heading: selectedTheme.heading,
        border: selectedTheme.border,
      },
      fonts: {
        heading: data.headingFont,
        body: data.bodyFont,
        ui: 'Cairo',
      },
      lineSpacing: data.lineSpacing,
    };

    const docSettings: DocumentSettings = {
      ...defaultDocumentSettings,
      width: selectedSize.w,
      height: data.orientation === 'portrait' ? selectedSize.h : selectedSize.w,
      orientation: data.orientation,
      bleed: data.bleed,
      margins: { top: marginVal, right: marginVal, bottom: marginVal, left: marginVal },
    };

    const project = addProject({
      name: data.projectName.trim() || `${BOOK_TYPES.find((b) => b.type === data.bookType)?.label ?? 'مشروع جديد'} - ${data.grade}`,
      bookType: data.bookType,
      grade: data.grade,
      documentSettings: docSettings,
      theme,
      fonts: [data.headingFont, data.bodyFont],
      styles: [],
      pages: [],
    });

    setCreating(false);
    onClose();
    router.push(`/editor/${project.id}`);
  }

  function handleClose() {
    onClose();
    setTimeout(() => { setStep(0); }, 300);
  }

  const selectedTheme = COLOR_THEMES.find((t) => t.key === data.colorTheme) ?? COLOR_THEMES[0];

  const footer = (
    <div className="flex items-center justify-between">
      <Button
        variant="secondary"
        size="md"
        onClick={step === 0 ? handleClose : handleBack}
        icon={<ChevronRight size={16} />}
      >
        {step === 0 ? 'إلغاء' : 'السابق'}
      </Button>
      <div className="text-xs text-gray-400 font-cairo">
        الخطوة {step + 1} من 6
      </div>
      {step < 5 ? (
        <Button
          variant="primary"
          size="md"
          onClick={handleNext}
          disabled={!canAdvance()}
          iconRight={<ChevronLeft size={16} />}
        >
          التالي
        </Button>
      ) : (
        <Button
          variant="gold"
          size="md"
          onClick={handleCreate}
          loading={creating}
          disabled={!data.projectName.trim()}
          icon={<Sparkles size={16} />}
        >
          إنشاء الكتاب
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="إنشاء مشروع جديد"
      size="xl"
      footer={footer}
    >
      <div className="p-6" dir="rtl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((s, i) => (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex flex-col items-center gap-1 text-xs font-cairo transition-colors',
                  i === step
                    ? 'text-[#1B3A6B] font-semibold'
                    : i < step
                    ? 'text-[#C9A227] cursor-pointer hover:text-[#b8921f]'
                    : 'text-gray-400 cursor-default'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    i === step
                      ? 'bg-[#1B3A6B] border-[#1B3A6B] text-white'
                      : i < step
                      ? 'bg-[#C9A227] border-[#C9A227] text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                  )}
                >
                  {i < step ? <Check size={14} /> : s.icon}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div
              className="bg-[#1B3A6B] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Step 0: Book Type ──────────────────────────── */}
        {step === 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#1B3A6B] font-cairo mb-1">اختر نوع الكتاب</h3>
            <p className="text-sm text-gray-500 font-cairo mb-4">اختر الفئة التي تناسب مشروعك التعليمي</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BOOK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => update('bookType', bt.type)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-center',
                    data.bookType === bt.type
                      ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B] shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#1B3A6B]/40 hover:bg-gray-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      data.bookType === bt.type ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {bt.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm font-cairo">{bt.label}</div>
                    <div className="text-xs text-gray-400 font-cairo mt-0.5">{bt.desc}</div>
                  </div>
                  {data.bookType === bt.type && (
                    <div className="absolute top-2 left-2 w-4 h-4 bg-[#1B3A6B] rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Book Details ───────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A6B] font-cairo mb-1">تفاصيل الكتاب</h3>
              <p className="text-sm text-gray-500 font-cairo mb-4">حدد المرحلة الدراسية والخصائص العامة</p>
            </div>
            <Select
              label="المرحلة الدراسية"
              value={data.grade}
              onChange={(v) => update('grade', v)}
              options={GRADES.map((g) => ({ value: g, label: g }))}
              dir="rtl"
              required
            />
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">
                اتجاه النص
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['rtl', 'ltr'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => update('direction', dir)}
                    className={cn(
                      'flex items-center justify-center gap-3 p-3 rounded-xl border-2 transition-all',
                      data.direction === dir
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <span className="font-cairo font-bold text-sm">
                      {dir === 'rtl' ? 'من اليمين ← RTL' : 'من اليسار → LTR'}
                    </span>
                    {data.direction === dir && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="عدد الصفحات"
              type="number"
              value={String(data.pageCount)}
              onChange={(e) => update('pageCount', Math.max(1, parseInt(e.target.value) || 80))}
              hint="الرقم الافتراضي 80 صفحة"
              dir="ltr"
            />
          </div>
        )}

        {/* ── Step 2: Page Setup ─────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A6B] font-cairo mb-1">إعداد الصفحة</h3>
              <p className="text-sm text-gray-500 font-cairo mb-4">حدد حجم الصفحة والهوامش</p>
            </div>

            {/* Page size */}
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">حجم الصفحة</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PAGE_SIZES.map((ps) => (
                  <button
                    key={ps.key}
                    onClick={() => update('pageSize', ps.key)}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center',
                      data.pageSize === ps.key
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {/* Mini page preview */}
                    <div
                      className={cn(
                        'border-2 rounded-sm mb-1',
                        data.pageSize === ps.key ? 'border-[#1B3A6B]' : 'border-gray-300'
                      )}
                      style={{
                        width: ps.key === 'Square' ? 24 : 18,
                        height: ps.key === 'Square' ? 24 : ps.key === 'A5' ? 30 : 26,
                      }}
                    />
                    <span className="text-xs font-bold font-cairo">{ps.label}</span>
                    <span className="text-xs text-gray-400 font-cairo" style={{ fontSize: 10 }}>{ps.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">الاتجاه</label>
              <div className="grid grid-cols-2 gap-3">
                {(['portrait', 'landscape'] as const).map((orient) => (
                  <button
                    key={orient}
                    onClick={() => update('orientation', orient)}
                    className={cn(
                      'flex items-center justify-center gap-3 p-3 rounded-xl border-2 transition-all',
                      data.orientation === orient
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'border-2 rounded-sm',
                        data.orientation === orient ? 'border-[#1B3A6B]' : 'border-gray-300'
                      )}
                      style={{
                        width: orient === 'portrait' ? 16 : 24,
                        height: orient === 'portrait' ? 22 : 14,
                      }}
                    />
                    <span className="font-cairo text-sm font-semibold">
                      {orient === 'portrait' ? 'عمودي' : 'أفقي'}
                    </span>
                    {data.orientation === orient && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bleed */}
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">نزيف الطباعة</label>
              <div className="flex gap-2">
                {[0, 3, 5].map((b) => (
                  <button
                    key={b}
                    onClick={() => update('bleed', b)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border-2 text-sm font-cairo font-semibold transition-all',
                      data.bleed === b
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {b === 0 ? 'بدون' : `${b}مم`}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">الهوامش</label>
              <div className="grid grid-cols-4 gap-2">
                {MARGIN_PRESETS.map((mp) => (
                  <button
                    key={mp.key}
                    onClick={() => update('margins', mp.key)}
                    className={cn(
                      'py-2 px-1 rounded-lg border-2 text-xs font-cairo font-semibold transition-all text-center',
                      data.margins === mp.key
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <div>{mp.label}</div>
                    <div className="text-gray-400" style={{ fontSize: 10 }}>{mp.value}مم</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Color Theme ────────────────────────── */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-bold text-[#1B3A6B] font-cairo mb-1">نظام الألوان</h3>
            <p className="text-sm text-gray-500 font-cairo mb-4">اختر لوحة الألوان المناسبة لكتابك</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => update('colorTheme', theme.key)}
                  className={cn(
                    'rounded-xl border-2 overflow-hidden transition-all',
                    data.colorTheme === theme.key
                      ? 'border-[#1B3A6B] shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  )}
                >
                  {/* Color preview */}
                  <div className="h-14 relative" style={{ background: theme.primary }}>
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white/50"
                      style={{ background: theme.secondary }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-5"
                      style={{ background: theme.accent }}
                    />
                    {data.colorTheme === theme.key && (
                      <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <Check size={11} className="text-[#1B3A6B]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2" style={{ background: theme.bg }}>
                    <div className="text-xs font-bold font-cairo" style={{ color: theme.heading }}>
                      {theme.label}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[theme.primary, theme.secondary, theme.accent].map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Typography ────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A6B] font-cairo mb-1">الخطوط والطباعة</h3>
              <p className="text-sm text-gray-500 font-cairo mb-4">اختر خطوط وإعدادات الطباعة</p>
            </div>

            <Select
              label="خط العناوين"
              value={data.headingFont}
              onChange={(v) => update('headingFont', v)}
              options={ARABIC_FONTS}
              dir="rtl"
            />

            <Select
              label="خط النص"
              value={data.bodyFont}
              onChange={(v) => update('bodyFont', v)}
              options={ARABIC_FONTS}
              dir="rtl"
            />

            {/* Font size */}
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">حجم الخط</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'small', label: 'صغير', pt: '11pt' },
                  { key: 'normal', label: 'عادي', pt: '12pt' },
                  { key: 'large', label: 'كبير', pt: '14pt' },
                ].map((fs) => (
                  <button
                    key={fs.key}
                    onClick={() => update('fontSize', fs.key)}
                    className={cn(
                      'py-2 rounded-xl border-2 transition-all text-center',
                      data.fontSize === fs.key
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <div className="font-bold font-cairo text-sm">{fs.label}</div>
                    <div className="text-xs text-gray-400 font-cairo">{fs.pt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Line spacing */}
            <div>
              <label className="text-sm font-semibold text-[#1B3A6B] font-cairo block mb-2">
                تباعد الأسطر: {data.lineSpacing}
              </label>
              <div className="flex gap-2">
                {[1.4, 1.6, 1.8, 2.0].map((ls) => (
                  <button
                    key={ls}
                    onClick={() => update('lineSpacing', ls)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border-2 text-sm font-cairo font-semibold transition-all',
                      data.lineSpacing === ls
                        ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 text-[#1B3A6B]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {ls}
                  </button>
                ))}
              </div>
            </div>

            {/* Font preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-400 font-cairo mb-2">معاينة الخط</p>
              <p
                className="text-[#1B3A6B] font-bold mb-1"
                style={{ fontFamily: data.headingFont, fontSize: 16, lineHeight: data.lineSpacing }}
              >
                عنوان الفصل الأول: مقدمة في اللغة
              </p>
              <p
                className="text-gray-700 text-sm"
                style={{ fontFamily: data.bodyFont, fontSize: 13, lineHeight: data.lineSpacing }}
              >
                اللغة العربية لغة القرآن الكريم، وهي من أغنى لغات العالم بمفرداتها وتراكيبها.
                تمتد جذورها إلى آلاف السنين وتضم ملايين الناطقين بها حول العالم.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 5: Summary + Confirm ─────────────────── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#1B3A6B] font-cairo mb-1">ملخص المشروع</h3>
              <p className="text-sm text-gray-500 font-cairo mb-4">راجع الإعدادات وأدخل اسم المشروع</p>
            </div>

            <Input
              label="اسم المشروع"
              placeholder={`${BOOK_TYPES.find((b) => b.type === data.bookType)?.label ?? 'مشروع'} - ${data.grade}`}
              value={data.projectName}
              onChange={(e) => update('projectName', e.target.value)}
              required
              dir="rtl"
              hint="أدخل اسماً مميزاً لمشروعك"
            />

            {/* Summary grid */}
            <div className="bg-[#f4f6fb] rounded-xl p-4 space-y-3">
              {[
                { label: 'نوع الكتاب', value: BOOK_TYPES.find((b) => b.type === data.bookType)?.label ?? '' },
                { label: 'المرحلة الدراسية', value: data.grade },
                { label: 'اتجاه النص', value: data.direction === 'rtl' ? 'من اليمين إلى اليسار' : 'من اليسار إلى اليمين' },
                { label: 'حجم الصفحة', value: `${data.pageSize} — ${data.orientation === 'portrait' ? 'عمودي' : 'أفقي'}` },
                { label: 'عدد الصفحات', value: `${data.pageCount} صفحة` },
                { label: 'نظام الألوان', value: COLOR_THEMES.find((t) => t.key === data.colorTheme)?.label ?? '' },
                { label: 'خط العناوين', value: data.headingFont },
                { label: 'خط النص', value: data.bodyFont },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500 font-cairo">{label}</span>
                  <span className="text-xs font-semibold text-[#1B3A6B] font-cairo text-left">{value}</span>
                </div>
              ))}
            </div>

            {/* Color preview strip */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 font-cairo">لوحة الألوان:</span>
              <div className="flex gap-1">
                {[selectedTheme.primary, selectedTheme.secondary, selectedTheme.accent, selectedTheme.bg].map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
