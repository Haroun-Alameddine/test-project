'use client';

import React from 'react';
import type { Project, ProjectPage, CanvasObject, TextObjectData, ImageObjectData, ShapeObjectData } from '@/types';
import { useAppStore } from '@/lib/store';
import { cn, arabicFonts } from '@/lib/utils';
import ColorPicker from './ColorPicker';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';

interface RightSidebarProps {
  project: Project;
  currentPage: ProjectPage;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{children}</label>;
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-3', className)}>{children}</div>;
}

function NumberInput({ value, onChange, min, max, step = 1, suffix }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400 text-right"
        dir="ltr"
      />
      {suffix && <span className="text-xs text-gray-400 whitespace-nowrap">{suffix}</span>}
    </div>
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-right"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Text Properties Panel ──────────────────────────────────────────────────────
function TextPanel({ obj, pageId }: { obj: CanvasObject; pageId: string }) {
  const { updateObject } = useAppStore();
  const data = obj.data as TextObjectData;
  const s = data.style;

  const updateStyle = (updates: Partial<TextObjectData['style']>) => {
    updateObject(pageId, obj.id, { data: { ...data, style: { ...s, ...updates } } as any });
  };
  const updateData = (updates: Partial<TextObjectData>) => {
    updateObject(pageId, obj.id, { data: { ...data, ...updates } as any });
  };

  return (
    <div className="p-3 space-y-0">
      {/* Font family */}
      <Row>
        <Label>الخط</Label>
        <SelectInput
          value={s.fontFamily || 'Cairo, sans-serif'}
          onChange={(v) => updateStyle({ fontFamily: v })}
          options={arabicFonts.map((f) => ({ value: f.value, label: f.label }))}
        />
      </Row>

      {/* Font size + weight */}
      <Row>
        <Label>الحجم والوزن</Label>
        <div className="flex gap-2">
          <NumberInput value={s.fontSize || 14} onChange={(v) => updateStyle({ fontSize: v })} min={6} max={120} suffix="pt" />
          <SelectInput
            value={s.fontWeight || '400'}
            onChange={(v) => updateStyle({ fontWeight: v })}
            options={[
              { value: '300', label: 'رفيع' },
              { value: '400', label: 'عادي' },
              { value: '600', label: 'شبه عريض' },
              { value: '700', label: 'عريض' },
              { value: '900', label: 'أسود' },
            ]}
          />
        </div>
      </Row>

      {/* Text color */}
      <Row>
        <Label>لون النص</Label>
        <ColorPicker value={s.color || '#1A202C'} onChange={(c) => updateStyle({ color: c })} />
      </Row>

      {/* Alignment */}
      <Row>
        <Label>المحاذاة</Label>
        <div className="flex gap-1">
          {[
            { value: 'right', icon: AlignRight },
            { value: 'center', icon: AlignCenter },
            { value: 'left', icon: AlignLeft },
            { value: 'justify', icon: AlignJustify },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateStyle({ align: value as any })}
              className={cn(
                'flex-1 h-8 flex items-center justify-center rounded border transition-colors',
                s.align === value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </Row>

      {/* Direction */}
      <Row>
        <Label>الاتجاه</Label>
        <div className="flex gap-2">
          {['rtl', 'ltr'].map((dir) => (
            <button
              key={dir}
              onClick={() => updateStyle({ direction: dir as any })}
              className={cn(
                'flex-1 py-1.5 rounded border text-xs font-medium transition-colors',
                s.direction === dir
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {dir === 'rtl' ? 'RTL ←' : '→ LTR'}
            </button>
          ))}
        </div>
      </Row>

      {/* Line height */}
      <Row>
        <Label>ارتفاع السطر</Label>
        <NumberInput value={s.lineHeight || 1.6} onChange={(v) => updateStyle({ lineHeight: v })} min={1} max={4} step={0.1} />
      </Row>

      {/* Background */}
      <Row>
        <Label>خلفية مربع النص</Label>
        <ColorPicker value={data.background || 'transparent'} onChange={(c) => updateData({ background: c })} />
      </Row>

      {/* Border */}
      <Row>
        <Label>حد المربع</Label>
        <div className="flex gap-2">
          <ColorPicker value={data.borderColor || '#E2E8F0'} onChange={(c) => updateData({ borderColor: c })} />
          <NumberInput value={data.borderWidth || 0} onChange={(v) => updateData({ borderWidth: v })} min={0} max={20} suffix="px" />
        </div>
      </Row>

      {/* Border radius */}
      <Row>
        <Label>تدوير الزوايا</Label>
        <NumberInput value={data.borderRadius || 0} onChange={(v) => updateData({ borderRadius: v })} min={0} max={50} suffix="px" />
      </Row>

      {/* Padding */}
      <Row>
        <Label>الحشو الداخلي</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <div key={side}>
              <span className="text-[10px] text-gray-400 block text-center mb-0.5">
                {side === 'top' ? 'أعلى' : side === 'right' ? 'يمين' : side === 'bottom' ? 'أسفل' : 'يسار'}
              </span>
              <NumberInput
                value={data.padding?.[side] ?? 8}
                onChange={(v) => updateData({ padding: { ...(data.padding || { top: 8, right: 8, bottom: 8, left: 8 }), [side]: v } })}
                min={0}
                max={80}
                suffix="px"
              />
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}

// ── Image Properties Panel ─────────────────────────────────────────────────────
function ImagePanel({ obj, pageId }: { obj: CanvasObject; pageId: string }) {
  const { updateObject } = useAppStore();
  const data = obj.data as ImageObjectData;

  const updateData = (updates: Partial<ImageObjectData>) => {
    updateObject(pageId, obj.id, { data: { ...data, ...updates } as any });
  };

  return (
    <div className="p-3 space-y-0">
      <Row>
        <Label>ملاءمة الصورة</Label>
        <SelectInput
          value={data.objectFit || 'cover'}
          onChange={(v) => updateData({ objectFit: v as any })}
          options={[
            { value: 'cover', label: 'تغطية' },
            { value: 'contain', label: 'احتواء' },
            { value: 'fill', label: 'تمتد' },
          ]}
        />
      </Row>
      <Row>
        <Label>تدوير الزوايا</Label>
        <NumberInput value={data.borderRadius || 0} onChange={(v) => updateData({ borderRadius: v })} min={0} max={100} suffix="px" />
      </Row>
      <Row>
        <Label>لون الحد</Label>
        <div className="flex gap-2">
          <ColorPicker value={data.borderColor || 'transparent'} onChange={(c) => updateData({ borderColor: c })} />
          <NumberInput value={data.borderWidth || 0} onChange={(v) => updateData({ borderWidth: v })} min={0} max={20} suffix="px" />
        </div>
      </Row>
    </div>
  );
}

// ── Shape Properties Panel ─────────────────────────────────────────────────────
function ShapePanel({ obj, pageId }: { obj: CanvasObject; pageId: string }) {
  const { updateObject } = useAppStore();
  const data = obj.data as ShapeObjectData;

  const updateData = (updates: Partial<ShapeObjectData>) => {
    updateObject(pageId, obj.id, { data: { ...data, ...updates } as any });
  };

  return (
    <div className="p-3 space-y-0">
      <Row>
        <Label>لون التعبئة</Label>
        <ColorPicker value={data.fill || '#3B82F6'} onChange={(c) => updateData({ fill: c })} />
      </Row>
      <Row>
        <Label>لون الحد</Label>
        <div className="flex gap-2">
          <ColorPicker value={data.stroke || 'transparent'} onChange={(c) => updateData({ stroke: c })} />
          <NumberInput value={data.strokeWidth || 0} onChange={(v) => updateData({ strokeWidth: v })} min={0} max={20} suffix="px" />
        </div>
      </Row>
      <Row>
        <Label>تدوير الزوايا</Label>
        <NumberInput value={data.borderRadius || 0} onChange={(v) => updateData({ borderRadius: v })} min={0} max={100} suffix="px" />
      </Row>
    </div>
  );
}

// ── Page Properties Panel ──────────────────────────────────────────────────────
function PagePanel({ page, pageId }: { page: ProjectPage; pageId: string }) {
  const { updatePage } = useAppStore();

  return (
    <div className="p-3 space-y-0">
      <Row>
        <Label>خلفية الصفحة</Label>
        <ColorPicker
          value={page.background || '#ffffff'}
          onChange={(c) => updatePage(pageId, { background: c })}
        />
      </Row>
      <Row>
        <Label>نوع الصفحة</Label>
        <SelectInput
          value={page.templateType || 'empty'}
          onChange={(v) => updatePage(pageId, { templateType: v as any })}
          options={[
            { value: 'cover', label: 'غلاف' },
            { value: 'unit_opener', label: 'افتتاحية الوحدة' },
            { value: 'lesson', label: 'درس' },
            { value: 'reading_text', label: 'نص قراءة' },
            { value: 'activity', label: 'نشاط' },
            { value: 'question', label: 'أسئلة' },
            { value: 'vocabulary', label: 'مفردات' },
            { value: 'summary', label: 'خلاصة' },
            { value: 'empty', label: 'صفحة فارغة' },
            { value: 'back_cover', label: 'الغلاف الخلفي' },
            { value: 'table_of_contents', label: 'فهرس المحتويات' },
          ]}
        />
      </Row>
      <Row>
        <Label>معلومات الصفحة</Label>
        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded p-2">
          <div className="flex justify-between"><span>العرض:</span> <span dir="ltr">{page.width}px</span></div>
          <div className="flex justify-between"><span>الارتفاع:</span> <span dir="ltr">{page.height}px</span></div>
          <div className="flex justify-between"><span>العناصر:</span> <span>{page.objects?.length || 0}</span></div>
          <div className="flex justify-between"><span>رقم الصفحة:</span> <span>{page.pageNumber}</span></div>
        </div>
      </Row>
    </div>
  );
}

// ── Position & Size Panel ──────────────────────────────────────────────────────
function PositionPanel({ obj, pageId }: { obj: CanvasObject; pageId: string }) {
  const { updateObject } = useAppStore();

  return (
    <div className="p-3 border-b border-gray-100">
      <Label>الموضع والحجم</Label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'X', key: 'x' as const },
          { label: 'Y', key: 'y' as const },
          { label: 'العرض', key: 'width' as const },
          { label: 'الارتفاع', key: 'height' as const },
        ].map(({ label, key }) => (
          <div key={key}>
            <span className="text-[10px] text-gray-400 block mb-0.5">{label}</span>
            <NumberInput
              value={Math.round(obj[key] as number)}
              onChange={(v) => updateObject(pageId, obj.id, { [key]: v })}
              min={key === 'width' || key === 'height' ? 10 : undefined}
              suffix="px"
            />
          </div>
        ))}
      </div>
      <div className="mt-2">
        <span className="text-[10px] text-gray-400 block mb-0.5">الدوران</span>
        <NumberInput
          value={obj.rotation || 0}
          onChange={(v) => updateObject(pageId, obj.id, { rotation: v })}
          min={-360}
          max={360}
          suffix="°"
        />
      </div>
    </div>
  );
}

// ── Main RightSidebar ──────────────────────────────────────────────────────────
export default function RightSidebar({ project, currentPage }: RightSidebarProps) {
  const { selectedObjectId } = useAppStore();

  const selectedObj = selectedObjectId
    ? currentPage?.objects?.find((o) => o.id === selectedObjectId)
    : null;

  const getObjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'مربع نص',
      image: 'صورة',
      shape: 'شكل',
      table: 'جدول',
      line: 'خط',
      icon: 'أيقونة',
    };
    return labels[type] || type;
  };

  return (
    <aside
      className="w-[280px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden"
      style={{ direction: 'rtl' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          {selectedObj ? `خصائص: ${getObjectTypeLabel(selectedObj.type)}` : 'خصائص الصفحة'}
        </h3>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {selectedObj ? (
          <>
            {/* Position + size (always shown for objects) */}
            <PositionPanel obj={selectedObj} pageId={currentPage.id} />

            {/* Type-specific panel */}
            {selectedObj.type === 'text' && (
              <TextPanel obj={selectedObj} pageId={currentPage.id} />
            )}
            {selectedObj.type === 'image' && (
              <ImagePanel obj={selectedObj} pageId={currentPage.id} />
            )}
            {selectedObj.type === 'shape' && (
              <ShapePanel obj={selectedObj} pageId={currentPage.id} />
            )}
          </>
        ) : (
          currentPage && <PagePanel page={currentPage} pageId={currentPage.id} />
        )}
      </div>

      {/* Project info footer */}
      <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
        <div className="text-[10px] text-gray-400 space-y-0.5">
          <div className="flex justify-between">
            <span>المشروع:</span>
            <span className="truncate max-w-[140px]">{project.name}</span>
          </div>
          <div className="flex justify-between">
            <span>الصفحات:</span>
            <span>{project.pages.length}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
